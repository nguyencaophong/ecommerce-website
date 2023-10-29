const trademarksController = require('../../controllers/admin/trademarks.controller');
const transfer = require('../../middleware/transfer.middleware');

module.exports = require('express')
  .Router()
  .get('/', trademarksController.read)
  .patch(
    '/logo',
    transfer.upload.single(transfer.FIELD_NAME_UPLOAD.IMAGE_LOGO),
    trademarksController.updateLogo,
  )
  .post(
    '/license',
    transfer.upload.array(transfer.FIELD_NAME_UPLOAD.IMAGE_LICENSE, 20),
    trademarksController.createLicense,
  )
  .patch(
    '/license/:id',
    transfer.upload.array(transfer.FIELD_NAME_UPLOAD.IMAGE_LICENSE, 20),
    trademarksController.updateLicense,
  )
  .delete('/license/:id', trademarksController.delete);
