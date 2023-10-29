const Course = require( '../schemas/course.schema' );
const Common = require('../schemas/common.schema');
const Location = require( '../schemas/location.schema');
const New = require( '../schemas/new.schema' );
const Team = require( '../schemas/team.schema' );
const Contact = require( '../schemas/contact.schema' );
const TradeMark = require( '../schemas/trademark.schema' );
const catchAsync = require( '../middleware/catcher.middleware' );
const AppError = require( '../utils/app_error.util' );
const checker = require( '../utils/checker.util' );
const {isObjectId} = require('../utils/checker.util');
const filter = require('../utils/filter.util');
const Category = require('../schemas/categories.schema')
const Pagination = require('../utils/pagination.util');
const {getTeams} = require('../utils/filter.util');
const modeNewsEnum = require('../models/mode_news.enum');
const SlidesShow = require('../schemas/slides-show.schema');

module.exports.readHome = catchAsync(async (req, res) => {
  const typeSlide = await TypeSlide.findOne({ post: true })
    .populate("listSlide.idSlide")
    .populate("effect");
  const common = await Common.find({});

  let location = await Location.findOne({});
  const destination = location?.address?.items;
  let news = await New.find({});
  const teams = await Team.find({});
  const trademarks = await TradeMark.find({});

  return res.status(200).json({
    success: true,
    common,
    destination,
    location,
    news,
    teams,
    trademarks,
    typeSlide,
  });
});

module.exports.readCommon = catchAsync(async (req, res, next) => {
  const commons = await Common.find();
  res.status(200).json({
    message: "Tải dữ liệu thành công",
    data: commons,
  });
});

module.exports.getSlides = catchAsync(async(req,res,next) =>{
  const slides = await SlidesShow.findOne({ display: true })
    .populate("slides")
  return res.status(200).json({
    message:'Get data successfully.',
    slides
  });
})

module.exports.getLocation = catchAsync(async(req,res,next)=> {
  const locations = await Location.find();
  res.status(200).json({
    message: "Tải dữ liệu thành công",
    data: locations,
  });
});

module.exports.getTrademark = catchAsync(async(req,res,next)=> {
  const trademark = await TradeMark.findOne();
  res.status(200).json({
    message: "Tải dữ liệu thành công",
    data: trademark,
  });
});

module.exports.readTeams = catchAsync( async ( req, res, next ) => {
  const query = Team.find()
    .populate('_uid')
    .populate({ path: 'position', select: '_id name' })
    .populate({ path: 'listGroup', select: '_id name' })
  const features = new Pagination(query, req.query).pagination().sorting().filtering();
  const teams =await features.query;
  res.status( 200 ).json( {
    message: 'Get data success',
    data: teams
  } )
} )

module.exports.readNew = catchAsync(async (req, res, next) => {
  const idOrSlug = req.params.id;
  const post = isObjectId(idOrSlug) ? await New.findById(idOrSlug).populate("mode").populate("categories") : await New.findOne({slug:idOrSlug}).populate("mode").populate("categories");
  if (!post) {
    return next(new AppError("post not found!", 404));
  }
  await post.updateOne({ $inc: { views: 1 } }, { new: true });
  return res.status(200).json({
    message: "Get all sharing success !",
    data: post,
  });
});

module.exports.readNews = catchAsync(async (req, res, next) => {
  const features = new Pagination(New.find({$or:[
    {mode:modeNewsEnum.public},
    {time_public:{$lte:new Date()}}]}), req.query)
    .pagination()
    .searching()
    .sorting()
    .filtering();
  const featuresSearch = new Pagination(New.find({$or:[
    {mode:modeNewsEnum.public},
    {time_public:{$lte:new Date()}}]}), req.query)
    .searching();
  const [posts, numbersPost] = await Promise.all([
    features.query,
    featuresSearch.query,
  ]);
  return res.status(200).json({
    message: "Get all news success !",
    data: posts,
    numbersPost: numbersPost.length,
  });
});

module.exports.readCategories = catchAsync(async (req, res, next) => {
  const categories = await filter.getCategories((user = ""), req.query);
  res.status(200).json({
    message: "Get all sharing of categories success !",
    data: categories,
  });
});

module.exports.readCategory = catchAsync(async (req, res, next) => {
  const idOrSlug = req.params.id;

  let category = isObjectId(idOrSlug) ? await Category.findById( idOrSlug ) :  await Category.findOne( {slug:idOrSlug} ) ;
  if(!category) {
    return next(new AppError('Categories not found!',404))
  }
  const data = await filter.recursiveTree(category);
  res.status(200).json({ message: "Read Category successfully!", data });
});

module.exports.getNewsOfCategories = catchAsync(async (req, res, next) => {
  const categories = req.params.categories_id
    ? req.params.categories_id.split(",").filter(Boolean)
    : [];
  const features = new Pagination(
    categories?.length > 0
      ? New.find({ mode: modeNewsEnum.public, categories: { $in: categories } })
      : New.find(),
    req.query
  )
    .pagination()
    .searching()
    .sorting()
    .filtering();
  const featuresSearch = new Pagination(
    categories?.length > 0
      ? New.find({ mode: modeNewsEnum.public, categories: { $in: categories } })
      : New.find(),
    req.query,
    req.query
  ).searching();

  const [posts, numbersPost] = await Promise.all([
    features.query,
    featuresSearch.query,
  ]);
  res.status(200).json({
    message: "Get all sharing of categories success !",
    data: posts,
    numbersPost: numbersPost.length,
  });
});

module.exports.readCourses = catchAsync(async (req, res, next) => {
  const features = new Pagination(Course.find(), req.query)
    .pagination()
    .sorting()
    .filtering()
    .searching();
  const courses = await features.query;
  const numbersCourse = await Course.countDocuments();
  return res
    .status(200)
    .json({ message: "GET DATA SUCCESS", data: courses, numbersCourse });
});

module.exports.readCourse = catchAsync(async (req, res) => {
  const idOrSlug =req.params.id;
  const course = isObjectId(idOrSlug) ? await Course.findById(idOrSlug) : await Course.findOne({slug:idOrSlug});
  if(!course) {
    return res.status(404).json({message:'Course not found.'});
  }
  return res.status(200).json({ message: "Get success course", data: course });
});

module.exports.sendContact = catchAsync(async (req, res, next) => {
  if (!checker.isEmail(req.body.email)) {
    return res.status(422).json({ message: "Email không đúng định dạng !" });
  }
  if (!checker.isPhone(req.body.phone)) {
    return res
      .status(422)
      .json({ message: "Số điện thoại không đúng định dạng !" });
  }

  const post = await new Contact(req.body).save();
  return res
    .status(200)
    .json({ message: "SGOD sẽ sớm phản hồi lại bạn !", post });
});

module.exports.search = catchAsync(async (req, res, next) => {
  const key = req.query.key;
  const regex = new RegExp(key, 'i');
 
  // **  filter courses
  const courses = await Course.find({$or:
      [{name:{$regex:regex}},
        {description:{$regex:regex}},
      ]});
     
  // **  filter news
  const news = await New.find({$and:[
    { mode: modeNewsEnum.public }, 
    {$or:
        [{title:{$regex:regex}},
          {summary:{$regex:regex}},
          {content:{$regex:regex}},
          {tags:{$regex:decodeURIComponent(key)}}]}]});

  return res.status(200).json({
    message: "Successfully!",
    data: { result: courses.length + news.length, courses, news, videos: [] },
  });
});
