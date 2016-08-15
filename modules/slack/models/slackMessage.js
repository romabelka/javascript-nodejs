'use strict';

const mongoose = require('lib/mongoose');

const schema = new mongoose.Schema({
  channelId:  {
    type:     String,
    required: true,
    index: true
  },
  userId:  {
    type:     String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  file: {
    name: String,
    title: String,
    mimetype: String,
    filetype: String,
    pretty_type: String,
    permalink: String,
    preview: String
  },
  ts: {
    // https://api.slack.com/events/message
    // actually ts is a timestamp but in slack api
    // it's a `timestamp.counter`.
    // ts: '1470322881.000009'
    // ts: '1470322881.000008'
    type: String,
    required: true
  },
  // we convert ts into date for quering
  date: {
    type: Date,
    required: true,
    index: true
  }
});

schema.virtual('author', {
  ref: 'SlackUser',
  localField: 'userId',
  foreignField: 'userId',

  // https://github.com/Automattic/mongoose/issues/4263
  justOne: true
});

schema.index({channelId: 1, ts: 1, date: 1});

module.exports = mongoose.model('SlackMessage', schema);
