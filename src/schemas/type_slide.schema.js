const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const typeSlideSchema = new Schema( {
  type:{
    type:String,
    required:'Type is required'
  },
  listSlide:[
    {
      idSlide:{
        type:Schema.Types.ObjectId,
        ref:'Slide'
      }
    }
  ],
  effect:{
    type:Schema.Types.ObjectId,
    ref:'TypeEffect'
  },
  post:{
    type:Boolean,
    required:'Post mode requested',
    default: false
  }
}, {
  timestamps: true
})


module.exports =mongoose.model( 'TypeSlide',typeSlideSchema );