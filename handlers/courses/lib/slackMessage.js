const {
  SlackUser,
  SlackChannel,
  SlackMessage
} = require('slack');

const MarkdownIt = require('markdown-it');

function getMentionedUsers(messages) {
  return messages
    .map(({ text }) => {

      // "<@U0BM1CGQY|calvinchanubc> has joined the channel" | "<@U0BM1CGQY>"
      if (text.includes('<@U')) return text.match(/<@(U\d\w+)/)[1];

      return false;
    })
    .filter(Boolean);
}

function insertLink(text) {
  return `<a href="#" class="chat-messages__mention">${text}</a>`;
}

function insertBold(text) {
  return `**${text}**`;
}

function insertItalic(text) {
  return `*${text}*`;
}

function* parseMessages(messages) {
  const userIds = getMentionedUsers(messages);

  const users = yield SlackUser.find({ userId: { $in: userIds } });

  return messages.map(message => {
    let { text: formatedText } = message;

    // handle user mention
    if (formatedText.includes('<@U')) {

      const userId = formatedText.match(/<@(U\d\w+)/)[1];
      const user = users.find(({ userId }) => userId === userId);

      if (user)
        formatedText = formatedText.replace(/<@U.*>/, insertLink(`@${user.name}`));
    }

    // handle channel mention
    if (formatedText.includes('<#C')) {
      const channelName = formatedText.match(/<#C.*\|(.*)>/)[1];

      if (channelName)
        formatedText = formatedText.replace(/<#C.*>/, insertLink(`#${channelName}`));
    }

    // convert bold and italic to normal markdown
    const boldText = formatedText.match(/(^| )\*(.+)\*( |$)/);
    const italicText = formatedText.match(/(^| )_(.+)_( |$)/);

    if (boldText)
      formatedText = formatedText.replace(/\*.*\*/, insertBold(boldText[2]));

    if (italicText)
      formatedText = formatedText.replace(/_.*_/, insertItalic(italicText[2]));

    const md = MarkdownIt({
      html:         true,        // Enable HTML tags in source
      breaks:       true,         // Convert '\n' in paragraphs into <br>
      linkify:      true,         // Autoconvert URL-like text to links

      quotes:       '«»„“'
    });

    return Object.assign(message, { text: md.render(formatedText) });

  });
};

exports.parseMessages = parseMessages;
