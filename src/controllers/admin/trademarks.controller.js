const Trademark = require('../../schemas/trademark.schema');
const History = require('../../models/history.model');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const {renameFile,uploadMultipleFile,updateMultipleFile,deleteMulFile,execImageFile} = require("../../utils/transfer.util");
const includes = require('../../utils/common.util');
const Action = require('../../models/action.enum');
const {ImageConstant} = require("../../common/constant/images.constant");
const timeNow = new Date();

module.exports.read = catchAsync(async(req,res,next) =>{
  const trademark = await Trademark.findOne();
  res.status( 200 ).json( {
    message: `Read trademark success!!`,
    data: trademark
  } )
})

module.exports.updateLogo = catchAsync( async ( req, res, next ) => {
  const element = req.query.type;
  const image = req.file;

  const params = ['favicon','logo-icon','logo-word','logo'];
  if(!params.includes(element)) {
    return next(new AppError('Invalid param!',404))
  }
  let trademark = await Trademark.findOne();
  if ( !trademark ) {
    trademark = await new Trademark().save();
  }
  if ( !image ) {
    return res.status( 200 ).json( {
      message: `Update ${element} success!!`,
      data: trademark
    } )
  }

  switch ( element ) {
  case 'favicon':
    renameFile( image.path, ImageConstant.favicon ); 
    break;
  case 'logo-icon':
    renameFile( image.path, ImageConstant.logo_icon ); 
    break;
  case 'logo-word':
    renameFile( image.path, ImageConstant.logo_word ); 
    break;
  case 'logo':
    renameFile( image.path, ImageConstant.logo_word_icon ); 
    break;
  }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,trademark);
  await trademark.updateElementInput( element, image );

  await new History(undefined,req.user._id,timeNow,`Cập nhật ${element} ở phần About`).create();
  res.status( 200 ).json( {
    message: `Update ${element} success!!`,
    data: trademark
  } )
} )

module.exports.updateLicense = catchAsync( async ( req, res, next ) => {
  const images = req.files;
  const id = req.params.id;
  let data;

  let trademark = await Trademark.findOne();
  if ( !trademark ) {
    trademark = await new Trademark().save();
  }
  if ( !images[0] ) {
    return res.status( 200 ).json( {
      message: `Update license} success!!`,
      data: trademark
    })
  }

  const index = trademark.license.findIndex(i => i._id.toString()===id);
  deleteMulFile( trademark.license[index].images,'array' );
  data = {
    text: req.body.text,
    images:uploadMultipleFile(images),
  }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,trademark);
  await Trademark.updateOne( 
    {_id:trademark._id,'license._id':id},
    {$set:{'license.$':data}},{new:true});

  await new History(undefined,req.user._id,timeNow,`Cập nhật license ở phần About`).create();
  res.status( 200 ).json( {
    message: `Update license success!!`,
    data: trademark
  } )
} )

module.exports.createLicense = catchAsync( async ( req, res, next ) => {
  const element = req.params.children;
  const images = req.files;

  let trademark = await Trademark.findOne();
  if ( !trademark ) {
    trademark = await new Trademark().save();
  }
  if ( !images[0] ) {
    return res.status( 200 ).json( {
      message: `Update ${element} success!!`,
      data: trademark
    } )
  }

  const data = {
    text:req.body.text,
    images:uploadMultipleFile(images)
  }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,trademark);
  await trademark.updateOne({$push:{license:data}},{new:true});

  await new History(undefined,req.user._id,timeNow,`Thêm mới license (${data.text}) ở phần About`).create();
  return res.status( 200 ).json( {
    message: `Update ${element} success!!`,
    data: await Trademark.findOne()
  } )
} )

module.exports.delete = catchAsync(async(req,res,next) =>{
  const id = req.params.id;

  const trademark = await Trademark.findOne();
  if(!trademark) {
    return res.status(404).json({message:'Trademark is empty.'})
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete,trademark);
  const index = trademark.license.findIndex(i => i._id.toString()===id);
  await Trademark.updateOne( 
    {_id:trademark._id,'license._id':id},
    {$pull:{license:{_id:id}}},{new:true});
  deleteMulFile(trademark.license[index].images,'array');

  await new History(undefined,req.user._id,timeNow,`Xóa license (${trademark.license[index].text}) ở phần About`,trademark).create();
  res.status(200).json({
    message:`Delete license ${id} success!`,
    data: await Trademark.findOne()
  })
})