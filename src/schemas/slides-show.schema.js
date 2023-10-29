const mongoose = require('mongoose');
const effectEnum = require('../models/effect.enum');
const Schema = mongoose.Schema;


const slideShowSchema = new Schema({
  name: {
    type: String,
  },
  slides: {
    type: [{type:Schema.Types.ObjectId,ref:'Slide'}]
  },
  effect: {
    type: String,
    enum: Object.values(effectEnum)
  },
  display: Boolean,
})

module.exports = mongoose.model('Slideshow',slideShowSchema)