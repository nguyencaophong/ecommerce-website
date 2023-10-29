const slidesController = require('../../controllers/admin/slides.controller');
const transfer = require('../../middleware/transfer.middleware');

module.exports = require('express')
  .Router()
  .get('/', slidesController.list)
  .post('/',transfer.upload.single(transfer.FIELD_NAME_UPLOAD.IMAGE_SLIDE),slidesController.create)
  .get('/:id', slidesController.read)
  .put(
    '/:id',
    transfer.upload.single(transfer.FIELD_NAME_UPLOAD.IMAGE_SLIDE),
    slidesController.update,
  )
  .delete('/:id', slidesController.delete);
