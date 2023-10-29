const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const positionTeamSchema = new Schema( {
  name:{
    type: String,
    required: 'Name position is required',
    unique:true
  }
}, {
  timestamps: true
} )


module.exports =mongoose.model( 'TeamPosition',positionTeamSchema );