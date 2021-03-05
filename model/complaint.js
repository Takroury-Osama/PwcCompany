const mongoose = require('mongoose');

const objectId = mongoose.Schema.Types.ObjectID

let schema = mongoose.Schema;

let complaint = new schema ({

  
  complaintText: String,
  typeId: { type: objectId , ref:'type' },
  complaintStatus: String
})


module.exports = mongoose.model('Complaint',complaint);
