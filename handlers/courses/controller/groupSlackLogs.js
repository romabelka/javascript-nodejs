const moment = require('momentWithLocale');
const CourseParticipant = require('../models/courseParticipant');

const {
  SlackUser,
  SlackChannel,
  SlackMessage
} = require('slack');

const { parseMessages } = require('../lib/slackMessages');

exports.get = function* (next) {
  const group = this.groupBySlug;
  const { id } = group.slackGroup;

  if (!this.user) {
    this.throw(401);
  }

  const participant = yield CourseParticipant.findOne({
    isActive: true,
    group: group._id,
    user: this.user._id
  });

  if (!this.isAdmin && !this.user._id.equals(group.teacher._id) && !participant) {
    this.throw(403);
  }

  // 2016-08-22
  const { start_date, end_date } = this.query;

  const startDate = moment(
    start_date ?
      new Date(start_date) :
      new Date()
  ).startOf('day');

  const endDate = moment(
    end_date ?
      new Date(end_date) :
      new Date()
  ).endOf('day');


  const messages = yield SlackMessage.find({
    channelId: id,
    date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
  }).sort({ ts: 1 }).populate('author');

  const parsedMessages = yield* parseMessages(messages);

  this.locals = Object.assign({}, this.locals, {
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
    messages: parsedMessages
  });

  this.body = this.render('groupSlackLogs');
};
