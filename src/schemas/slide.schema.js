const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const slideSchema = new Schema(
  {
    image: {
      type: String,
      required: 'Image is required',
    },
    title: {
      type: String,
      required: 'Title is required',
    },
    description: {
      type: String,
      required: 'Description is required',
    },
    navigate: {
      type: String,
      required: 'Navigate is required',
    },
    coordinates: [
      {
        _id: false,
        oxy: String,
        link: String,
      },
    ],
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Slide', slideSchema);
