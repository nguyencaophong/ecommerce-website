const mongoose = require( 'mongoose' );
const { findINDEX } = require( '../utils/common.util' );
const { accessibleRecordsPlugin } = require('@casl/mongoose')
const Schema = mongoose.Schema;

const studentSchema = new Schema( {
  listCourse:[
    {
      courseId:{
        type:Schema.Types.ObjectId,
        ref:'Course',
        required: 'Course id is required'
      },
      certificate:{
        type: String,
        default: 'null'
      },
      status:{
        type : String,
        required:'Status is required',
        default : 'Pending'
      // điền form chờ xác nhận: Pending
      // xác nhận đăng ký học: Confirm
      // đang học: Studying 
      // hoàn thành khóa học: Finish
      },
      session:{
        type:String,
        required: 'Session is required',
        default:'null'
      },
      createdAt:{
        type: Date,
        required:'Required course registration date',
        default: new Date()
      }
    }],
  _uid: {
    type: Schema.Types.ObjectId,
    ref:'User',
    required:'User id is require'
  },
  action:String
}, {
  timestamps: true
} 
)

studentSchema.methods.filterCourse = function ( courseId ) {
  let updateCourse = [...this.listCourse];
  updateCourse = updateCourse.filter( value =>{return value.courseId != courseId;} )
  this.listCourse = updateCourse;

  return this.save()
} 

studentSchema.methods.addCourses = function( course ) {
  const copyListCourse = [...this.listCourse];
  const listCourseId = copyListCourse.map( value =>{return value.courseId.toString();} )
    
  if( listCourseId.includes( course._id.toString() ) ) {
    return 0;
  }
  else{
    copyListCourse.push( {courseId: course._id} )
    const updatedCourses = copyListCourse
    this.listCourse = updatedCourses;
    return this.save();
  }
} 

studentSchema.methods.changeStatus = function( index, value ) {
  const updatedCourses = [...this.listCourse].map(e => e.courseId)
  const checkIndex = findINDEX( updatedCourses,index );
  this.listCourse[checkIndex].status = value;

  return this.save();
}

studentSchema.methods.removeCourseOfStudent = function( index ) {
  const updatedCoursesOfStudent = [...this.listCourse];
  const checkIndex = updatedCoursesOfStudent.findIndex( ( item )=> {return item.courseId.toString()===index.toString();} )
  updatedCoursesOfStudent.splice( checkIndex,1 );
  this.listCourse = updatedCoursesOfStudent;

  return this.save(); 
}

studentSchema.plugin(accessibleRecordsPlugin)

module.exports = mongoose.model( 'Student',studentSchema );
