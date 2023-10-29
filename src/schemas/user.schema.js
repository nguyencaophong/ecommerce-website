const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const checker = require('../utils/checker.util');
const { accessibleRecordsPlugin } = require('@casl/mongoose');

const userSchema = new mongoose.Schema(
  {
    avatar: String,
    full_name: {
      first: {
        type: String,
        required: 'First name is required',
      },
      last: {
        type: String,
        required: 'Last name is required',
      },
    },
    email: String,
    phone: String,
    username: String,
    password: {
      type: String,
      required: 'Password is required',
    },
    block: {
      blocked: {
        type: Boolean,
        default: false,
      },
      unblock: Date,
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
    birthday: Date,
    status: {
      type: String,
      enum: ['online', 'offline', 'busy'],
      default: 'offline',
    },
    loggedAt: Date,
    sex: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not gender',
      },
      required: 'Gender is required',
      default: 'Other',
    },
    address: String,
    refresh_token: String,
  },
  {
    timestamps: true,
  },
);

//#region Validation
userSchema
  .path('avatar')
  .validate((v) => checker.isFilepath(v), 'Invalid avatar');
userSchema
  .path('email')
  .validate((v) => checker.isEmail(v), 'Invalid email address');
userSchema
  .path('phone')
  .validate((v) => checker.isPhone(v), 'Invalid phone number');
userSchema
  .path('password')
  .validate(
    (v) => checker.isStrongPassword(v),
    'Please choose a stronger password. Try a mix of letters, numbers, and symbols (use 8 or more characters)',
  );
//#region Methods

userSchema.methods.authenticate = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.sign = function () {
  return jwt.sign(
    {
      _id: this._id,
      phone: this.phone,
      email: this.email,
      username: this.username,
      block: this.block,
    },
    process.env.SGODWEB_SECRET,
    this.remember ? { expiresIn: process.env.JWT_EXP } : {},
  );
};

userSchema.plugin(accessibleRecordsPlugin);

module.exports = mongoose.model('User', userSchema);
