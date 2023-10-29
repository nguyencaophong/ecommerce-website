const Categories = require('../schemas/categories.schema');
const Slide = require('../schemas/slide.schema');
const Team = require('../schemas/team.schema');
const New = require('../schemas/new.schema');
const TeamGroup = require('../schemas/team_group.schema');
const TeamPosition = require('../schemas/team_position.schema');
const TypeSlide = require('../schemas/type_slide.schema');
const ability = require('../casl/casl.factory');
const modeNewEnum = require('../models/mode_news.enum');
const Pagination = require('../utils/pagination.util');
const {
  filterCategoryByLanguage,
} = require('../controllers/admin/categories.controller');

const recursiveTree = async (data, language) => {
  if (!data.toString().includes('_id')) {
    const item = await Categories.findById(data.toString());
    return recursiveTree(item);
  }
  const { children } = data;
  let result = [];
  if (children === undefined || children.length === 0) {
    result = [];
  } else {
    for (const element of children) {
      const item = await recursiveTree(element, language);
      result.push(item);
    }
  }
  return await {
    ...data._doc,
    children: result,
    name:
      data._doc.name.find((c) => c.lang === language)?.value ||
      data._doc.name[0].value,
  };
};

module.exports.getCategories = async (user, query, language) => {
  console.log('123');
  let categories = new Pagination(
    Categories.find({ name: { $elemMatch: { lang: language } } }).populate(
      'children',
    ),
    query,
  )
    .sorting()
    .filtering();
  categories = await categories.query;
  const result = [],
    cates = [];

  for (const element of categories) {
    const item = await recursiveTree(element, language);
    result.push(item);
  }

  const size = result.length;
  for (let i = 0; i < size; i++) {
    let count = 0;
    for (let k = 0; k < size; k++) {
      if (result[k].children.length > 0) {
        result[k].children.forEach((value) => {
          value._id.toString() === result[i]._id.toString() ? count++ : count;
        });
      }
      result[k]._id.toString() === result[i]._id.toString() ? count++ : count;
      if (count === 2) break;
    }
    if (count <= 1) cates.push(result[i]);
  }
  return cates;
};

async function getTeams() {
  let Groups = await TeamGroup.find()
    .populate('listMember')
    .populate('listMember._uid');
  let Teams = await Team.find().populate('_uid').populate('position');
  let Positions = await TeamPosition.find();

  const data = {
    groups: Groups,
    positions: Positions,
    members: Teams,
  };
  return data;
}

async function getTypesSlide(user) {
  let result = [];
  let TypeSlides = await TypeSlide.accessibleBy(ability(user))
    .find()
    .populate('listSlide.idSlide')
    .populate('effect');

  const typesSlide = [...TypeSlides];
  for (let type in typesSlide) {
    const { _id, ...others } = typesSlide[type]._doc;
    const OB = {},
      Slides = [];
    OB['type'] = { ...others }.type;

    if ({ ...others }.effect) {
      OB['effect'] = { ...others }.effect;
    }
    if (typesSlide[type].listSlide.length > 0) {
      for (let slide of { ...others }.listSlide) {
        const { type, ...others } = slide.idSlide._doc;
        Slides.push({ ...others });
      }
    }
    OB['id'] = _id;
    OB['listSlide'] = Slides;
    OB['post'] = typesSlide[type].post;
    result.push(OB);
  }
  return result;
}

function getSlides(user) {
  return Slide.accessibleBy(ability(user)).find();
}

async function getNews(user) {
  const postsPending = await New.find({ mode: modeNewEnum.pending });
  const postsPublic = await New.find({ mode: modeNewEnum.public });
  const postsHidden = await New.find({ mode: modeNewEnum.hidden });
  const postsPrivate = await New.find({ mode: modeNewEnum.private });
  const posts = {};
  posts['pending'] = postsPending;
  posts['public'] = postsPublic;
  posts['hidden'] = postsHidden;
  posts['private'] = postsPrivate;

  return posts;
}

async function getUsers(element, userDetail) {
  switch (element) {
    case 'status': {
      const populateStudent = await userDetail.populate('listCourse.courseId');
      const listCourse = populateStudent.listCourse;

      // **  copy data in listItem and exec filter;
      let listData = [...listCourse],
        result = [];
      for (const item of listData) {
        if (item.courseId) {
          const { listUser, listLesson, inforCourse, ...others } =
            item.courseId._doc;
          result.push({
            ...others,
            certificate: item.certificate,
            status: item.status,
            session: item.session,
            itemId: item._id,
          });
        }
      }
      return result;
    }
    default:
      break;
  }
}

module.exports = {
  recursiveTree,
  // getCategories,
  getUsers,
  getTeams,
  getTypesSlide,
  getNews,
  getSlides,
};
