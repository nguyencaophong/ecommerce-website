const mongoose = require('mongoose');
const commonEnum = require('../models/common.enum');
const Schema = mongoose.Schema;

const commonSchema = new Schema({
  title: [
    {
      lang: { type: String },
      value: {
        type: String,
        // enum: Object.values(commonEnum),
        unique: true,
      },
    },
  ],
  description: [
    {
      lang: { type: String },
      value: {
        type: String,
        required: 'Description is required',
      },
    },
  ],
  image: {
    type: String,
    required: 'Image is required',
  },
});

module.exports = mongoose.model('Common', commonSchema);
