const mongoose = require('mongoose');

const objectId = mongoose.Schema.Types.ObjectID

let schema = mongoose.Schema;

let type = new schema ({
  typeName: String
})


module.exports = mongoose.model('Type',type);
