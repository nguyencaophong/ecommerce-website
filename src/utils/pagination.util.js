const Course = require('../schemas/course.schema');
const New = require('../schemas/new.schema');
const convertor = require('../utils/converter.util');

module.exports = class pagination {
  query;
  queryOptions;

  constructor(query, queryOptions) {
    this.query = query;
    this.queryOptions = queryOptions;
  }

  filtering() {
    const queryObj = { ...this.queryOptions };
    const excludeFields = ['page', 'sort', 'limit', 'skip', 'search'];

    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  searching() {
    const key = this.queryOptions.search;
    const schema = this.query.mongooseCollection.collectionName;
    if (key) {
      const regex = new RegExp(key, 'i');
      switch (schema) {
        case 'news':
          this.query.find({
            $or: [
              { 'title.value': { $regex: regex } },
              { 'summary.value': { $regex: regex } },
              { 'content.value': { $regex: regex } },
              { author: { $regex: regex } },
              {
                tags: {
                  $regex: decodeURIComponent(key || ''),
                },
              },
            ],
          });
          break;
        case 'courses':
          this.query.find({
            $or: [
              { name: { $regex: regex } },
              { slug: { $regex: regex } },
              { description: { $regex: regex } },
              { teacher: { $regex: regex } },
            ],
          });
          break;
        default:
          break;
      }
    }
    return this;
  }

  sorting() {
    if (this.queryOptions.sort) {
      const sortBy = this.queryOptions.sort.split(',').join('');
      this.query.sort(sortBy);
    } else {
      this.query.sort('-createdAt');
    }
    return this;
  }

  pagination() {
    const page = !this.queryOptions.page ? 1 : this.queryOptions.page;
    const limit = !this.queryOptions.limit ? 0 : this.queryOptions.limit;
    let skip = (page - 1) * limit;
    if (this.queryOptions.skip) {
      skip = this.queryOptions.skip;
    }
    this.query.skip(skip).limit(limit);
    return this;
  }
};
