const passport = require('passport')
const studentController = require('../controllers/student.controller')
const {decentralization} = require('../middleware/casl.middleware');

module.exports = require('express').Router()
  .get('/',passport.authenticate('jwt',{session:false}),decentralization,studentController.read)
