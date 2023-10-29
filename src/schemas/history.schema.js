const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const History = new Schema( {
  _uid: {
    type:Schema.Types.ObjectId,
    required: 'User is required',
    ref:'User'
  },
  time:{
    type: Date,
    required: 'Time is required'
  },
  action:{
    type: String,
    required:'Action is required'
  },
  object: Object
}, {
  timestamps: true
}  )


module.exports = mongoose.model( 'History',History );