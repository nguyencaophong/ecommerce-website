const TypeEffect = require('../../schemas/type_effect.schema');
const History = require('../../models/history.model');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const Action = require('../../models/action.enum');
const timeNow = new Date();

module.exports.list = catchAsync( async ( req, res, next ) => {
  const effects = await TypeEffect.accessibleBy(ability(req.user)).find();
  res.status( 200 ).json( {
    message: 'Get data success!',
    data: effects
  } )
} )

module.exports.read = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;

  const effect = await TypeEffect.findById( id );
  if ( !effect ) 
    return res.status(404).json({message:'TypeEffect not found.'})

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read,effect);

  res.status( 200 ).json( {
    message: `Get data of ${effect.type} success`,
    data: effect
  } )
} )

module.exports.create = catchAsync( async ( req, res, next ) => {
  const {typeeffect} = req.body;

  const effect = new TypeEffect( {type: typeeffect} );
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Create,effect);
  await effect.save();
  
  await new History(undefined,req.user._id,timeNow,`Thêm mới hiệu ứng ${typeeffect} ở mục Slide`).create();
  res.status( 201 ).json( {
    message: 'Add new TypeEffect success!',
    data: effect
  } )
} )

module.exports.update = catchAsync( async ( req, res, next ) => {
  let id = req.params.id;

  const effect = await TypeEffect.findById(id);
  if(!effect)
    return res.status(404).json({message:'TypeEffect not found.'})

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,effect);
  const updateEffect = await effect.updateOne({type: req.body.typeeffect},{new:true})
  
  await new History(undefined,req.user._id,timeNow,`Cập nhật ${effect.type} ở mục Slide`).create();
  res.status( 200 ).json( {
    message: `Edit typeslide ${newItem.type} success!`,
    data: updateEffect
  } )
})

module.exports.delete = catchAsync( async ( req, res, next ) => {
  let id = req.params.id;

  const effect = await TypeEffect.findById( id );
  if ( !effect ) 
    return res.status(404).json({message:'TypeEffect not found.'})
  
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete,effect);
  await effect.remove();
  
  await new History(undefined,req.user._id,timeNow,`Xóa ${effect.type} ở mục Slide`,effect).create();
  res.status( 200 ).json( {
    message: 'Delete TypeEffect success!',
    data: effect
  } );
} )