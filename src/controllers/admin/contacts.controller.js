
const Contact = require('../../schemas/contact.schema');
const History = require('../../models/history.model');
const catchAsync = require('../../middleware/catcher.middleware');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const Action = require('../../models/action.enum');
const timeNow = new Date();


module.exports.list = catchAsync( async ( req, res, next ) => {
  const contacts = await Contact.accessibleBy(ability(req.user)).find();
  res.status( 200 ).json( { 
    message: 'Get data success',
    data: contacts
  } )
} )

module.exports.update = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;
  const {section} = req.body;

  const contact = await Contact.findById(id);
  if ( !contact ) 
    return res.status(404).json({message:'Contact not found.'})

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,contact);
  await contact.updateOne({$set:{status:section}});
  
  await new History(undefined,req.user._id,timeNow,`Đã xem phản hồi của ${contact.name} ở mục Contact`).create();
  res.status( 200 ).json( {
    message: 'Edit status success!',
    data: contact
  } )
} );

module.exports.delete = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;
  
  const contact = await Contact.findById(id);
  if ( !contact ) 
    return res.status(404).json({message:'Contact not found.'})

  ForbiddenError.from(ability(req.user)).throwUnlessCan(contact);
  await contact.remove();
    
  await new History(undefined,req.user._id,timeNow,`Đã xóa phản hồi của ${contact.name} ở mục Contact`).create();
  res.status( 200 ).json( {
    message: 'Delete Contact success!',
    data: contact
  } );
} );