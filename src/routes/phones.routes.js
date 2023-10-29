const phonesController = require('../controllers/phones.controller')

module.exports = require('express').Router()
  .post('/', phonesController.create)
