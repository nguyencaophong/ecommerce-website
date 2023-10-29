const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const checker = require('../utils/checker.util')

const emailSchema = new mongoose.Schema({
  address: {
    type: String,
    trim: true,
    unique: true,
    required: 'Email address is required'
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
emailSchema.path('code').validate(v => checker.isCode(v), 'Invalid code')

emailSchema.pre('save', async function (next) {
  this.code = await bcrypt.hash(this.code, await bcrypt.genSalt(10))
  next()
})

emailSchema.methods.verify = async function (code) {
  console.log(await bcrypt.compare(code, this.code),code )
  return bcrypt.compare(code, this.code)
}

module.exports = mongoose.model('Email', emailSchema)