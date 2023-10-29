const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const teamSchema = new Schema( {
  _uid:{
    type:Schema.Types.ObjectId,
    ref:'User',
    required:'User id is required'
  },
  academicLevel:{
    type: String,
    required: 'Academic Level is required'
  },
  position:{
    type: Schema.Types.ObjectId,
    ref:'TeamPosition'
  },
  experience:{
    type:String,
    default: '###'
  },
  listGroup:[
    {
      type:Schema.Types.ObjectId,
      ref:'TeamGroup'
    }
  ]
}, {
  timestamps: true
}  )


module.exports =mongoose.model( 'Team',teamSchema );