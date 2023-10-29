const Student = require('../../schemas/student.schema');
const roleSchema = require('../../schemas/role.schema');
const Role = require('../../models/role.model');
const User = require('../../models/user.model');
const roles = require('../../models/role.enum');
const Sex = require('../../models/sex.enum');
const catchAsync = require('../../middleware/catcher.middleware');
const checker = require('../../utils/checker.util');
const Action = require('../../models/action.enum');
const permissions = require('../../models/permission.enum');
const roleEnum = require('../../models/role.enum');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');

module.exports.create = catchAsync(async (req, res, next) => {
  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Create,
    User.name,
  );
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

  const user = await new User(
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
  ).create(req);

  let role = await roleSchema.findOne({ name: roles.User });
  if (!role) {
    role = await new roleSchema({
      name: roles.User,
      permissions: permissions.User,
    }).save();
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
    [role._id],
  ).updateRole();
  res.status(201).json({ message: 'Save successfully.' });
});

module.exports.list = catchAsync(async (req, res, next) => {
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read, {
    action: 'read-user',
  });

  const users = await new User().list(req);
  res.status(200).json({
    message: 'Get All User successfully!',
    data: users,
  });
});

module.exports.updateRoles = catchAsync(async (req, res) => {
  const { roles } = req.body;
  const id = req.params.id;

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update, {
    action: 'update-user',
  });
  await new User(
    id,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    roles,
  ).updateRole(req);
  roles.forEach(async (i) => {
    const role = await new Role(i).read();
    if (role.name === roleEnum.Student) {
      await new Student({ _uid: id }).save();
    }
  });
  res.status(200).json({
    message: 'Update successfully!',
  });
});

module.exports.delete = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  await new User(id).delete(req);
  res.status(200).json({
    message: 'Delete User successfully!',
  });
});

module.exports.block = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await new User(id).block(req);
  res.status(200).json({
    message: `Changed ${user.full_name.first} ${user.full_name.last} access permission!`,
  });
});
