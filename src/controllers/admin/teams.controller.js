const Team = require('../../schemas/team.schema');
const TeamGroup = require('../../schemas/team_group.schema');
const TeamPosition = require('../../schemas/team_position.schema');
const User = require('../../models/user.model');
const History = require('../../models/history.model');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const fileHelper = require('../../utils/transfer.util');
const checker = require('../../utils/checker.util');
const filter = require('../../utils/filter.util');
const { updateSingleFile } = require('../../utils/transfer.util');
const Sex = require('../../models/sex.enum');
const Action = require('../../models/action.enum');
const timeNow = new Date();
const { ImageConstant } = require('../../common/constant/images.constant');
const { destination } = require('../../middleware/transfer.middleware');

module.exports.list = catchAsync(async (req, res, next) => {
  res.status(200).json({
    message: 'Get data success',
    data: await filter.getTeams(),
  });
});

module.exports.read = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const team = await Team.findById(id)
    .populate('_uid')
    .populate('position')
    .populate('listGroup');
  if (!team) {
    return res.status(404).json({ message: 'Team not found.' });
  }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read, team);
  res.status(200).json({
    message: 'Get data success!',
    data: team,
  });
});

module.exports.create = catchAsync(async (req, res, next) => {
  const {
    full_name,
    email,
    phone,
    sex,
    birthday,
    academicLevel,
    position,
    experience,
    groupId,
  } = req.body;
  let imagePath;

  if (!checker.isEmail(email)) {
    return next(new AppError('Invalid email value!', 422));
  }
  if (!checker.isPhone(phone)) {
    return next(new AppError('Invalid phone value!', 422));
  }
  if (
    new Date().getFullYear() -
      new Date(birthday.year, birthday.month).getFullYear() <
    5
  ) {
    return next(new AppError('You must be 5 years or older!', 400));
  }
  if (!Object.values(Sex).includes(sex)) {
    return next(new AppError('Invalid gender!', 400));
  }
  const isGroupPresent = await TeamGroup.findById(groupId);
  if (!isGroupPresent) {
    return next(new AppError('GroupId not found!', 404));
  }
  const isPositionPresent = await TeamPosition.findById(position);
  if (!isPositionPresent) {
    return next(new AppError('Position not found!', 404));
  }

  req.file
    ? (imagePath = `/images/${destination[req.file.fieldname]}${
        req.file.filename
      }`)
    : (imagePath = ImageConstant.team);

  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Create,
    User.name,
  );
  const user = await new User(
    undefined, // ** id
    imagePath,
    JSON.parse(full_name),
    email,
    phone,
    undefined, // ** username
    process.env.SGODWEB_TEAM_PASSWORD,
    undefined, // ** blocked
    undefined, // ** roles
    sex,
    undefined,
  ).create();

  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Create,
    Team.name,
  );
  try {
    const team = await new Team({
      _uid: user._id,
      academicLevel,
      position,
      experience,
      listGroup: [groupId],
    }).save();
    await TeamGroup.updateOne(
      { _id: groupId },
      { $push: { listMember: team._id } },
    );

    await new History(
      undefined,
      req.user._id,
      timeNow,
      `Thên mới thành viên ${full_name.first} ${full_name.last} ở mục Teams`,
    ).create();
    res.status(201).json({
      message: `Thêm thành viên thành công !`,
      data: await filter.getTeams(),
    });
  } catch (error) {
    // ** rollback when create team fail
    console.log(error.message);
    await user.remove();
    next(error);
  }
});

module.exports.update = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const { full_name, email, phone, sex, birthday, academicLevel, experience } =
    req.body;

  if (!checker.isEmail(email)) {
    return next(new AppError('Invalid email value!', 422));
  }
  if (!checker.isPhone(phone)) {
    return next(new AppError('Invalid phone value!', 422));
  }
  if (
    new Date().getFullYear() -
      new Date(birthday.year, birthday.month).getFullYear() <
    5
  ) {
    return next(new AppError('You must be 5 years or older!', 400));
  }
  if (!Object.values(Sex).includes(sex)) {
    return next(new AppError('Invalid gender!', 400));
  }
  const team = await Team.findById(id).populate('_uid');
  if (!team) {
    return next(new AppError('Team not found!', 404));
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Update,
    User.name,
  );
  const user = await new User(
    team._uid,
    updateSingleFile(req.file, team._uid.avatar),
    JSON.parse(full_name),
    email,
    phone,
    undefined, // ** username
    undefined, // ** password
    undefined, // ** blocked
    undefined, // ** roles
    sex,
    undefined,
  ).update(req);

  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Update,
    Team.name,
  );
  try {
    await Team.findByIdAndUpdate(id, {
      _uid: user._id,
      academicLevel,
      experience,
    });

    await new History(
      undefined,
      req.user._id,
      timeNow,
      `Cập nhật thành viên ${full_name.first} ${full_name.last} ở mục Teams`,
    ).create();
    res.status(201).json({
      message: `Cập nhật thành viên thành công !`,
      data: await filter.getTeams(),
    });
  } catch (error) {
    // ** rollback when create team fail
    await user.remove();
    next(error);
  }
});

module.exports.delete = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const team = await Team.findById(id);
  if (!team) {
    return res.status(404).json({ message: 'Team not found.' });
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete, team);
  await team.remove();

  // ** delete this team in teamgroup
  const listTeamGroup = await TeamGroup.accessibleBy(ability(req.user)).find();
  for (let e of listTeamGroup) {
    ForbiddenError.from(ability(req.user)).throwUnlessCan('write', e);
    await e.updateOne({ $pull: { listTeam: { idTeam: id } } }, { new: true });
  }

  // ** exec delete image file
  if (team.image !== ImageConstant.team) {
    fileHelper.deleteFile(team.image);
  }

  await new History(
    undefined,
    req.user._id,
    timeNow,
    `Xóa thành viên ${team.name} ở mục Teams`,
    team,
  ).create();
  res.status(200).json({
    message: `Delete team ${team.name} success!`,
    data: await filter.getTeams(),
  });
});
