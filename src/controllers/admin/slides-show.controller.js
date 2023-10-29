const Slideshow = require('../../schemas/slides-show.schema');
const Slide = require('../../schemas/slide.schema');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const AppError = require('../../utils/app_error.util');
const catchAsync = require('../../middleware/catcher.middleware');
const Action = require('../../models/action.enum');
const effectEnum = require('../../models/effect.enum');
const _ = require('lodash');
const { isObjectId } = require('../../utils/checker.util');

module.exports.list = catchAsync(async (req, res, next) => {
  return res.status(200).json({
    message: 'Get all slides show success',
    data: await Slideshow.accessibleBy(ability(req.user)).find(),
  });
});

module.exports.create = catchAsync(async (req, res, next) => {
  const { name, slides, effect } = req.body;

  const slidesShow = await Slideshow.findOne({ name, effect });
  if (slidesShow) {
    return next(
      new AppError('Duplicate data, please provide difference value'),
    );
  }

  if (!Object.values(effectEnum).includes(effect)) {
    return next(new AppError(`Invalid effect enum: ${effect} value!`, 404));
  }

  for (const slide of slides) {
    const slideFound = isObjectId(slide)
      ? await Slide.findById(slide)
      : next(new AppError('Invalid slide id', 400));
    if (!slideFound) {
      return next(
        new AppError(
          'Slide id not found, please provide a valid ID that exist in Slide',
          404,
        ),
      );
    }
  }

  const newSlidesShow = new Slideshow({
    name,
    slides,
    effect,
    display: false,
  });

  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Create,
    newSlidesShow,
  );

  await newSlidesShow.save();

  res.status(200).json({
    msg: 'Create slide show success',
    data: newSlidesShow,
  });
});

module.exports.read = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const slideShowFound = await Slideshow.findById(id).populate('slides');

  if (!slideShowFound) {
    next(new AppError('Slide show not found', 404));
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Read,
    slideShowFound,
  );

  res.status(200).json({
    msg: 'Get Slide show success',
    data: slideShowFound,
  });
});

module.exports.update = catchAsync(async (req, res, next) => {
  const { name, slides, effect, display } = req.body;
  const id = req.params.id;

  const slideShowFound = await Slideshow.findById(id);
  if (!slideShowFound) {
    next(new AppError('Slide show not found', 404));
  }

  const slidesShow = await Slideshow.findOne({ name, effect });
  if (slidesShow) {
    return next(
      new AppError('Duplicate data, please provide difference value'),
    );
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Update,
    slideShowFound,
  );

  await slideShowFound.updateOne(
    { name, slides, effect, display },
    { new: true },
  );

  await Slideshow.updateMany(
    { _id: { $ne: id } },
    { $set: { display: false } },
    { new: true },
  );

  res.status(200).json({
    msg: 'Get slide show updated success',
    data: await Slideshow.findById(id),
  });
});

module.exports.delete = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const slideShowFound = await Slideshow.findById(id);
  if (slideShowFound) {
    next(new AppError('Slide show not found', 404));
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Delete,
    slideShowFound,
  );

  slideShowFound.deleteOne();
});
