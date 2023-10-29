const positionsController = require('../../controllers/admin/positions.controller');

module.exports = require('express').Router()
  .get( '/',positionsController.getAllPositionTeam)
  .get( '/:id',positionsController.getEditPositionTeam )
  .post( '',positionsController.postAddPositionTeam)
  .put( '/:id',positionsController.putEditTeamPosition)
  .delete( '/:id',positionsController.deleteTeamPosition)
