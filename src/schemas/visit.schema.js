const mongoose = require('mongoose')

const visitSchema = new mongoose.Schema({
  time: {
    type: Date,
    required: 'Time is required'
  },
  device:{
    type: String,
    required: 'Device is required'
  },
  os: {
    type: String,
    required: 'Operating System is required'
  },
  browser: {
    type: String,
    required: 'Browser is required'
  },
  location: {
    country: {
      type: String
      // required: 'Location is required'
    },
    state: {
      type: String
      // required: 'State is required'
    }
  },
  _uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'User id is required'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Visit', visitSchema)