const New = require('../../schemas/new.schema');
const History = require('../../models/history.model');
const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const { ForbiddenError } = require('@casl/ability');
const filter = require('../../utils/filter.util');
const { formatSlug } = require('../../utils/converter.util');
const { isObjectId } = require('../../utils/checker.util');
const Action = require('../../models/action.enum');
const {
  uploadSingleFile,
  updateSingleFile,
  deleteFile,
} = require('../../utils/transfer.util');
const modeNewsEnum = require('../../models/mode_news.enum');
const Category = require('../../schemas/categories.schema');
const { format } = require('morgan');
const Pagination = require('../../utils/pagination.util');
const timeNow = new Date();

// module.exports.list = catchAsync(async (req, res, next) => {
//   const filter = {};
//   if (req.query.category) {
//     filter.categories = { $in: req.query.category };
//   }
//   console.log('filter: ', filter);
//   const features = new Pagination(
//     New.accessibleBy(ability(req.user)).find(filter).populate('categories'),
//     req.query,
//   )
//     .pagination()
//     .sorting()
//     .filtering()
//     .searching();
//   const posts = await features.query;
//   const regex = new RegExp(req.query?.search || '', 'i');
//   // count document with params
//   const countDocuments = await New.countDocuments({
//     $or: [
//       { 'title.value': { $regex: regex } },
//       { 'summary.value': { $regex: regex } },
//       { 'content.value': { $regex: regex } },
//       {
//         tags: { $regex: decodeURIComponent(req.query.search || '') },
//       },
//     ],
//     ...filter,
//   });
//   res.status(200).json({
//     message: 'Get all news success!',
//     data: posts,
//     countDocuments,
//   });
// });
module.exports.list = catchAsync(async (req, res, next) => {
  const { language } = req.params;

  const filter = {
    title: { $elemMatch: { lang: language } },
    content: { $elemMatch: { lang: language } },
    summary: { $elemMatch: { lang: language } },
  };
  if (req.query.category) {
    filter.categories = { $in: req.query.category };
  }
  const features = new Pagination(
    New.accessibleBy(ability(req.user)).find(filter).populate({
      path: 'categories',
    }),
    req.query,
  )
    .pagination()
    .sorting()
    .filtering()
    .searching();
  const regex = new RegExp(req.query?.search || '', 'i');
  // count document with params
  const [posts, countDocuments] = await Promise.all([
    features.query,
    New.countDocuments({
      ...filter,
      $or: [
        { 'title.value': { $regex: regex } },
        { 'summary.value': { $regex: regex } },
        { 'content.value': { $regex: regex } },
        { author: { $regex: regex } },
        {
          tags: { $regex: decodeURIComponent(req.query.search || '') },
        },
      ],
    }),
  ]);
  res.status(200).json({
    message: 'Get all news success!',
    data: posts.map((post) => filterNewsByLanguage(post, language)),
    countDocuments,
  });
});
module.exports.getInfo = catchAsync(async (req, res, next) => {
  const { language, id: idOrSlug } = req.params;
  const filter = {
    title: { $elemMatch: { lang: language } },
    content: { $elemMatch: { lang: language } },
    summary: { $elemMatch: { lang: language } },
  };
  isObjectId(idOrSlug) ? (filter._id = idOrSlug) : (filter.slug = idOrSlug);
  const post = await New.findOne(filter)
    .populate('mode')
    .populate({
      path: 'categories',
      match: { 'categories.name.lang': language },
    });
  if (!post) {
    return next(new AppError('post not found!', 404));
  }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read, post);
  res.status(200).json({
    message: 'Get data success!',
    data: filterNewsByLanguage(post, language),
  });
});

// module.exports.getInfo = catchAsync(async (req, res, next) => {
//   const { id: idOrSlug } = req.params;
//   const post = isObjectId(idOrSlug)
//     ? await New.findById(idOrSlug).populate('mode').populate('categories')
//     : await New.findOne({ slug: idOrSlug })
//         .populate('mode')
//         .populate('categories');

//   if (!post) {
//     return next(new AppError('post not found!', 404));
//   }
//   ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read, post);
//   res.status(200).json({
//     message: 'Get data success!',
//     data: post,
//   });
// });

module.exports.create = catchAsync(async (req, res, next) => {
  const { title, summary, content, author, mode, tags, categories, image } =
    req.body;
  if (!Object.values(modeNewsEnum).includes(mode)) {
    return next(new AppError('Invalid mode', 400));
  }
  if (!image) {
    return next(new AppError('Image is required', 400));
  }
  if (categories?.length > 0) {
    for (let category of categories) {
      const isCategoryPresent = await Category.findById(category);
      if (!isCategoryPresent) {
        return next(new AppError('Category not found', 400));
      }
    }
  }
  if (
    mode === modeNewsEnum.pending &&
    new Date(req.body.time_public) <= new Date()
  ) {
    return next(
      new AppError(
        `Mode is pending require time public must be greater than current date`,
        400,
      ),
    );
  }
  if (mode === modeNewsEnum.public) {
    req.body.time_public = new Date();
  }
  const post = new New({
    title,
    summary,
    content,
    author,
    mode,
    image,
    tags,
    slug: formatSlug(
      title.find((item) => item.lang === 'en')?.value || title[0].value,
      { isEdit: false, oldSlug: null },
    ),
    categories,
    time_public: req.body.time_public,
  });
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Create, post);
  await Promise.all([
    post.save(),
    new History(
      undefined,
      req.user._id,
      timeNow,
      `Thêm bài post ${title[0].value} ở mục Sharing`,
    ).create(),
  ]);

  res.status(201).json({
    message: 'Add new post success!',
    data: post,
  });
});

