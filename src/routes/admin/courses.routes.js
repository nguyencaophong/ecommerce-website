const coursesController = require('../../controllers/admin/courses.controller');
const transfer = require('../../middleware/transfer.middleware');

module.exports = require('express')
  .Router()
  .get('/', coursesController.list)
  .get('/:id', coursesController.getInfo)
  .put(
    '/:id',
    transfer.upload.single(transfer.FIELD_NAME_UPLOAD.IMAGE_COURSE, 20),
    coursesController.update,
  )
  .put('/:id/details', coursesController.updateInfo)
  .post(
    '',
    transfer.upload.single(transfer.FIELD_NAME_UPLOAD.IMAGE_COURSE, 20),
    coursesController.create,
  )
  .delete('/:id', coursesController.delete);
