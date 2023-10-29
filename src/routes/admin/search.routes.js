const searchController = require('../../controllers/admin/search.controller');

module.exports = require('express').Router()
  .get('/',searchController.read)

