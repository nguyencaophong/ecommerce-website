const mongoose = require('mongoose');
const modeNewsEnum = require('../models/mode_news.enum');
const Schema = mongoose.Schema;

const newSchema = new Schema(
  {
    title: [
      {
        lang: { type: String, required: 'language is required' },
        value: {
          type: String,
          required: 'Title is required',
        },
      },
    ],
    image: {
      type: String,
      required: 'Image is required',
    },
    summary: [
      {
        lang: { type: String, required: 'language is required' },
        value: { type: String, required: 'Summary is required' },
      },
    ],
    content: [
      {
        lang: { type: String, required: 'Language is required' },
        value: { type: String, required: 'Content is required' },
      },
    ],
    author: {
      type: String,
      required: 'Author is required',
    },
    mode: {
      type: String,
      enum: Object.values(modeNewsEnum),
      required: 'Mode is required',
    },
    tags: {
      type: Array,
      default: [],
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Categories',
      },
    ],
    views: {
      type: Number,
      required: 'Views is required',
      default: 0,
    },
    time_public: {
      type: Date,
      require: 'Time public is required',
      default: new Date(),
    },
    slug: {
      type: String,
      required: 'Slug is required',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('New', newSchema);
