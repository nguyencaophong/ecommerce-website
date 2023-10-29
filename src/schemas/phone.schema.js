const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const checker = require('../utils/checker.util')

const phoneSchema = new mongoose.Schema({
  number: {
    type: String,
    trim: true,
    unique: true,
    required: 'Phone number is required'
  },
  code: {
    type: String,
    trim: true,
    required: 'Code is required'
  },
  attempts: {
    type: Number,
    default: 3,
    max: 3,
    min: 0,
    required: 'Attempts is required'
  }
}, {
  timestamps: true
})

//#region Validation
phoneSchema.path('code').validate(v => checker.isCode(v), 'Invalid code')

phoneSchema.pre('save', async function (next) {
  this.code = await bcrypt.hash(this.code, await bcrypt.genSalt(10))
  next()
})

phoneSchema.methods.verify = function (code) {
  return bcrypt.compare(code, this.code)
}

module.exports = mongoose.model('Phone', phoneSchema)

