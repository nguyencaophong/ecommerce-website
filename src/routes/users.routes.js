const passport = require('passport')
const usersController = require('../controllers/user.controller')
const transfer = require('../middleware/transfer.middleware')

module.exports = require('express').Router()
  .post('/', usersController.create)
  .get('/:id', usersController.read)
  .get('/',passport.authenticate('jwt',{session:false}), usersController.read)
  .put('/',passport.authenticate('jwt',{session:false}), transfer.upload.single('avatar'), usersController.update)
  .patch('/change-password',passport.authenticate('jwt',{session:false}), usersController.changePassword)
  .post('/course/:id',passport.authenticate('jwt',{session:false}), usersController.registerCourse)
  
