const typesSlideController = require('../../controllers/admin/types_slide.controller');
const transfer = require('../../middleware/transfer.middleware');

module.exports = require('express')
  .Router()
  .get('/', typesSlideController.list)
  .get('/:id', typesSlideController.read)
  .post(
    '/',
    transfer.upload.array(transfer.FIELD_NAME_UPLOAD.IMAGE_TYPE_SLIDE, 20),
    typesSlideController.create,
  )
  .put(
    '/:id',
    transfer.upload.array(transfer.FIELD_NAME_UPLOAD.IMAGE_TYPE_SLIDE, 20),
    typesSlideController.update,
  )
  .put('/:id/:effect', typesSlideController.addEffect)
  .patch('/:id', typesSlideController.isPost)
  .delete('/:id', typesSlideController.delete);
