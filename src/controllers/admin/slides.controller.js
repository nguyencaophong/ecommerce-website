const Slide = require('../../schemas/slide.schema');
const Slideshow = require('../../schemas/slides-show.schema');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const fileHelper = require('../../utils/transfer.util');
const Action = require('../../models/action.enum');
const filter = require('../../utils/filter.util');
const _ = require('lodash');

module.exports.list = catchAsync(async (req, res, next) => {
  return res.status(200).json({
    message: 'Get all slide success',
    data: await filter.getSlides(req.user),
  });
});

module.exports.create = catchAsync(async (req, res, next) => {
  const { title, description, navigate, coordinates, width, height } = req.body;
  const imageSlide = req.file;
  const slides = await Slide.accessibleBy(ability(req.user)).find();

  if (!imageSlide) {
    return next(new AppError('Image Slide file is missing'));
  }
  if (_.some(slides, { title, description, navigate })) {
    return next(
      new AppError('Duplicate data, please provide difference value'),
    );
  }

  const newSlide = new Slide({
    title,
    description,
    navigate,
    coordinates: JSON.parse(coordinates),
    width,
    height,
    image: fileHelper.uploadSingleFile(imageSlide),
  });
  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Create,
    newSlide,
  );
  await newSlide.save();
  console.log(newSlide);

  res.status(200).json({
    msg: 'Create slide success',
    data: newSlide,
  });
});

module.exports.read = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const slide = await Slide.findById(id);
  if (!slide) return res.status(404).json({ message: 'Slide not found.' });

  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read, slide);

  res.status(200).json({
    message: 'Get data success!',
    data: slide,
  });
});

module.exports.update = catchAsync(async (req, res, next) => {
  const { title, description, navigate, coordinates, width, height } = req.body;
  const id = req.params.id;
  const slideFound = await Slide.findById(id);
  const slides = await Slide.accessibleBy(ability(req.user)).find();

  if (!slideFound) {
    return next(new AppError(`Slide not found`));
  }

  if (_.some(slides, { title, description, navigate })) {
    return next(
      new AppError('Duplicate data, please provide difference value'),
    );
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Update,
    slideFound,
  );

  const slideUpdated = await Slide.findByIdAndUpdate(
    id,
    {
      title,
      description,
      navigate,
      coordinates: JSON.parse(coordinates),
      width,
      height,
      image: req.file
        ? fileHelper.updateSingleFile(req.file, slideFound.image)
        : slideFound.image,
    },
    { new: true },
  );

  res.status(200).json({
    message: `Update slide ${slideFound.title} success!`,
    data: slideUpdated,
  });
});

module.exports.delete = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const slideFound = await Slide.findById(id);
  if (!slideFound) return res.status(404).json({ message: 'Slide not found.' });

  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Delete,
    slideFound,
  );
  fileHelper.deleteFile(slideFound.image);
  await slideFound.remove();

  await Slideshow.updateMany({}, { $pull: { slides: { $in: [id] } } });

  await res.status(200).json({
    message: `Delete item ${slideFound.title} success!`,
  });
});
