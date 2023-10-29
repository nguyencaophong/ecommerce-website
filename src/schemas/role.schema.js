const mongoose = require( 'mongoose' );
// ** casl 
const { accessibleRecordsPlugin,accessibleFieldsPlugin } = require('@casl/mongoose');
const roleSchema = new mongoose.Schema( {
  name: {
    type: String,
    required:'Name is required'
  },
  permissions: {
    type: Array,
    default:[]
  }
}, {
  timestamps: true
}  )

roleSchema.plugin(accessibleRecordsPlugin);

module.exports =mongoose.model( 'Role',roleSchema );