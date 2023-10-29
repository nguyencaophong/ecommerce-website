const fs = require('fs');
const _ = require('lodash');
const Email = require('../models/email.model');
const Phone = require('../models/phone.model');
const User = require('../models/user.model');
const roleSchema = require('../schemas/role.schema');
const roles = require('../models/role.enum');
const permissions = require('../models/permission.enum');
const Sex = require('../models/sex.enum');
const checker = require('../utils/checker.util');
const Error = require('../utils/app_error.util');
const catchAsync = require('../middleware/catcher.middleware');
const Course = require('../schemas/course.schema');
const Student = require('../schemas/student.schema');
const { updateSingleFile } = require('../utils/transfer.util');

module.exports.create = catchAsync(async (req, res, next) => {
  const { full_name, username, password, birthday, sex, address } = req.body;

  if (!checker.isEmail(username) && !checker.isPhone(username)) {
    return next(new Error('Invalid email or phone number!', 422));
  }
  if (!checker.isStrongPassword(password)) {
    return res
      .status(400)
      .json(
        'Please choose a stronger password. Try a mix of letters, numbers, and symbols (use 8 or more characters)',
      );
  }
  if (
    new Date().getFullYear() -
      new Date(birthday.year, birthday.month).getFullYear() <
    5
  ) {
    return res.status(400).json('You must be 5 years or older!');
  }
  if (!Object.values(Sex).includes(sex)) {
    return res.status(400).json('Invalid gender!');
  }

  const birthdayFormatted = `${birthday.year}-${birthday.month}-${birthday.day}`;
  let user = await new User(
    undefined, // ** id
    undefined, // ** avatar
    full_name,
    checker.isEmail(username) ? username : undefined,
    checker.isPhone(username) ? username : undefined,
    username,
    password,
    undefined, // ** blocked
    undefined, // ** roles
    sex,
    address,
    birthdayFormatted,
  ).create(req);

  // ** create role user
  let role = await roleSchema.findOne({ name: roles.User });
  if (!role) {
    role = await new roleSchema({
      name: roles.User,
      permissions: permissions.User,
    }).save();
  }
  user = await new User(
    user._id,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    [role._id],
  ).updateRole();
  res.status(201).json({ message: 'Save successfully.', data: user });
});

module.exports.read = catchAsync(async (req, res, next) => {
  const user = await new User(req.user._id).read();
  if (!user) {
    return next(new Error('User not found', 422));
  }
  res.json({
    ..._.pick(user, [
      'avatar',
      'full_name',
      'email',
      'phone',
      'username',
      'sex',
      'birthday',
      'address',
    ]),
    roles: req.user.roles,
  });
});

module.exports.update = catchAsync(async (req, res, next) => {
  const birthday = JSON.parse(req.body.birthday);
  req.body = {
    ...req.body,
    full_name: JSON.parse(req.body.full_name),
    birthday: `${birthday.year}-${birthday.month}-${birthday.day + 1}`,
  };

  const userDT = await new User(req.user).read();
  const user = await new User(
    req.user, // ** id
    req.file ? updateSingleFile(req.file, userDT.avatar) : undefined,
    req.body.full_name,
    undefined, // ** email
    undefined, // ** phone
    req.body.username,
    undefined, // ** password
    undefined, // ** blocked
    undefined, // ** roles
    req.body.sex,
    req.body.address,
    req.body.birthday,
  ).update(req);

  res.status(200).json({ message: 'Update successfully.', data: user });
});

module.exports.changePassword = catchAsync(async (req, res) => {
  const { password, new_pass } = req.body;

  await new User(
    req.user,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    password,
  ).changePassword(new_pass);

  res.status(200).json({ message: 'Change password successfully.' });
});

module.exports.registerCourse = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await new User(req.user).read();
  const course = await Course.findById(id);
  let student = await Student.findOne({ _uid: user._id });

  if (!course) {
    return res.status(404).json({ message: 'Khóa học này không còn nữa !' });
  }
  if (course.listUser.length === course.maxQuantity) {
    return res.status(401).json({ message: 'Số lượng học viên đã đủ !' });
  }
  if (!student) {
    student = await new Student({ _uid: user._id }).save();
  }
  if (student.listCourse.length > 0) {
    const isCoursePresent = student.listCourse.some((value) => {
      return value.courseId.toString() === id;
    });
    if (isCoursePresent) {
      return res
        .status(401)
        .json({ message: 'Khóa học này đã được đăng ký trước đó !' });
    }
  }

  // ** add course into student & student into course
  await student.addCourses(course);
  await Course.updateOne({ _id: id }, { $push: { listUser: student._id } });

  // ** create role student
  let role = await roleSchema.findOne({ name: roles.Student });
  if (!role) {
    role = await new roleSchema({
      name: roles.Student,
      permissions: permissions.Student,
    }).save();
  }
  const isStudentRolePresent = user.roles
    .map((role) => role.name)
    .includes(roles.Student);
  if (!isStudentRolePresent) {
    await new User(
      req.user._id,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      [...user.roles, role._id],
    ).updateRole(req);
  }

  return res
    .status(200)
    .json({ message: 'Chúc mừng, bạn đã đăng kí thành công khóa học !' });
});

module.exports.changeEmail = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!checker.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address!' });
  }
  const user = await new User(req.user).read();
  if (user.email === email) {
    return res
      .status(400)
      .json({ message: 'The new email must be different from the email!' });
  }

  await new Email(undefined, email).verify(req);
  await new User(req.user, undefined, undefined, email).changeEmail();

  res.status(200).json({ message: 'Change email address successfully.' });
});

module.exports.changePhone = catchAsync(async (req, res) => {
  const { phone } = req.body;

  if (!checker.isPhone(phone)) {
    return res.status(400).json({ message: 'Invalid phone number!' });
  }
  const user = await new User(req.user).read();
  if (user.phone === phone) {
    return res.status(400).json({
      message: 'The new phone number must be different from the phone number!',
    });
  }

  await new Phone(undefined, phone).verify(req);
  await new User(
    req.user,
    undefined,
    undefined,
    undefined,
    phone,
  ).changePhone();

  res.status(200).json({ message: 'Change phone number successfully.' });
});
