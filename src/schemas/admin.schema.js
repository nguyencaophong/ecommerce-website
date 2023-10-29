const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const adminSchema = new Schema( {
  email: {
    type:String,
    required: 'Email is required'
  },
  password:{
    type: String,
    required: 'Password is required'
  }
}, {
  timestamps: true
}  )


module.exports = mongoose.model( 'Admin',adminSchema );