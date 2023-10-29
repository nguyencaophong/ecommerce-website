const Team = require('../../schemas/team.schema');
const TeamPosition = require('../../schemas/team_position.schema');
const History = require('../../models/history.model');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const Action = require('../../models/action.enum');
const { ForbiddenError } = require('@casl/ability');
const timeNow = new Date();

module.exports.list = catchAsync( async ( req, res, next ) => {
  const positions = await TeamPosition.accessibleBy(ability(req.user)).find();

  res.status( 200 ).json( {
    message: 'Get data success!',
    data: positions
  } )
} )

module.exports.read = catchAsync( async( req,res,next ) =>{
  const id = req.params.id;

  const position = await TeamPosition.findById( id );
  if(!position)
    return next(new AppError('Team Position not found !',404))

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read,position);

  res.status( 200 ).json( {
    message: `Get item ${position.name} success`,
    data: position
  } )
} )

module.exports.create = catchAsync( async ( req, res, next ) => {
  const { name } = req.body;

  const newItem = new TeamPosition( { name } );
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Create,newItem);
  await newItem.save()
  
  const positions = await TeamPosition.find();
  
  await new History(undefined,req.user._id,timeNow,`Thêm vị trí ${name} ở mục Teams`).create();
  res.status( 201 ).json( {
    message: 'Create new position of team scuess!',
    data: positions
  } )
} )

module.exports.update = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;

  const position = await TeamPosition.findById( id );
  if(!position) 
    return next(new AppError('Team Position not found !',404));

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,position);
  await position.updateOne({ $set: { name: req.body.name } },{new:true})
  const positions = await TeamPosition.find();
  
  await new History(undefined,req.user._id,timeNow,`Cập nhật vị trí ${position.name} ở mục Teams`).create();
  res.status( 200 ).json({
    message: 'Update position of team success!',
    data: positions
  })
} )

module.exports.delete = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;

  const position = await TeamPosition.findById( id);
  if(!position)
    return next(new AppError('Team Position not found !',404));
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete,position);
  await position.remove();
  
  const team = await Team.findOne( {position:id})
  if(!team)
    return next(new AppError('Team Position not found !',404));
  await Team.updateOne( {$set:{position: null }},{new:true})
  const positions = await TeamPosition.find();
  
  await new History(undefined,req.user._id,timeNow,`Xóa vị trí ${position.name} ở mục Teams`,position).create();
  res.status( 200 ).json( {
    message: 'Delete position of team success!',
    data: positions
  } )
} )