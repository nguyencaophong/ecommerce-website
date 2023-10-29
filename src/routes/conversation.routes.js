const passport = require('passport');
const conversationController = require('../controllers/conversation.controller');

module.exports = require('express')
  .Router()
  .post(
    '/',
    passport.authenticate('jwt', { session: false }),
    conversationController.create,
  )
  .get(
    '/',
    passport.authenticate('jwt', { session: false }),
    conversationController.read,
  )
  .put(
    '/:conversationId',
    passport.authenticate('jwt', { session: false }),
    conversationController.update,
  );
