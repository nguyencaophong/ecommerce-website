const New = require('../../schemas/new.schema');
const Categories = require('../../schemas/categories.schema');
const History = require('../../models/history.model');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const Action = require('../../models/action.enum');
const { formatSlug } = require('../../utils/converter.util');
const { isObjectId } = require('../../utils/checker.util');
const newSchema = require('../../schemas/new.schema');
const Pagination = require('../../utils/pagination.util');
const filter = require('../../utils/filter.util');
const timeNow = new Date();

module.exports.list = catchAsync(async (req, res, next) => {
  const { language } = req.params;
  const categories = await Categories.find({
    name: { $elemMatch: { lang: language } },
  });
  // const categories = await getCategories(req.user,req.query);
  res.status(200).json({
    message: 'Get all sharing of categories success !',
    data: categories.map((cat) => this.filterCategoryByLanguage(cat, language)),
  });
});
module.exports.listByChildren = catchAsync(async (req, res, next) => {
  console.log('lang: ', req.params.language);
  const categories = await filter.getCategories(
    req.user,
    req.query,
    req.params.language,
  );
  res.status(200).json({
    message: 'Get all sharing of categories success !',
    data: categories,
  });
});

module.exports.getInfo = catchAsync(async (req, res, next) => {
  const idOrSlug = req.params.id;

  let category = isObjectId(idOrSlug)
    ? await Categories.findById(idOrSlug)
    : await Categories.findOne({ slug: idOrSlug });
  if (!category) {
    return next(new AppError('Categories not found!', 404));
  }
  category = await filter.recursiveTree(category, language);
  res.status(200).json({
    message: `Get data of ${category.name} success`,
    data: category,
  });
});

module.exports.create = catchAsync(async (req, res, next) => {
  const { name, parent } = req.body;
  const category = new Categories({
    name,
    slug: formatSlug(
      name.find((item) => item.lang === 'en')?.value || name[0].value,
      null,
    ),
  });
  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Create,
    category,
  );
  await category.save();

  // ** add newCategories into children array of categories others
  const updateCates = [];
  if (parent?.length > 0) {
    updateCates = parent.map((cat) =>
      Categories.findByIdAndUpdate(
        { _id: cat },
        { $push: { children: category._id } },
      ),
    );
  }
  await Promise.all([
    ...updateCates,
    new History(
      undefined,
      req.user._id,
      timeNow,
      `Thêm mới categories (${name}) ở mục Sharing`,
    ).create(),
  ]);

  res.status(201).json({
    message: 'Create new categories success',
    data: category,
  });
});

module.exports.update = catchAsync(async (req, res, next) => {
  const { id, language } = req.params;
  const { name, parentId } = req.body;
  console.log({ name, parentId });

  const category = await Categories.findById(id);
  if (!category) {
    return next(new AppError('Categories not found!', 404));
  }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Update,
    category,
  );

  if (name) {
    const filter = {
      _id: id,
      name: { $elemMatch: { lang: language } },
    };
    const update = {
      $set: {
        'name.$.value': name,
        slug: language === 'en' ? formatSlug(name, null) : category.slug,
      },
    };
    await Categories.updateOne(filter, update, { new: true });
  }

  // ** update parent category
  if (parentId) {
    const [cateParent, updateCates] = await Promise.all([
      Categories.findById(parentId),
      Categories.updateMany(
        {
          $in: [id],
        },
        {
          $pull: {
            children: {
              $in: [id],
            },
          },
        },
        { new: true },
      ),
    ]);
    if (!cateParent) {
      return next(new AppError('Categories parent not found!', 404));
    }
    await cateParent.updateOne({ $addToSet: { children: category._id } });
  }

  await new History(
    undefined,
    req.user._id,
    timeNow,
    `Cập nhật categories (${category.name}) ở mục Sharing`,
  ).create();
  res.status(200).json({
    message: 'Update categories success',
    data: await filter.getCategories(req.user, req.query, language),
  });
});

module.exports.delete = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const category = await Categories.findById(id).populate('children');

  if (!category) {
    return next(new AppError('Categories not found!', 404));
  }
  if (category.children?.length > 0) {
    return res.status(400).json({
      message: `Category currently have ${category.children.length} subcategories, cannot be deleted`,
    });
  }
  const newsByCategory = await newSchema.find({
    categories: { $in: category._id },
  });
  if (newsByCategory.length > 0) {
    return res.status(400).json({
      message: `Category currently have ${newsByCategory.length} news, cannot be deleted`,
    });
  }

  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Delete,
    category,
  );
  await category.remove();
  await Categories.updateMany(
    {
      $in: [id],
    },
    {
      $pull: {
        children: {
          $in: [id],
        },
      },
    },
    { new: true },
  );
  await new History(
    undefined,
    req.user._id,
    timeNow,
    `Xóa categories ${category.name} ở mục Sharing`,
  ).create();
  res.status(200).json({
    message: 'Delete categories success',
  });
});
module.exports.filterCategoryByLanguage = (category, language) => {
  return {
    ...category._doc,
    name:
      category._doc.name.find((c) => c.lang === language)?.value ||
      category._doc.name[0].value,
  };
};
