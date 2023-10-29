const Student = require('../../schemas/student.schema');
const Course = require('../../schemas/course.schema');
const Role = require('../../models/role.model');
const User = require('../../models/user.model');
const History = require('../../models/history.model');
const roles = require('../../models/role.enum');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const checker = require('../../utils/checker.util');
const filter = require('../../utils/filter.util');
const Action = require('../../models/action.enum');
const {StatusCourse} = require('../../models/status_course.enum')
const convertor = require('../../utils/converter.util');
const Sex = require('../../models/sex.enum');
const RoleSchema = require("../../schemas/role.schema");
const permissions = require('../../models/permission.enum');
const {updateAvatar} = require('../../utils/transfer.util');
const timeNow = new Date();

function getInfoStudent(student) {
  const courses = student.listCourse.map(st => {
    const course = {
      _id: st.courseId._id,
      nameCourse: st.courseId.nameCourse,
      typeCourse: st.courseId.typeCourse,
      certificate:st.certificate,
      status: st.status,
      session: st.session,
      createdAt: st.createdAt
    }
    return course;
  })
  const listPending = student.listCourse.filter( item => item.status === StatusCourse.Pending )
  const isHavePending = listPending.length > 0 ? true : false
  const user = student._uid;
  if(user) {
    const _student = {
      _id: student._id,
      full_name:user.full_name,
      phoneNumber: user.phone && user.phone,
      email: user.email && user.email,
      listCourse: courses,
      isHavePending,
      createdAt: student.createdAt,
    }
    return _student;
  }
}

module.exports.list = catchAsync( async ( req, res, next ) => {
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read,new Student({action:'read-student'}));
  const students = await Student.find().populate('_uid').populate('listCourse.courseId')
  let result = [];
  for(let student of students) {
    result.push(getInfoStudent(student))
  }
  res.status( 200 ).json( {
    message: 'Get All Student successfully.',
    data: result
  } )
});

module.exports.create = catchAsync( async ( req, res, next ) => {
  const {full_name,username,password,birthday,sex,address} = req.body;
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Create,new Student({action:'create-student'}));

  if (!checker.isEmail(username) && !checker.isPhone(username)) {
    return next(new Error('Invalid email or phone number!', 422));
  }
  if (!checker.isStrongPassword(password)) {
    return res.status(400).json('Please choose a stronger password. Try a mix of letters, numbers, and symbols (use 8 or more characters)');
  }
  if (new Date().getFullYear() - new Date(birthday.year, birthday.month).getFullYear() < 5) {
    return res.status(400).json('You must be 5 years or older!');
  }
  if (!Object.values(Sex).includes(sex)) {
    return res.status(400).json('Invalid gender!');
  }

  const user = await new User(
    undefined,// ** id
    undefined,// ** avatar
    full_name,
    checker.isEmail(username) ? username : undefined,
    checker.isPhone(username) ? username : undefined,
    username,
    password,
    undefined,// ** blocked
    undefined,// ** roles
    sex,
    address
  ).create();

  await new Student({_uid:user._id}).save();
  let role = await RoleSchema.findOne({ name: roles.Student });
  if(!role) {
    role = await new RoleSchema({name: roles.Student,permissions: permissions.Student}).save();
  }
  await new User(
    user._id,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    [role._id]
  ).updateRole(req);
  res.status(201).json({
    message:'Create new student successfully'
  })
} );

module.exports.read = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;
  let student = await Student.findById( id ).populate('_uid').populate('listCourse.courseId')

  if ( !student ) {
    return next( new AppError( 'Student Not Found', 404 ) );
  } 
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read,new Student({action:'read-student'}));
  res.status( 200 ).json( {
    data: getInfoStudent(student)
  } );
} );

module.exports.update = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;
  const student = await Student.findById(id);

  if(!student)
    return next(new AppError('Student not found!',404));
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,new Student({action:'update-student'}));

  req.body = {
    ...req.body,
    full_name: JSON.parse(req.body.full_name),
    birthday: JSON.parse(req.body.birthday)
  };
  const userDT = await new User(student._uid).read();
  const user = await new User(
    userDT._id,// ** id
    req.file ? updateAvatar(req.file,userDT.avatar) : undefined,
    req.body.full_name,
    undefined,// ** email
    undefined,// ** phone
    req.body.username,
    undefined,// ** password
    undefined,// ** blocked
    undefined,// ** roles
    req.body.sex,
    req.body.address
  ).update(req)

  await new History(undefined,req.user._id,timeNow,`Cập nhật thông tin học viên (${user.full_name.first} ${user.full_name.last}) ở mục Student`).create();
  res.status(200).json({
    message:'Update Student successfully!'
  })
} );

