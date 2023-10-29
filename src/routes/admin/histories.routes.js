const historiesController = require('../../controllers/admin/histories.controller');

module.exports = require('express').Router()
  .get('/',historiesController.list)

