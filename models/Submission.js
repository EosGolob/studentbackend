const mongoose = require('mongoose');
const SubmissionSchema = new mongoose.Schema({
    name:String,
    email:String,
    projectTitle:String,
    projectDescription:String,
    status:{
        type:String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default:'Pending'
    },
createdAt: {
  type: Date,
  default: Date.now
},
updatedAt: {
  type: Date,
  default: Date.now
}
});

module.exports = mongoose.model('Submission',SubmissionSchema);
