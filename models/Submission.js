const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SubmissionSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  middleName: String,
  lastName: {
    type: String, 
    required: true,
  },
  email: { 
    type: String,
    required: true,
    unique:true
  },
  password: {
    type: String,
  },
  interviewDate: Date,
  jobProfile: {
    type:String,
    require: true
  },
  qualification:{ 
    type:String,
    require:true
  },

  phoneNo:{
    type: String,
    validate: {
      validator: function(v) {
        //return /\d{3}-\d{3}-\d{4}/.test(v); 
        return /^\+91[0-9]{10}$/i.test(v);
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
    permanentAddress: {
      type:String,
      required:[true,'Permanent address field cannot be empty']
    },
    currentAddress: String,
    adharNo: {
      type:String,
      require:true,
      unique:true
    },
    panNo: {
      type:String,
      unique:true
    },
  gender:{
      type: String,
      require:true,
      enum: ['Male', 'Female', 'Other']
    },
    previousEmployee:{ 
      type:String,
    },
    dob: {
      type:Date,
      required: true
    },
  maritalStatus: {
      type: String,
      enum: ['Single', 'Married'],
      require:true
    },
    referral: {
      type:String,
    },
  createdAt: {
  type: Date,
  default: Date.now
},
  updatedAt: {
  type: Date,
  default: Date.now
},
  responseDate:{
  type:Date,
  default:Date.now
},
whatsappStatus:{
  type:String,
}
});
// Hash password before saving
SubmissionSchema.pre('save', async function (next) {
  const userSubmission = this;
  if (!userSubmission.isModified('password')) return next();
  const hashedPassword = await bcrypt.hash(userSubmission.password, 10);
  userSubmission.password = hashedPassword;
  next();
})

module.exports = mongoose.model('Submission',SubmissionSchema);
