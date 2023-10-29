const permissionController = require('../../controllers/admin/permissions.controller')

module.exports = require('express').Router()
  .get('/',permissionController.read)

