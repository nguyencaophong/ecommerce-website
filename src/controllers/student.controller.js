const User = require( '../models/user.model' );
const Student = require('../schemas/student.schema')
const Course = require('../schemas/course.schema' );
const catchAsync = require( '../middleware/catcher.middleware' );
const ability = require('../casl/casl.factory')
const AppError = require('../utils/app_error.util');
const { ForbiddenError } = require('@casl/ability');
const Action = require('../models/action.enum');

module.exports.read = catchAsync( async( req,res,next ) =>{
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read,new Student({action:'read-myself'}));
  const student = await Student.findOne({_uid:req.user._id.toString()});
  if( !student ) {
    return next( new AppError( 'Student not found',404 ) ); 
  } 

  let listStudyCourse = student.listCourse;
  let coursesPending = listStudyCourse.filter( item =>{
    return item.status === 'Pending'
  } ).map( item =>{
    return item.courseId;
  } )
  let coursesConfirm = listStudyCourse.filter( item =>{
    return item.status === 'Confirm'
  } ).map( item =>{
    return item.courseId;
  } )
  let courseStudying = listStudyCourse.filter( item =>{
    return item.status === 'Studying'
  } ).map( item =>{
    return item.courseId;
  } )
  let courseFinished = listStudyCourse.filter( item =>{
    return item.status === 'Finish'
  } ).map( item =>{
    return item.courseId;
  } )    
  
  let coursesSuggest = coursesPending.concat( courseStudying ).concat( courseFinished ).concat( coursesConfirm );
  const listCoursePending = await Course.find( { _id : {$in : coursesPending}} )
  const listCourseConfirm = await Course.find( { _id : {$in : coursesConfirm}} )
  const listCourseStudying = await Course.find( { _id : {$in : courseStudying}} )
  const listCourseFinished = await Course.find( { _id : {$in : courseFinished}} )
  const listCourseRecomment = await Course.find( { _id : {$nin : coursesSuggest}} )

  return res.status( 200 ).json( {
    message :'GET USER SUCCESS !',
    student,listCoursePending,listCourseConfirm,listCourseStudying,listCourseFinished,listCourseRecomment
  } )    
} );