module.exports.delete = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;
  const courses = await Course.find();

  const student = await Student.findById( id );
  if ( !student ) {
    return next( new AppError( 'Student Not Found', 404 ) );
  }
  const user = await new User(student._uid).read();
  if(!user) {
    return next( new AppError( 'User Not Found', 404 ) );
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete,new Student({action:'delete-student'}));

  await new History(undefined,req.user._id,timeNow,`Xóa thông tin học viên (${user.name.first} ${user.name.middle?user.name.middle:''}${user.name.last}) ở mục Student`,student).create();
  await student.remove();
  await user.remove();

  // ** delete students in current courses
  for(let course of courses) {
    await course.filterStudent( id )
  }

  res.status( 200 ).json( {
    message: 'Delete Student success!'
  } )
});

module.exports.readCoursesOfStudent = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;

  const student = await Student.findById( id );
  if ( !student ) 
    return next( new AppError( 'Student Not found!', 404 ) );

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read,{action:'read-student'});
  res.status( 200 ).json( {
    message: 'Get data success!',
    data: {
      path: '/Student',
      pageTitle: `DANH SÁCH KHÓA HỌC ${student.name}`,
      listCourse: await filter.getUsers( 'status', student ),
      nameStudent : student.name
    }
  } );
} );

module.exports.createInfo = catchAsync( async ( req, res, next ) => {
  const id = req.params.targetid;
  const childrenTarget = req.params.childrentarget;
  let data;

  const item = await Student.findById( id );
  if ( !item ) 
    return next( new AppError( `${convertor.capitalize(desCollection)} not found!`, 404 ) );
} );

module.exports.readInfo = catchAsync( async ( req, res, next ) => {
  const id = req.params.targetid;
  const childrenTarget = req.params.childrentarget;
  let data;

  const item = await Student.findById( id );
  if ( !item ) 
    return next( new AppError( `${targetCollection} not found!`, 404 ) );

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read,{action:'read-user'});
} );

module.exports.updateStatusCourse = catchAsync( async ( req, res, next ) => {
  const targetId = req.params.id ;
  const index = req.params.index ;

  const student = await Student.findById( targetId );
  if ( !student ) 
    return res.status(404).json({message:'Student not found.'})

  const value = req.body.status,data = {};
  if(!Object.values(StatusCourse).includes(value)) {
    return res.status(404).json({message:'Status must be: Studying | Confirm | Pending | Finished.'})
  }
  
  const students = await Student.find().populate('_uid');
  let listData = [...students], result = [];
    
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update,new Student({action:'update-student'}));
  await new History(undefined,req.user._id,timeNow,'Cập nhật trang thai khoa hoc').create();
  await student.changeStatus( index, value );

  for ( let i of listData ) {
    const { listCourse, ...others } = i._doc;
    const listPending = i.listCourse.items.filter( e => e.status === 'Pending' )
    const isHavePending = listPending.length > 0 ? true : false
    if(i._uid) {
      const student = {
        _id: i._id,
        name:i._uid.name.first + i._uid.name.last,
        phoneNumber: i._uid.phone && i._uid.phone,
        email: i._uid.email && i._uid.email,
        listCourse: i.listCourse.items.length,
        isHavePending,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
        password: i._uid.password
      }
      result.push(student);
    }
  }
    
  data['course'] = await filter.getUsers( 'status', student )
  data['listUser'] = result

  return res.status( 200 ).json( {         
    message: 'Sửa trạng thái khóa học thành công',
    data
  } )
} );

module.exports.deleteInfo = catchAsync( async ( req, res, next ) => {
  const id = req.params.id;

  const student = await Student.findById( id );
  const index = req.params.index;

  if ( !student ) 
    return res.status(404).json({message:'Student not found.'})
  
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete,new Student({action:'delete-student'}));
  await student.removeCourseOfStudent(index);

  await new History(undefined,req.user._id,timeNow,'Xóa khóa học ở mục Course').create();
  res.status( 200 ).json( {
    message: 'Delete course success!',
    data: student
  } )
} );