const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const Action = require('../../models/action.enum');
const Course = require('../../schemas/course.schema');
const { ForbiddenError } = require('@casl/ability');
const New = require('../../schemas/new.schema');
const Visit = require('../../schemas/visit.schema');
const Student = require('../../schemas/student.schema');


module.exports.getTotal = catchAsync(async (req, res, next) => {
  const [totalVisit,totalCourse,totalNew,totalStudent] = await Promise.all([Visit.accessibleBy(ability(req.user)).countDocuments(),Course.accessibleBy(ability(req.user)).countDocuments(),New.accessibleBy(ability(req.user)).countDocuments(),Student.accessibleBy(ability(req.user)).countDocuments()]);
  res
    .status(200)
    .json({ message: `Get total info success`, total: {totalVisit,totalCourse,totalNew,totalStudent}});
})
