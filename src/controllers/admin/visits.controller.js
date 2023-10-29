const Visit = require('../../models/visit.model');
const Action = require('../../models/action.enum');
const catchAsync = require('../../middleware/catcher.middleware');

module.exports.visit = catchAsync(async(req,res) =>{
  const visits = await new Visit().list();

  res.status(200).json({
    message:'Get all Visit success!',
    data: visits
  })
})

