const Student = require('../../schemas/student.schema');
const Course = require('../../schemas/course.schema');
const History = require('../../models/history.model');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const fileHelper = require('../../utils/transfer.util');
const { formatSlug } = require('../../utils/converter.util');
const { isObjectId } = require('../../utils/checker.util');
const {
  updateSingleFile,
  deleteFile,
  deleteMulFile,
} = require('../../utils/transfer.util');
const Action = require('../../models/action.enum');
const LevelCourse = require('../../models/level_course.enum');
const ImageConstant = require('../../common/constant/images.constant');
const { route } = require('../../routes/auth.routes');
const { destination } = require('../../middleware/transfer.middleware');
const Pagination = require('../../utils/pagination.util');
const timeNow = new Date();

module.exports.list = catchAsync(async (req, res, next) => {
  const features = new Pagination(
    Course.accessibleBy(ability(req.user)).find(),
    req.query,
  )
    .pagination()
    .sorting()
    .filtering()
    .searching();
  const courses = await features.query;
  const regex = new RegExp(req.query?.search || '', 'i');
  // count document with params
  const countDocuments = await Course.countDocuments({
    $or: [
      { name: { $regex: regex } },
      { slug: { $regex: regex } },
      { description: { $regex: regex } },
      { teacher: { $regex: regex } },
    ],
  });
  res.status(200).json({
    message: 'Get All Course successfully.',
    data: courses,
    countDocuments,
  });
});

module.exports.create = catchAsync(async (req, res, next) => {
  const {
    name,
    description,
    teacher,
    level,
    price,
    timeOpening,
    timeExpire,
    maxQuantity,
    reducePrice,
  } = req.body;
  let imgPath;

  if (!Object.values(LevelCourse).includes(level)) {
    return next(new AppError('Invalid level course.', 400));
  }
  req.file
    ? (imgPath = `/images/${destination[req.file.fieldname]}/${
        req.file.filename
      }`)
    : (imgPath = ImageConstant.course);
  const coursePresent = await Course.findOne({
    name,
    timeOpening,
    timeExpire,
    level,
  });
  if (coursePresent) {
    return res.status(400).json({ message: 'Khóa học này đã có sẵn' });
  }

  const newCourse = await new Course({
    name,
    level,
    description,
    timeOpening,
    timeExpire,
    price,
    image: imgPath,
    maxQuantity,
    reducePrice,
    teacher,
    slug: formatSlug(name, { isEdit: false, oldSlug: null }),
  });
  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Create,
    newCourse,
  );
  const course = await newCourse.save();

  await new History(
    undefined,
    req.user._id,
    timeNow,
    `Thêm khóa học (${name}) ở mục Course`,
  ).create();
  return res.status(200).json({
    message: 'Add New Course successfully !',
    data: course,
  });
});

module.exports.getInfo = catchAsync(async (req, res, next) => {
  const idOrSlug = req.params.id;
  const course = isObjectId(idOrSlug)
    ? await Course.findById(idOrSlug)
    : await Course.findOne({ slug: idOrSlug });
  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read, course);

  res.status(200).json({
    message: 'Info Course',
    data: course,
  });
});

module.exports.update = catchAsync(async (req, res, next) => {
  const {
    name,
    description,
    level,
    priceCourse,
    timeOpening,
    timeExpire,
    maxQuantity,
    reducePrice,
  } = req.body;
  const id = req.params.id;

  const course = await Course.findById(id);
  if (!course) {
    return next(new AppError('Course not found!', 404));
  }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update, course);
  const newCourse = {
    name,
    level,
    description,
    timeOpening,
    timeExpire,
    priceCourse,
    image: updateSingleFile(req.file, course.image),
    maxQuantity,
    reducePrice,
    slug: formatSlug(name, { isEdit: true, oldSlug: course.slug }),
  };

  const updatedCourse = await Course.findByIdAndUpdate(
    id,
    { $set: newCourse },
    { new: true },
  );
  await new History(
    undefined,
    req.user._id,
    timeNow,
    `Cập nhật khóa học (${course.nameCourse}) ở mục Course`,
  ).create();
  res.status(200).json({
    message: 'Update Course',
    data: updatedCourse,
  });
});

