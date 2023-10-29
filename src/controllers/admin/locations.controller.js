const Location = require('../../schemas/location.schema');
const History = require('../../models/history.model');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const Action = require('../../models/action.enum');
const locationEnum = require('../../models/location.enum');
const timeNow = new Date();
const _ = require('lodash');

module.exports.create = catchAsync(async (req,res,next) =>{
  const location = await new Location(req.body).save();
  res.status(201).json(location)
})

module.exports.update = catchAsync(async (req,res,next) =>{
  const id = req.params.id;
  const location = await Location.findByIdAndUpdate(id,req.body,{new:true});
  res.status(200).json(location);
})

module.exports.read = catchAsync(async(req,res,next) =>{
  const locations = await Location.find();
  res.status(200).json(locations);
})

module.exports.delete = catchAsync(async (req,res,next) =>{
  const id = req.params.id;
  const location = await Location.findByIdAndDelete(id,{new:true});
  res.status(200).json(location);
})

// module.exports.create = catchAsync( async ( req, res, next ) => {
//   const { type } = req.body;

//   if(!Object.values(locationEnum).includes(type))
//   {
//     return next(new AppError('Invalid Type'));
//   }
//   // ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Create,location);
  
//   let payload = {
//     type,
//     map: undefined,
//     area: undefined,
//     address: undefined,
//     typeEmail: undefined,
//     typePhone: undefined,
//     itemsPhone: undefined,
//     itemsEmail: undefined,
//   };


//   switch ( type ) {
//   case 'address': {
//     const locations = await Location.find({type});
//     Object.assign(payload,_.pick(req.body,['map','address','area']));
//     if(_.find(locations,_.pick(payload,['map','address','area']))) {
//       next(new AppError('Duplicate value, Please choose a another'));
//     };
//     await Location.create(payload);
//     break;
//   }
//   case 'email': {
//     const {typeEmail,itemEmail} = req.body;
//     const location = await Location.findOne({typeEmail});
//     if(!location ) {
//       payload.typeEmail = typeEmail;
//       payload.itemsEmail = itemEmail;
//       await Location.create(payload);
//       break;
//     }
//     if(_.find(location.itemsEmail,{...itemEmail}))
//     {
//       next(new AppError("email & title aldready exists, please choose another"));
//     }
//     await Location.updateOne({typeEmail},{$push:{itemsEmail:itemEmail}});
//     break;
//   }
//   case 'phone': {
//     const {typePhone,itemPhone} = req.body;
//     const location = await Location.findOne({typePhone});
//     if(!location ) {
//       payload.typePhone = typePhone;
//       payload.itemsPhone = itemPhone;
//       await Location.create(payload);
//       break;
//     }
//     if(_.find(location.itemsPhone,{...itemPhone}))
//     {
//       next(new AppError("email & title aldready exists, please choose another"));
//     }
//     await Location.updateOne({typePhone},{$push:{itemsPhone:itemPhone}});
//     break;
//   }
//   default:
//     return next( new AppError( `Invalid params ${type} value!`, 422 ) );
//   }

//   // await new History(undefined,req.user._id,timeNow,`Thêm mới một ${type} ở phần About`).create();
//   res.status( 201 ).json( {
//     message: `Add new ${type} success!`,
//     data: await Location.find()
//   } )
// } )

// module.exports.update = catchAsync( async ( req, res, next ) => {
//   const id = req.params.id;

//   let location = await Location.findOne({_id:id});
//   if ( !location ) {
//     return res.status(404).json({message:'Location is empty!'})
//   }
//   ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,location);
//   switch ( location.type ) {
//   case 'address': {
//     await Location.updateOne({_id:id},{...req.body},{new:true})
//     break;
//   }
//   case 'email': {
//     const {itemsEmail,typeEmail} = req.body;
//     await Location.updateOne({_id:id},{$set:{itemsEmail,typeEmail}},{new:true})
//     break;
//   }
//   case 'phone': {
//     const {itemsPhone,typePhone} = req.body;
//     await Location.updateOne({_id:id},{$set:{itemsPhone,typePhone}},{new:true})
//     break;
//   }
//   default:
//     return next( new AppError( `Invalid params ${location.type} value!`, 422 ) );
//   }
//   await new History(undefined,req.user._id,timeNow,`Cập nhật location - ${location.type} `).create();
//   res.status( 200 ).json( {
//     message: `Update ${location.type} success!`,
//     data: await Location.find({})
//   } )
// } )

// module.exports.delete = catchAsync( async ( req, res, next ) => {
//   const id = req.params.id;

//   const location = await Location.findOne({_id:id});
//   if ( !location ) {
//     return res.status(404).json({message:'Location is empty!'})
//   } 
//   ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete,location);
//   await Location.deleteOne({_id:id});
//   res.status( 200 ).json( {
//     message: `Delete ${location.type} success!`,
//     data: await Location.findOne()
//   } )
// })