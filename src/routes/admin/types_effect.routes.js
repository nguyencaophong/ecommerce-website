const typesEffectController = require('../../controllers/admin/types_effect.controller');

module.exports = require('express').Router()
  .get( '/',typesEffectController.list)
  .get( '/:id',typesEffectController.read)
  .post( '/',typesEffectController.create)
  .put( '/:id',typesEffectController.update)
  .delete( '/:id',typesEffectController.delete)