module.exports.delete = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const course = await Course.findById(id);
  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete, course);
  if (course.listUser.length > 0) {
    return res.status(400).json({
      message: 'The course is currently being studied, cannot be deleted',
    });
  }

  await Course.findByIdAndDelete(id);
  await deleteFile(course.image);

  // **  Filter course in listCourse when delete course with admin role
  const students = await Student.find();
  for (let student of students) {
    await student.filterCourse(id);
  }
  await new History(
    undefined,
    req.user._id,
    timeNow,
    `Xóa khóa học (${course.nameCourse}) ở mục Course`,
    course,
  ).create();
  res.status(200).json({
    message: 'Delete Course successfully',
    data: course,
  });
});

module.exports.createInfo = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const element = req.params.children;
  let data;

  let course = await Course.findById(id);
  if (!course) {
    return next(new AppError(`Course not found!`, 404));
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update, course);
  switch (element) {
    case 'lession': {
      data = req.body.lession;
      course = await Course.findByIdAndUpdate(
        id,
        { $push: { listLession: data } },
        { new: true },
      );
      break;
    }
    case 'willlearn': {
      data = req.body.willlearn;
      course = await Course.findByIdAndUpdate(
        id,
        { $set: { willLearn: data } },
        { new: true },
      );
      break;
    }
    case 'studyRoute': {
      data = req.body.studyRoute;
      course = await Course.findByIdAndUpdate(
        id,
        { $push: { studyRoute: data } },
        { new: true },
      );
      break;
    }
    default:
      return next(new AppError(`Invalid param children!`, 404));
  }

  await new History(
    undefined,
    req.user._id,
    timeNow,
    `Thêm ${element} của khóa học  ${course.name}`,
  ).create();
  res.status(200).json({
    message: `Add ${element} success!`,
    data: course,
  });
});

module.exports.updateInfo = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  let course = await Course.findById(id);
  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update, course);
  const updateCourse = await Course.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  await new History(
    undefined,
    req.user._id,
    timeNow,
    `Cập nhật thông tin chi tiết của khóa học  ${course.name}`,
  ).create();
  return res.status(200).json({
    message: `Cập nhật thông tin chi tiết khóa học thành công`,
    data: updateCourse,
  });
});

module.exports.deleteInfo = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const element = req.params.children;
  const course = await Course.findById(id);
  const index = req.params.index;

  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update, course);
  switch (element) {
    case 'lession': {
      await Course.updateOne(
        { _id: id, 'listLession._id': index },
        { $pull: { listLession: { _id: index } } },
      );
      break;
    }
    case 'studyRoute': {
      await Course.updateOne(
        { _id: id, 'studyRoute._id': index },
        { $pull: { studyRoute: { _id: index } } },
      );
      break;
    }
    case 'user': {
      ForbiddenError.from(ability(req.user)).throwUnlessCan(
        Action.Delete,
        course,
      );
      await course.removeChildrenCourse(element, index);

      // **  filter list student of course;
      const populateStudent = await course.populate('listUser.items.userId');
      const listItem = populateStudent.listUser.items;

      // **  copy data in listItem and exec filter;
      let listData = [...listItem],
        listResult = [];
      for (const item of listData) {
        if (item.userId) {
          const { listCourse, ...others } = item.userId._doc;
          listResult.push({ ...others });
        }
      }
    }
    default:
      break;
  }

  await new History(
    undefined,
    req.user._id,
    timeNow,
    `Xóa ${element} của khóa học  ${course.name}`,
  ).create();
  return res.status(200).json({
    message: `Delete ${element} success!`,
    data: await Course.findById(id),
  });
});
