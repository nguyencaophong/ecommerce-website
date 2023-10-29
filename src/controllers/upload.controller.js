const catchAsync = require('../middleware/catcher.middleware');
const { uploadSingleFile } = require('../utils/transfer.util');

module.exports.uploadSingle = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image is required' });
  }
  res.status(201).json({
    message: 'Upload image successfully',
    data: uploadSingleFile(req.file),
  });
});
