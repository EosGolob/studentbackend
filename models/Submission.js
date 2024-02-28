const mongoose = require('mongoose');
const SubmissionSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  email: String,
  interviewDate: Date,
  jobProfile: String,
  qualification: String,
  phoneNo:{
    type: String,
    validate: {
      validator: function(v) {
        return /\d{3}-\d{3}-\d{4}/.test(v); // Validates phone number format (e.g., 123-456-7890)
      },
      message: props => `${props.value} is not a valid phone number! Please use format xxx-xxx-xxxx`
    },
    required: [true, 'Phone number is required']
  },
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
