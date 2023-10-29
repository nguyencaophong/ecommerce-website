const Role = require('../../models/role.model');
const Permission = require('../../../configs/permissions.json')
const catchAsync = require('../../middleware/catcher.middleware');

module.exports.create = catchAsync(async(req,res) =>{
  const {name,permissions} = req.body;
  const id = req.params.id;
 
  await new Role(id,name,permissions).create(req);

  res.status(200).json({
    message:'Save successfully!'
  })
})


module.exports.update = catchAsync(async(req,res) =>{
  const {name,permissions} = req.body;
  const id = req.params.id;
 
  await new Role(id,name,permissions).update(req);

  res.status(200).json({
    message:'Save successfully!'
  })
})

module.exports.list = catchAsync(async(req,res) =>{
  let roles = await new Role().list(req);
  roles = roles.filter(role => role.name !== 'Root')
  res.status(200).json(roles);
} )

module.exports.delete = catchAsync(async(req,res) =>{
  const id = req.params.id;
  await new Role(id).delete(req);
  res.status(200).json({
    message:'Delete successfully!'
  })
} )
