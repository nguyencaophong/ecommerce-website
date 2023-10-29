const locationsController = require('../../controllers/admin/locations.controller');

module.exports = require('express').Router()
  .get('/',locationsController.read)
  .post('/',locationsController.create)
  .put( '/:id',locationsController.update)
  .delete( '/:id',locationsController.delete)

  