// module.exports.create = catchAsync(async (req, res, next) => {
//   const { title, summary, content, author, mode, tags, categories } = {
//     ...req.body,
//     tags: req.body.tags.split(',').filter(Boolean),
//     categories: req.body.categories.split(',').filter(Boolean),
//   };
//   if (!req.file) {
//     return res.status(400).json({ message: 'Image is required' });
//   }
//   if (!Object.values(modeNewsEnum).includes(mode)) {
//     return next(new AppError('Invalid mode', 400));
//   }
//   if (categories?.length > 0) {
//     for (let category of categories) {
//       const isCategoryPresent = await Category.findById(category);
//       if (!isCategoryPresent) {
//         return next(new AppError('Category not found', 400));
//       }
//     }
//   }
//   if (
//     mode === modeNewsEnum.pending &&
//     new Date(req.body.time_public) <= new Date()
//   ) {
//     return next(
//       new AppError(
//         `Mode is pending require time public must be greater than current date`,
//         400,
//       ),
//     );
//   }
//   if (mode === modeNewsEnum.public) {
//     req.body.time_public = new Date();
//   }
//   const post = new New({
//     title,
//     summary,
//     content,
//     author,
//     image: uploadSingleFile(req.file),
//     mode,
//     tags,
//     slug: formatSlug(title, { isEdit: false, oldSlug: null }),
//     categories,
//     time_public: req.body.time_public,
//   });
//   ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Create, post);
//   await post.save();

//   await new History(
//     undefined,
//     req.user._id,
//     timeNow,
//     `Thêm bài post ${title} ở mục Sharing`,
//   ).create();
//   res.status(201).json({
//     message: 'Add new post success!',
//     data: await filter.getNews(req.user),
//   });
// });

module.exports.update = catchAsync(async (req, res, next) => {
  const { id, language } = req.params;
  const { title, summary, content, author, mode, tags, categories, image } =
    req.body;

  const post = await New.findById(id);
  if (!post) {
    return next(new AppError('New not found!', 404));
  }
  if (categories?.length > 0) {
    for (let cate of categories) {
      const isCategoryPresent = await Category.findById(cate);
      if (!isCategoryPresent) {
        return next(new AppError('Category Not found!', 404));
      }
    }
  }
  if (
    mode === modeNewsEnum.pending &&
    new Date(req.body.time_public) <= new Date()
  ) {
    return next(
      new AppError(
        `Mode is pending require time public must be greater than current date`,
        400,
      ),
    );
  }
  if (mode === modeNewsEnum.public) {
    req.body.time_public = new Date();
  }

  const updatedPost = {
    author,
    mode,
    tags: tags.length > 0 ? tags : post.tags,
    categories: categories.length > 0 ? categories : post.categories,
  };
  if (image) {
    // remove old image : req.file ? updateSingleFile(req.file, post.image) : post.image,
    updatedPost.image = image;
    deleteFile(post.image);
  }
  if (language === 'en') {
    updatedPost.slug = formatSlug(title, { isEdit: true, oldSlug: post.slug });
  }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update, post);

  const filter = {
    _id: id,
    title: { $elemMatch: { lang: language } },
    summary: { $elemMatch: { lang: language } },
    content: { $elemMatch: { lang: language } },
  };
  const update = {
    $set: {
      'title.$.value': title,
      'summary.$.value': summary,
      'content.$.value': content,
      ...updatedPost,
    },
  };
  const [updatedNews] = await Promise.all([
    New.updateOne(filter, update, { new: true }),
    new History(
      undefined,
      req.user._id,
      timeNow,
      `Cập nhật bài post ${
        filterNewsByLanguage(post, language).title
      } ở mục Sharing`,
    ).create(),
  ]);
  res.status(200).json({
    message: `Update bài chia sẻ ${
      filterNewsByLanguage(post, language).title
    } success!`,
    data: updatedNews,
  });
});

module.exports.delete = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const post = await New.findById(id);
  if (!post) {
    return next(new AppError('Invalid param id value!', 422));
  }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Delete, post);
  await Promise.all([
    post.remove(),
    new History(
      undefined,
      req.user._id,
      timeNow,
      `Xóa bài post ${post.title} ở mục Sharing`,
      post,
    ).create(),
  ]);
  deleteFile(post.image);
  res.status(200).json({
    message: 'Delete success!',
    data: post,
  });
});

function filterNewsByLanguage(news, language) {
  return {
    ...news._doc,
    content:
      news._doc.content.find((c) => c.lang === language)?.value ||
      news._doc.content[0].value,
    title:
      news._doc.title.find((c) => c.lang === language)?.value ||
      news._doc.title[0].value,
    summary:
      news._doc.summary.find((c) => c.lang === language)?.value ||
      news._doc.summary[0].value,
    categories: news._doc.categories.map((c) =>
      filterCategoryByLanguage(c, language),
    ),
  };
}

function filterCategoryByLanguage(category, language) {
  return {
    ...category._doc,
    name:
      category._doc.name.find((c) => c.lang === language)?.value ||
      category._doc.name[0].value,
  };
}
