const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriesSchema = new Schema(
  {
    name: [
      {
        lang: { type: String },
        value: {
          type: String,
          required: 'Name is required',
          unique: true,
        },
      },
    ],
    slug: {
      type: String,
      required: 'Slug is required',
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Categories',
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Categories', categoriesSchema);
