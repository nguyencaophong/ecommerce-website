const Permission = require('../../../configs/permissions.json')
const catchAsync = require('../../middleware/catcher.middleware');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const Action = require('../../models/action.enum');
const BaseRoles = require('../../models/permission.enum');
const _ = require('lodash');

module.exports.read = catchAsync(async(req,res) =>{
  const result = [];
  let permissions = Permission.filter(i => i._id!=='Root');
  const baseRoles = BaseRoles.Student.concat(BaseRoles.User);
  
  for(let permission of permissions) {
    if(!baseRoles.includes(permission._id)) {
      result.push({_id:permission._id,name:permission.name})
    }
  }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read,'Permission');

  res.status(200).json({
    message:'Get all Permission',
    data: result
  })
})