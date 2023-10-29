const Team = require('../../schemas/team.schema');
const TeamGroup = require('../../schemas/team_group.schema');
const History = require('../../models/history.model');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const filter = require('../../utils/filter.util');
const Action = require('../../models/action.enum');
const timeNow = new Date();


module.exports.list = catchAsync( async ( req, res, next ) => {
  res.status( 200 ).json( {
    message: 'Get data success!',
    data: await filter.getTeams( req.user )
  } )
} )

module.exports.create = catchAsync( async ( req, res, next ) => {
  const { name } = req.body;

  const group = new TeamGroup( {name} );
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Create,group);
  await group.save();
  
  await new History(undefined,req.user._id,timeNow,`Thêm mới một group ${name} ở mục Teams`).create();
  res.status( 201 ).json( {
    message: 'Create new Team Group success!',
    data: await filter.getTeams( req.user )
  } )
} )

module.exports.read = catchAsync( async( req,res,next ) =>{
  const id = req.params.id;

  const teamGroup = await TeamGroup.findById( id );
  if(!teamGroup)
    return next(new AppError('Team Group not found!',404))
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read,teamGroup);

  res.status( 200 ).json( {
    message: `Get team group ${item.name} success`,
    data: teamGroup
  } )
} )

module.exports.update = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;
  const {name} = req.body;

  const group = await TeamGroup.findById(id)
  if(!group)
    return next(new AppError('Team Group not found!',404))

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,group);
  await group.updateOne( { $set: { name: name } },{new:true});
  
  await new History(undefined,req.user._id,timeNow,`Cập nhật group ${group.name} ở mục Teams`).create();
  res.status( 200 ).json( {
    message: 'Update TeamGroup success!',
    data: await filter.getTeams( req.user )
  } )
} )

module.exports.delete = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;

  const group = await TeamGroup.findById(id)
  if(!group)
    return next(new AppError('Team Group not found!',404))
    
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete,group);
  await group.remove();
  
  await new History(undefined,req.user._id,timeNow,`Xóa group ${group.name} ở mục Teams`).create();
  res.status( 200 ).json({
    success:true,
    message:'Delete team group success!',
    data: await filter.getTeams( req.user )
  })
} )

module.exports.addTeamIntoTeamGroup = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;
  const teamId = req.params.member ;
  
  const member = await Team.findById( teamId );
  const group = await TeamGroup.findById( id );
  if ( !group ) 
    return next( new AppError( `Invalid id ${id} value!`, 422 ) );
  if ( !member ) 
    return next( new AppError( `Invalid id ${teamId} value!`, 422 ) );
  
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,TeamGroup.name);
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,Team.name);
    
  // ** add team into Team group
  // ** add teamGroup into listGroup of Team
  await group.updateOne( { $push: { listTeam: { idTeam: teamId } } },{new:true} );
  await member.updateOne( { $push: { listGroup: { idGroup: id } } },{new:true} );
  
  await new History(undefined,req.user._id,timeNow,`Thêm thành viên ${member.name} vào group ${group.name} ở mục Teams`).create();
  res.status( 201 ).json( {
    message: `Add new team into ${group.name} success!`,
    data: await filter.getTeams( req.user )
  } )
} )

module.exports.deleteTeamInTeamGroup = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;
  const teamId = req.params.member ;
  
  const member = await Team.findById( teamId );
  const group = await TeamGroup.findById( id );
  
  if ( !group ) 
    return next( new AppError( `Invalid id ${id} value!`, 422 ) );
  if ( !member ) 
    return next( new AppError( `Invalid id ${teamId} value!`, 422 ) );
  
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete,TeamGroup.name);
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete,Team.name);

  await group.updateOne( { $pull: { listTeam: { idTeam: teamId } } },{new:true} );
  await member.updateOne( { $pull: { listGroup: { idGroup: id } } },{new:true} );
  
  await new History(undefined,req.user._id,timeNow,`Xóa thành viên ${member.name} khỏi group ${group.name} ở mục Teams`).create();
  res.status( 200 ).json( {
    message: `Delete team in ${group.name} success!`,
    data: await filter.getTeams( req.user )
  } )
} )