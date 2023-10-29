const passport = require('passport');
const authController = require('../controllers/auth.controller')
const { apiSignInLoginLimiter } = require('../middleware/rate_limiter.middleware');

module.exports = require('express').Router()
  .post( '/login',authController.login )
  .patch( '/:username',authController.resetPassword )
  .delete( '/logout',passport.authenticate('jwt',{session:false}),authController.logout )
  .post('/refresh',authController.refresh)
