const contactsController = require('../../controllers/admin/contacts.controller');

module.exports = require('express').Router()
  .get( '/',contactsController.list)
  .put( '/:id',contactsController.update)
  .delete( '/:id',contactsController.delete)
