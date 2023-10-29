const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const teamSchema = new Schema( {
  name:{
    type: String,
    required: 'Name is required',
    unique:true
  },
  listMember:[
    {
      type: Schema.Types.ObjectId,
      ref:'Team'
    }
  ]
} , {
  timestamps: true
} )


module.exports =mongoose.model( 'TeamGroup',teamSchema );