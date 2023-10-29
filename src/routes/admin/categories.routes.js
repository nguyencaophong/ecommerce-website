const categoriesController = require('../../controllers/admin/categories.controller');

module.exports = require('express')
  .Router()
  .get('/:language', categoriesController.list)
  .get('/children/:language', categoriesController.listByChildren)
  .get('/:id', categoriesController.getInfo)
  .post('/', categoriesController.create)
  .put('/:id/:language', categoriesController.update)
  .delete('/:id', categoriesController.delete);
