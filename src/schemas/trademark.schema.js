const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const includes = require('../utils/common.util');

const trademarkSchema = new Schema( {
  favicon:{
    type: String,
  },
  logoIcon:{
    type:String,
  },
  logoWord:{
    type: String,
  },
  logo:{
    type: String,
  },
  copyRight:{
    type:String,
    default:'###'
  },
  license:[
    {
      text: {
        type:String,
        required: 'License is required'
      },
      images:{
        type:[String],
        default:[]
      }
    }
  ]
}, {
  timestamps: true
}  )


trademarkSchema.methods.updateElementInput = function( element, value ) {
  try {
    switch ( element ) {
    case 'favicon':{
      this.favicon=value;
      break;
    }
    case 'logo-icon':{
      this.logoIcon = value;
      break;
    }
    case 'logo-word':{
      this.logoWord = value;
      break;
    }
    case 'logo':{
      this.logo = value;
      break;
    }
    case 'copyright':{
      this.copyRight = value;
      break;
    }
    default:
      break;
    }
    return this.save();
  } catch ( error ) {
    throw new Error( error.message );
  }
}

module.exports =mongoose.model( 'Trademark',trademarkSchema );