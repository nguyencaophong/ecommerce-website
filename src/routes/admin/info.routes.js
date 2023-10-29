const infoController = require('../../controllers/admin/info.controller');

module.exports = require("express")
  .Router()
  .get('/getTotal', infoController.getTotal)

