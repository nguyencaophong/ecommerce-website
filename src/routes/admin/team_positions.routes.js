const teamPositionController = require('../../controllers/admin/positions.controller');

module.exports = require('express').Router()
  .get( '/',teamPositionController.list)
  .get( '/:id',teamPositionController.read )
  .post( '/',teamPositionController.create)
  .put( '/:id',teamPositionController.update)
  .delete( '/:id',teamPositionController.delete)
