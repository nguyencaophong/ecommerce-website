const passport = require('passport');
const messageController = require('../controllers/message.controller');
const { decentralization } = require('../middleware/casl.middleware');

const transfer = require('../middleware/transfer.middleware');

module.exports = require('express')
  .Router()
  .post(
    '/',
    passport.authenticate('jwt', { session: false }),
    transfer.upload.array('messages'),
    messageController.create,
  )
  .get(
    '/:conversationId',
    passport.authenticate('jwt', { session: false }),
    messageController.read,
  )
  .get(
    '/:conversationId/latest',
    passport.authenticate('jwt', { session: false }),
    messageController.getLatestMessage,
  )
  .get(
    '/unseen/:conversationId/:receiverId',
    passport.authenticate('jwt', { session: false }),
    messageController.getUnseenMessages,
  )
  .put(
    '/seen/:conversationId/:receiverId',
    passport.authenticate('jwt', { session: false }),
    messageController.update,
  );
