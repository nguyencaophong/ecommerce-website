const emailsController = require('../controllers/emails.controller')

module.exports = require('express').Router()
  .post('/', emailsController.create)
