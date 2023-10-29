const catchAsync = require('../../middleware/catcher.middleware');
const AppError = require('../../utils/app_error.util');
const ability = require('../../casl/casl.factory');
const Action = require('../../models/action.enum');
const { ForbiddenError } = require('@casl/ability');
const {
  updateSingleFile,
  uploadSingleFile,
  renameFile,
  deleteImageFile,
} = require('../../utils/transfer.util');
const Common = require('../../schemas/common.schema');
const History = require('../../schemas/history.schema');
const commonEnum = require('../../models/common.enum');

module.exports.readCommon = catchAsync(async (req, res, next) => {
  const { language } = req.params;

  const common = await Common.find({
    title: { $elemMatch: { lang: language } },
    description: { $elemMatch: { lang: language } },
  });
  ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Read, common);
  res.status(200).json({
    message: 'Tải dữ liệu thành công',
    data: common.map((c) => filterCommonByLanguage(c, language)),
  });
});

module.exports.updateCommon = catchAsync(async (req, res, next) => {
  const {
    body: { title, description },
    params: { id, language },
  } = req;
  const commonFound = await Common.findById(id);
  if (!commonFound) {
    return next(new AppError('Not Found', 404));
  }
  // if (!Object.values(commonEnum).includes(title)) {
  //   return next(new AppError('Invalid Title', 400));
  // }
  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Update,
    commonFound,
  );
  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Update,
    commonFound,
  );
  const image = req.file
    ? updateSingleFile(req.file, commonFound.image)
    : commonFound.image;
  const filter = {
    _id: id,
    title: { $elemMatch: { lang: language } },
    description: { $elemMatch: { lang: language } },
  };
  const update = {
    $set: {
      'title.$.value': title,
      'description.$.value': description,
      image,
    },
  };
  await Promise.all([
    Common.updateOne(filter, update, { new: true }),
    History.create({
      object: undefined,
      _uid: req.user._id,
      time: Date.now(),
      action: `Cập nhật nội dung common thành công`,
    }),
  ]);

  res.status(200).json({
    message: 'Update Common Success',
  });
});

module.exports.previewImage = async (req, res) => {
  try {
    const image = req.files[0];
    let imageUrlDetail, formatImageUrl;
    if (!image) {
      imageUrlDetail = itemDetail.image;
    } else {
      // **  format imageUrl before upload and save;
      formatImageUrl = includes.formatUrlImage(image.path);
      formatImageUrl = `images/${formatImageUrl}`;
      imageUrlDetail = formatImageUrl;
      renameFile(image.path, formatImageUrl);
    }
    let url = `/${formatImageUrl}`;
    let msg = 'Upload successfully';
    let funcNum = req.query.CKEditorFuncNum;

    res
      .status(201)
      .send(
        "<script>window.parent.CKEDITOR.tools.callFunction('" +
          funcNum +
          "','" +
          url +
          "','" +
          msg +
          "');</script>",
      );
  } catch (err) {
    next(err);
  }
};

module.exports.createCommon = catchAsync(async (req, res, next) => {
  const {
    body: { title, description },
  } = req;

  if (!Object.values(commonEnum).includes(title)) {
    return next(new AppError('Invalid Title', 400));
  }
  const countDocument = await Common.countDocuments({ title });
  if (countDocument === 1) {
    return next(
      new AppError(
        'The title already exists, please choose a different title',
        422,
      ),
    );
  }
  console.log(req.file);
  if (!req.file) {
    return res.status(400).json({ message: 'Image is required' });
  }

  const image = uploadSingleFile(req.file);
  const newCommon = new Common({ title, description, image });

  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Create,
    newCommon,
  );
  await newCommon.save();
  await History.create({
    object: undefined,
    _uid: req.user._id,
    time: Date.now(),
    action: `Thêm mới common có title là '${title}' thành công`,
  });
  res.status(200).json({
    message: ` Successfully added new common with the title '${title}' `,
    data: await Common.find({}),
  });
});

module.exports.deleteCommon = catchAsync(async (req, res, next) => {
  const {
    params: { title },
  } = req;
  if (!Object.values(commonEnum).includes(title)) {
    next(new AppError('Invalid Title', 400));
  }
  const commonFound = await Common.findOne({ title });
  ForbiddenError.from(ability(req.user)).throwUnlessCan(
    Action.Delete,
    commonFound,
  );
  commonFound.remove();
  deleteImageFile(commonFound?.image);
  await History.create({
    object: undefined,
    _uid: req.user._id,
    time: Date.now(),
    action: `Xóa common có title là ${title} thành công`,
  });
  res.status(200).json({
    message: ` Successfully deleted the common with the title '${title}' `,
    data: await Common.find({}),
  });
});

function filterCommonByLanguage(common, language) {
  return {
    ...common._doc,
    description:
      common._doc.description.find((c) => c.lang === language)?.value ||
      common._doc.description[0].value,
    title:
      common._doc.title.find((c) => c.lang === language)?.value ||
      common._doc.title[0].value,
  };
}
