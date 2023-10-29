const studentsController = require('../../controllers/admin/students.controller');
const transfer = require('../../middleware/transfer.middleware');

module.exports = require('express')
  .Router()
  .get('/', studentsController.list)
  .post('/', studentsController.create)
  .get('/:id', studentsController.read)
  .put(
    '/:id',
    transfer.upload.single(transfer.FIELD_NAME_UPLOAD.IMAGE_AVATAR),
    studentsController.update,
  )
  .delete('/:id', studentsController.delete)
  .get('/:id/courses', studentsController.readCoursesOfStudent)
  .put('/:id/status/:index', studentsController.updateStatusCourse)
  .delete('/:id/course/:index', studentsController.deleteInfo);
