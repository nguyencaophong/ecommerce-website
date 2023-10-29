const slidesShowController = require('../../controllers/admin/slides-show.controller')

module.exports = require('express')
  .Router()
  .get('/',slidesShowController.list)
  .post('/',slidesShowController.create)
  .get('/:id',slidesShowController.read)
  .put('/:id',slidesShowController.update)
  .delete('/:id',slidesShowController.delete)