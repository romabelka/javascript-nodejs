const {
  SlackUser,
  SlackChannel,
  SlackMessage
} = require('slack');

const { flatten } = require('lodash');
const LANG = require('config').lang;
const moment = require('momentWithLocale');
const MarkdownIt = require('markdown-it');

function deentitize(str) {
    return str
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&');
};

function getMentionedUsers(messages) {
  const reg = new RegExp(/<@([\d\w]+)>/g);
  return messages
    .map(({ text }) => {
      // get user ids from string like "<@U0K8CDSBX> <@U1KGT8LQN>"
      let ids = [];
      let result;
      while (result = reg.exec(text)) {
        ids.push(result[1]);
      }

      return ids;
    });
}

function insertEmoji(text) {
  const unsupportedIcons = {
    'slightly_smiling_face': 'smile'
  };

  return text.replace(/(?::)([\w]+)(?::)/g,
   (_, i) => `<i class="em em-${unsupportedIcons[i] || i}"></i>`
  );
}


function formatMessage(message, users) {
  const { text, fallback } = message;

  let formatedText = text || fallback || '';

  // handle user mention
  formatedText = formatedText.replace(/<@([\d\w]+)>/g,
   (_, id) => {
     const user = users.find(({ userId }) => userId === id);
     return `@${user.name || id}`;
   }
  );

  formatedText = deentitize(formatedText);

  // handle channel mention <#C0PTF9T33|angular> -> #angular
  formatedText = formatedText.replace(/<#[\d\w]+\|(.*?)>/g, '#$1');

  // convert bold
  formatedText = formatedText.replace(/( |^)(\*{1}[^*]+\*{1})( |$)/g, ' *$2* ');

  // convert italic
  formatedText = formatedText.replace(/( |^)\_{1}([^_]+)\_{1}( |$)/g, ' *$2* ');

  // convert crossed out
  formatedText = formatedText.replace(/( |^)(\~{1}[^~]+\~{1})( |$)/g, ' ~$2~ ');

  const md = MarkdownIt({
    html:         false,        // Enable HTML tags in source
    breaks:       true,        // Convert '\n' in paragraphs into <br>
    linkify:      true,        // Autoconvert URL-like text to links
    typographer:  true
  });

  formatedText = md.render(formatedText);

  // convert emoji
  formatedText = insertEmoji(formatedText);

  return formatedText;
}

function* parseMessages(messages) {
  const userIds = flatten(getMentionedUsers(messages));
  let users;

  if (userIds.length) {
    users = yield SlackUser.find({ userId: { $in: userIds } });
  }

  // we have messages like a plain array but need to get this structure:
  // messages: [
  //   { date: 'September 7, 2016', messages: [
  //      { user: 'kuzroman', date: 'Sep 11, 2016 21:21', message: '))) Корня, сорян' },
  //      ...
  //   ] },
  //   { date: 'September 8, 2016', messages: [] }
  // ]

  const parsedMessages = messages.reduce((hash, message) => {
    const messageDate = moment(message.date);
    let attachments = [];

    const formattedDate = messageDate.format('MMMM D, YYYY');
    if (!hash[formattedDate]) {
      hash[formattedDate] = [];
    }

    const formatedText = formatMessage(message, users);
    if (message.attachments) {
      attachments = message.attachments.map(attachment => ({
        user: attachment.author_name,
        message: formatMessage(attachment, users)
      }));
    }

    hash[formattedDate].push({
      user: message.author.realName || message.author.name,
      date: messageDate.format('MMM D, YYYY HH:mm'),
      message: formatedText,
      attachments
    });

    return hash;
  }, {});

  return Object.keys(parsedMessages).map(date => {
    return {
      date,
      messages: parsedMessages[date]
    }
  });
};

exports.formatMessage = formatMessage;
exports.parseMessages = parseMessages;
