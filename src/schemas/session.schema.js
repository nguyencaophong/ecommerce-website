const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  device:{
    type: String,
    required:'Device is required'
  },
  hardware: {
    type: String,
    required: 'Hardware is required'
  },
  software: {
    type: String,
    required: 'Software is required'
  },
  _uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'User id is required'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Session', sessionSchema)