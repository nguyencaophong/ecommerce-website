const mongoose = require( 'mongoose' );
const StatusContact = require('../models/status_contact.enum');
const Schema = mongoose.Schema;

const contactSchema = new Schema( {
  name:{
    type: String,
    required: 'Name is required'
  },
  email:{
    type: String,
    default:'###'
  },
  phone:{
    type:String,
    required: 'Phone number is required'
  },
  content:{
    type:String,
    required: 'Content is required'
  },
  status:{
    type:String,
    required: 'Status is required',
    default:StatusContact.UnView
  }
} , {
  timestamps: true
} )


module.exports =mongoose.model( 'Contact',contactSchema );