const mongoose = require('mongoose');
const includes = require('../utils/common.util');

const Schema = mongoose.Schema;

const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: 'Name course is required',
    },
    level: {
      type: String,
      required: 'Level course is required',
    },
    description: {
      type: String,
    },
    timeOpening: {
      type: Date,
      required: 'Time opening is required',
    },
    timeExpire: {
      type: Date,
      required: 'Time expire is required',
    },
    price: {
      type: Number,
      required: 'Price course is required',
    },
    image: {
      type: String,
      required: 'Image is required',
    },
    maxQuantity: {
      type: Number,
      required: 'Max quantity is required',
    },
    listUser: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    listLession: [
      {
        name: {
          type: String,
          required: 'Name is required',
        },
        schedule: {
          type: String,
          required: 'Schedule is required',
        },
        timeBeginLession: {
          type: String,
          required: 'Time begin lesson is required',
        },
      },
    ],
    willLearn: {
      type: [String],
      required: true,
    },
    studyRoute: [
      {
        chapter: {
          type: String,
          required: 'Chapter is required',
        },
        chapterContent: [
          {
            lesson: {
              type: String,
              required: 'Lesson is required',
            },
            numberOfLesson: {
              type: Number,
              required: 'Number of lesson is required',
              default: 0,
            },
          },
        ],
      },
    ],
    reducePrice: {
      type: Number,
      required: 'Reduce price is required',
    },
    teacher: {
      type: String,
      required: 'Teacher is required.',
    },
    slug: {
      type: String,
      required: 'Slug is required',
    },
    image: String,
  },
  {
    timestamps: true,
  },
);

