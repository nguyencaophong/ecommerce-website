const mongoose = require('mongoose');
const { accessibleRecordsPlugin,accessibleFieldsPlugin } = require('@casl/mongoose');
const {SGODWEB_MONGODB_URI,SGODWEB_NODE_ENV} = require('process').env

mongoose
  .plugin(accessibleRecordsPlugin)
  .plugin(accessibleFieldsPlugin)

mongoose.connect(SGODWEB_MONGODB_URI,{ useNewUrlParser: true, useUnifiedTopology: true  } )
  .then(() => console.log(`Connected to ${SGODWEB_NODE_ENV === 'production' ? 'Database' : 'MongoDB'}.`))
  .catch(err => console.log(`Could not connect to ${SGODWEB_NODE_ENV === 'production' ? 'Database' : 'MongoDB'}:`, err))