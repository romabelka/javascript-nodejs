const sendMail = require('mailer').send;
const CourseInvite = require('../models/courseInvite');
const _ = require('lodash');
const log = require('log')();
const sendInvite = require('./sendInvite');
const CourseGroup = require('../models/courseGroup');

/**
 * create and send invites for the order
 * except those that already exist
 * @param order
 */
module.exports = function*(order) {

  // first create invites, (in case if mailer dies we have them all)
  var invites = yield createInvites(order);

  yield sendInvites(invites);

  return invites;

};

function* createInvites(order) {

  var emails = order.data.emails;

  // get existing invites, so that we won't recreate them
  var existingInvites = yield CourseInvite.find({ order: order._id }).exec();
  var existingInviteByEmails = _.indexBy(existingInvites, 'email');

  log.debug("existing invites", existingInviteByEmails);

  // get existing participants, they don't need invites
  var group = yield CourseGroup.findById(order.data.group).exec();
  yield CourseGroup.populate(group, {path: 'participants.user'});
  var participantsByEmail = _.indexBy(_.pluck(group.participants, 'user'), 'email');

  var invites = [];
  for (var i = 0; i < emails.length; i++) {
    var email = emails[i];
    if (participantsByEmail[email]) continue;    // in group already
    if (existingInviteByEmails[email]) continue; // invite exists already

    log.debug("create invite for email", email);

    var invite = new CourseInvite({
      order: order._id,
      group: group._id,
      // max(now + 7 days, course start + 7 days)
      validUntil: new Date( Math.max(Date.now(), group.dateStart) + 7 * 24 * 86400 * 1e3),
      email: email
    });
    invites.push(invite);

    yield invite.persist();
  }

  return invites;
}

function* sendInvites(invites) {

  for (var i = 0; i < invites.length; i++) {
    var invite = invites[i];
    log.debug("send invite", invite);
    yield* sendInvite(invite);
  }

}
