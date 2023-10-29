const Course = require('../../schemas/course.schema');
const Share = require('../../schemas/new.schema');
const User = require('../../models/user.model');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const converter = require('../../utils/converter.util');

module.exports.read = catchAsync( async ( req, res, next ) => {
  const targetDestination = req.params.collection;
  const keyWordSearch = req.query.q;
  let resultListShare;

  switch ( targetDestination ) {
  case 'student': {
    const listUser = await User.find();
    resultListShare = listUser.filter( ( value, index ) => {
      return ( converter.formatKeyword( value.name ).includes( converter.formatKeyword( keyWordSearch ) ) ||
                    converter.formatKeyword( value.phoneNumber ).includes( converter.formatKeyword( keyWordSearch ) ) ||
                    converter.formatKeyword( value.email ).includes( converter.formatKeyword( keyWordSearch ) ) )
    } )
    break;
  }
  case 'students_course': {
    const courseId = req.body.itemId;
    const courseDetail = await Course.findById( courseId );

    if ( !courseDetail ) 
      return next( new AppError( 'Course not found!', 404 ) );
    const populateStudent = await courseDetail.populate( 'listUser.items.userId' );
    const listItem = populateStudent.listUser.items
    resultListShare = listItem.filter( ( value, index ) => {
      return ( converter.formatKeyword( value.userId.name ).includes( converter.formatKeyword( keyWordSearch ) ) ||
                    converter.formatKeyword( value.userId.phoneNumber ).includes( converter.formatKeyword( keyWordSearch ) ) ||
                    converter.formatKeyword( value.userId.email ).includes( converter.formatKeyword( keyWordSearch ) ) )
    } )
    break;
  }
  case 'student': {
    const listShare = await Share.find();
    resultListShare = listShare.filter( ( value, index ) => {
      return ( converter.formatKeyword( value.title ).includes( converter.formatKeyword( keyWordSearch ) ) )
    } )
    break;
  }
  default:
    break;
  }

  res.status( 200 ).json( { 
    message: 'Get data success!',
    data: resultListShare
  } )
});