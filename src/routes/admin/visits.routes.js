const visitsController = require('../../controllers/admin/visits.controller');

module.exports = require('express').Router()
  .get('/',visitsController.visit)

