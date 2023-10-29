const teamsController = require('../../controllers/admin/teams.controller');
const transfer = require('../../middleware/transfer.middleware');

module.exports = require('express')
  .Router()
  .get('/', teamsController.list)
  .get('/:id', teamsController.read)
  .post(
    '/',
    transfer.upload.single(transfer.FIELD_NAME_UPLOAD.IMAGE_AVATAR),
    teamsController.create,
  )
  .put(
    '/:id',
    transfer.upload.single(transfer.FIELD_NAME_UPLOAD.IMAGE_AVATAR),
    teamsController.update,
  )
  .delete('/:id', teamsController.delete);