// exec filter in listUser when delete User with admin role
courseSchema.methods.filterStudent = function (userId) {
  try {
    let updateUsers = [...this.listUser];
    const listCourseId = updateUsers.map((value) => {
      return value.userId;
    });

    updateUsers = updateUsers.filter((value) => {
      return value.userId != userId;
    });
    this.listUser = updateUsers;
    return this.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

courseSchema.methods.editElementCourse = function (element, value) {
  if (element === 'namecourse') {
    this.nameCourse = value;
  } else if (element === 'maxquantity') {
    this.maxQuantity = value;
  } else if (element === 'pricecourse') {
    this.priceCourse = value;
  } else if (element === 'timeopening') {
    this.timeOpening = value;
  } else if (element === 'timeexpire') {
    this.timeExpire = value;
  } else if (element === 'typecourse') {
    this.typeCourse = value;
  } else if (element === 'image') {
    this.image = value;
  } else if (element === 'description') {
    this.description = value;
  }
  return this.save();
};

// CRUD (listLesson,inforCourse)------------------------------------------
// ** func add new (lesson,willlearn,chapter,chaptercontent)-----------------
courseSchema.methods.addChildrenCourse = function (target, value) {
  try {
    switch (target) {
      case 'lesson': {
        const updateChildrenCourse = [...this.listLesson];
        updateChildrenCourse.push({
          name: value.name,
          schedule: value.schedule,
          timeBeginLesson: value.timeBeginLesson,
        });
        this.listLesson = updateChildrenCourse;
        break;
      }
      case 'willlearn': {
        const updatedWillLearn = [...this.willLearn];
        updatedWillLearn.push({
          check: value.check,
        });
        this.willLearn = updatedWillLearn;
        break;
      }
      case 'chapter': {
        const updatedStudyRoute = [...this.studyRoute];
        updatedStudyRoute.push({
          chapter: value.chapter,
        });
        this.studyRoute = updatedStudyRoute;
        break;
      }
      case 'chaptercontent': {
        const updatedInfoCourse = [...this.studyRoute];
        const checkIndex = includes.findINDEX(
          updatedInfoCourse,
          value.chapterId,
        );

        updatedInfoCourse[checkIndex].chapterContent.push({
          lesson: value.lesson,
          numberOfLesson: value.numberOfLesson,
        });

        this.studyRoute = updatedInfoCourse;
        break;
      }
      default:
        break;
    }
    return this.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

courseSchema.methods.editChildrenCourse = function (index, value, target) {
  try {
    switch (target) {
      case 'lesson': {
        const updateChildrenCourse = [...this.listLesson];
        // ** find index of document lesson
        const checkIndex = includes.findINDEX(updateChildrenCourse, index);
        // ** update
        updateChildrenCourse[checkIndex].name = value.name;
        updateChildrenCourse[checkIndex].schedule = value.schedule;
        updateChildrenCourse[checkIndex].timeBeginLesson =
          value.timeBeginLesson;
        this.listLesson = updateChildrenCourse;
        break;
      }
      case 'willlearn': {
        const updateInfoCourse = [...this.willLearn];

        // ** find index of document willearn
        const checkIndex = includes.findINDEX(updateInfoCourse, index);
        updateInfoCourse[checkIndex].check = value.check;
        this.willLearn = updateInfoCourse;
        break;
      }
      case 'chapter': {
        // ** edit CHAPTER
        const updateInfoCourse = [...this.studyRoute];

        // ** find index of list chapter
        const checkIndex = includes.findINDEX(updateInfoCourse, index);
        updateInfoCourse[checkIndex].chapter = value.chapter;
        this.studyRoute = updateInfoCourse;
        break;
      }
      case 'chaptercontent': {
        const updateLessonOfChapterContent = [...this.studyRoute];

        // **  find index of chapter in list studyRoute
        const checkIndex = includes.findINDEX(
          updateLessonOfChapterContent,
          value.chapterId,
        );

        // ** find index of lesson in list chapterRoute
        const checkIndexLesson = includes.findINDEX(
          updateLessonOfChapterContent[checkIndex].chapterContent,
          index,
        );

        updateLessonOfChapterContent[checkIndex].chapterContent[
          checkIndexLesson
        ].lesson = value.lesson;
        updateLessonOfChapterContent[checkIndex].chapterContent[
          checkIndexLesson
        ].numberOfLesson = value.numberOfLesson;
        this.studyRoute = updateLessonOfChapterContent;
        break;
      }
      default:
        break;
    }
    return this.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

courseSchema.methods.removeChildrenCourse = function (target, index) {
  try {
    let update;
    switch (target) {
      case 'lesson': {
        update = [...this.listLesson];

        update = includes.deleteItem(update, index);
        this.listLesson = update;
        break;
      }
      case 'willlearn': {
        update = [...this.willLearn];

        update = includes.deleteItem(update, index);
        this.willLearn = update;
        break;
      }
      case 'chapter': {
        update = [...this.studyRoute];

        // ** update
        update = includes.deleteItem(update, index);
        this.studyRoute = update;
        break;
      }
      case 'user': {
        updatedListUser = [...this.listUser];
        const indexOfUser = updatedListUser.findIndex((e) => {
          return e.userId.toString === index;
        });
        if (indexOfUser === -1) {
          throw new Error(` Invalid id ${index} value!!!`);
        }
        updatedListUser = updatedListUser.splice(indexOfUser, 1);
        this.listUser = updatedListUser;
        break;
      }
      default:
        break;
    }
    return this.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

courseSchema.methods.removeLessonOfChapterContent = function (
  index,
  chapterId,
) {
  try {
    const updateLessonOfChapterContent = [...this.studyRoute];

    // **  find index of chapter in list studyRoute
    const checkIndex = includes.findINDEX(
      updateLessonOfChapterContent,
      chapterId,
    );

    // **  find index of lesson in list chapterRoute
    const listLessonOfChapter =
      updateLessonOfChapterContent[checkIndex].chapterContent;
    const deleteLessonInChapter = includes.deleteItem(
      listLessonOfChapter,
      index,
    );

    // ** update
    this.studyRoute[checkIndex].chapterContent = deleteLessonInChapter;
    return this.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

courseSchema.methods.editLessonOfChapterContent = function (
  chapterId,
  value,
  index,
) {
  try {
    const updateLessonOfChapterContent = [...this.studyRoute];

    // **  find index of chapter in list studyRoute
    const checkIndex = includes.findINDEX(
      updateLessonOfChapterContent,
      chapterId,
    );

    // ** find index of lesson in list chapterRoute
    const checkIndexLesson = includes.findINDEX(
      updateLessonOfChapterContent[checkIndex].chapterContent,
      index,
    );

    // ** update
    updateLessonOfChapterContent[checkIndex].chapterContent.splice(
      checkIndexLesson,
      1,
    );
    this.studyRoute = updateLessonOfChapterContent;
    return this.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = mongoose.model('Course', courseSchema);
