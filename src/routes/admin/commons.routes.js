const commonController = require('../../controllers/admin/common.controller');
const transfer = require('../../middleware/transfer.middleware');

module.exports = require('express')
  .Router()
  .get('/:language', commonController.readCommon)
  .put(
    '/:id/:language',
    transfer.upload.single(transfer.FIELD_NAME_UPLOAD.IMAGE_COMMON),
    commonController.updateCommon,
  )
  .post(
    '/',
    transfer.upload.single(transfer.FIELD_NAME_UPLOAD.IMAGE_COMMON),
    commonController.createCommon,
  )
  .delete('/:title', commonController.deleteCommon);
