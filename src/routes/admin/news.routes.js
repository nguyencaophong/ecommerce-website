const newsController = require('../../controllers/admin/news.controller');

module.exports = require('express')
  .Router()
  .post('/', newsController.create)
  // ** get all news by language
  .get('/all/:language', newsController.list)
  // ** get info news by language
  .get('/:id/:language', newsController.getInfo)
  .put('/:id/:language', newsController.update)
  .delete('/:id', newsController.delete);
