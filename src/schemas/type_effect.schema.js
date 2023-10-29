const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const typeEffectSchema = new Schema( {
  type:{
    type:String,
    required:'Type is required'
  }
} , {
  timestamps: true
} )


module.exports =mongoose.model( 'TypeEffect',typeEffectSchema );