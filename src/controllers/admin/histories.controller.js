const History = require('../../models/history.model');
const catchAsync = require('../../middleware/catcher.middleware');


module.exports.list = catchAsync(async(req,res) =>{
  const histories = await new History().list(req);

  res.status(200).json({
    message:'Get all history success!',
    data: histories
  })
})