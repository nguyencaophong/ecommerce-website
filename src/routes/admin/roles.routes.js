const rolesController = require('../../controllers/admin/roles.controller')

module.exports = require('express').Router()
  .post('/',rolesController.create)
  .get('/',rolesController.list)
  .put('/:id',rolesController.update)
  .delete('/:id',rolesController.delete)
