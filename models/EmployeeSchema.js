const mongoose = require('mongoose');

// Define schema for the new table
const EmployeeDetailsSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  email: { 
    type: String,
    required: true,
    unique:true
  },
  interviewDate: Date,
  jobProfile: String,
  qualification: String,
  phoneNo: String,
  permanentAddress: String,
  currentAddress: String,
  adharNo: String,
  panNo: String,
  gender: String,
  previousEmployee: String,
  dob: Date,
  maritalStatus: String,
  referral: String,
  status:String,
  joiningDate: Date, // New field for joining date
  trainingStartDate: Date, // New field for training starting date
  employeeCode:String
});

// Create model for the new table
const EmployeeDetails = mongoose.model('EmployeeDetails', EmployeeDetailsSchema);
module.exports = EmployeeDetails;
