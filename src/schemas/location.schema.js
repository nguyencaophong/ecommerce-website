const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
  title:{
    type: String,
    unique: true
  },
  items:[
    {
      name:{
        type: String,
      },
      value:{
        type: String
      }
    }
  ]
}, {
  timestamps: true,
})


module.exports = mongoose.model('Location', locationSchema);

