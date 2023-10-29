const uploadController = require('../controllers/upload.controller');
const transfer = require('../middleware/transfer.middleware');
module.exports = require('express')
  .Router()
  .post(
    '/news',
    transfer.upload.single(transfer.FIELD_NAME_UPLOAD.IMAGE_NEWS),
    uploadController.uploadSingle,
  );
