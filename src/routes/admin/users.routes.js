const usersController = require('../../controllers/admin/users.controller');

module.exports = require('express').Router()
  .post('/',usersController.create)
  .get('/',usersController.list)
  .patch('/:id/role', usersController.updateRoles)
  .patch('/:id/block',usersController.block)
  .delete('/:id',usersController.delete)

  