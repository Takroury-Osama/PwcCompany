const mongoose = require('mongoose');

const objectId = mongoose.Schema.Types.ObjectID

let schema = mongoose.Schema;

let complaint = new schema ({

  complaintUserName: String,
  complaintText: String,
  typeId: { type: objectId , ref:'type' },
  complaintStatus: String,
  userComplaintId: { type: objectId , ref:'user' }
})


module.exports = mongoose.model('Complaint',complaint);
