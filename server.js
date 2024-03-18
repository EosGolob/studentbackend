require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {encrypt}  =  require('./encryption');
const axios = require('axios');
const app = express();

const Submission = require('./models/Submission');
const AdminUser = require('./models/AdminUser');
const EmployeeDetails= require( './models/EmployeeSchema' );
// const { Response } = require('./models/models');

// Middleware
app.use(cors());
app.use(bodyParser.json());

//for whs
app.use(bodyParser.urlencoded({ extended: false }));

// MongoDB connection 
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected Amrit Raj'))
  .catch(err => console.error('MongoDB connection error:', err));

  async function copyApprovedEmployees() {
    try {
      // Find employees with status 'Approved' in the old table
      const approvedEmployees = await Submission.find({ status: 'approved' });
      
      // Copy data for each approved employee to the new table
      for (const employee of approvedEmployees) {
       try{
        const newEmployee = new EmployeeDetails({
          firstName: employee.firstName,
          middleName: employee.middleName,
          lastName: employee.lastName,
          email: employee.email,
          interviewDate: employee.interviewDate,
          jobProfile: employee.jobProfile,
          qualification: employee.qualification,
          phoneNo: employee.phoneNo,
          permanentAddress: employee.permanentAddress,
          currentAddress: employee.currentAddress,
          adharNo: employee.adharNo,
          panNo: employee.panNo,
          gender: employee.gender,
          previousEmployee: employee.previousEmployee,
          dob: employee.dob,
          maritalStatus: employee.maritalStatus,
          referral: employee.referral,
          joiningDate: new Date(), // Set joining date to current date
          trainingStartDate: new Date(),// Set training starting date to current date
          status: employee.status
        });
        
        // Save the new employee data
        await newEmployee.save();
      }catch(error){
        if(error.code === 11000){
          console.warn(`Duplicate key error: ${error.message}. Skipping insertion for ${employee.email}`);
          continue; 
        }else{
          throw error;
        }
        }
      }
      
      console.log('Approved employees copied successfully.');
    } catch (error) {
      console.error('Error copying approved employees:', error);
    }
  }
  
//Define port
const port = process.env.PORT || 5000;

// start the server
app.listen(port,() => console.log(`Server running on port ${port}`));

// POST submission
app.post('/api/submissions', async (req, res) => {
  // Create a new Submission instance using the data from the request body
  const submissionData  = req.body;
  console.log('submiddion data', submissionData)
  try {
    const submission = new Submission(submissionData);
    // Save the submission to the database
    const savedSubmission = await submission.save();
    // Send back the saved submission as the response
    res.status(201).send(savedSubmission);
  } catch (error) {
    // If there's an error, send back a 400 response with the error message
    console.error('submiddion data error', error)
    res.status(400).send(error);
    
  }
});
// POST admin
//Register AdminLogin 
app.post('/api/admins', async (req, res) => {
  const adminData = req.body;
  try {
    const adminUser = new AdminUser(adminData);
    const savedAdmin = await adminUser.save();
    res.status(201).send(savedAdmin);
  } catch (error) {
    res.status(400).send(error);
  }
});
// GET all submissions
app.get('/api/submissions', async (req, res) => {
  const ft=req.body.formData;
  console.log('ft value:',ft);
  try {
    const submissions = await Submission.find();
    res.status(200).send(submissions);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update submission status and respone status
app.put('/api/submissions/:id/updateStatus', async (req, res) => {
  try {
    const {id} = req.params;
    const {status} = req.body;
    const responseDate = new Date();
  const updatedSubmission = await Submission.findByIdAndUpdate(id, { status, responseDate }, { new: true });
  res.status(200).send(updatedSubmission);
} catch (error) {
  console.error('Error updating submission status:', error);
  res.status(400).send(error);
}
});
  // User login
  //hand AdminLogin page 
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('emaildata',email)
  console.log('passwordData',password)

  try {
    const submission = await Submission.findOne({ email });

    if (!submission) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, submission.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // If credentials are valid, generate JWT token
    const token = jwt.sign({ submissionId: submission._id}, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
//  Admin login code 
app.post('/api/Adminlogin', async (req, res) => {
  const { email, password } = req.body;
  console.log('email data',email);
  console.log('password data',password);
  try {
    let user = await AdminUser.findOne({ email });
    let isAdmin = false;

    // If user not found in the regular user table, check admin table
    if (!user) {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Authenticate admin
      user = admin;
      isAdmin = true;
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // If credentials are valid, generate JWT token
    const token = jwt.sign({ userId: user._id, isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.submissionId = decoded.submissionId ;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Example protected route
app.get('/api/user', verifyToken, async (req, res) => {
  try {
    const submission  = await Submission.findById(req.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.status(200).json(submission );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// send email code 
app.post('/api/sendemail', async (req, res) => {
  const { email} = req.body;

  try {
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          
          auth: {
              user: 'amritraj9472@gmail.com',
              pass: 'ddrshtiddmuuiccn'
          }
          
      });

      const mailOptions = {
          from: 'amritraj9472@gmail.com',
          to: email,
          subject: 'Hi this is test subject',
          text: 'This is a test email sent from Node.js and Nodemailer'
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
      res.status(200).send('Email sent successfully');
  } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Error sending email');
  }
});


// Update submission manager response
app.put('/api/submissions/:id/managerResponse', async (req, res) => {
  const { managerResponse } = req.body;
  const submissionId = req.params.id;

  try {
    // Find the submission by ID
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update the submission with the manager's response
    submission.managerResponse = managerResponse;

    // Save the updated submission
    const updatedSubmission = await submission.save();

    res.status(200).json(updatedSubmission);
  } catch (error) {
    console.error('Error updating submission manager response:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// Update submission status and response status
app.put('/api/employeedetails/:email/updateStatus', async (req, res) => {
  try {
    const { email} = req.params;
    const { status, joiningDate, trainingStartDate,employeeCode } = req.body;
    const responseDate = new Date();
    console.log("responseDate",responseDate);
    
    const updatedEmployee = await EmployeeDetails.findOneAndUpdate(
      { email },
      { status, joiningDate, trainingStartDate, employeeCode },
      { new: true }
    );

  if (!updatedEmployee) {
    return res.status(404).send('Employee not found');
  }

  res.status(200).send(updatedEmployee);
} catch (error) {
  console.error('Error updating employee status:', error);
  res.status(400).send(error);
}
});
mongoose.connection.once('open', async () => {
  try {
    await copyApprovedEmployees();
  } catch (error) {
    console.error('Error copying approved employees during server startup:', error);
  }
});




// Define a new endpoint for fetching approved submissions
app.get('/api/employeedetails/approved', async (req, res) => {
  try {
    // Fetch approved submissions from the database
    const submissions = await EmployeeDetails.find({ status: 'approved' }).exec();
    // Send the approved submissions as a JSON response
    res.json(submissions);
  } catch (error) {
    // Handle any errors that occur while fetching data
    console.error(error);
    res.status(500).send('Error fetching approved submissions');
  }
});

//whats app use 
app.post('/api/send-candidate', async (req, res) => {
  try {
    const { candidateId } = req.body;
    const candidate = await Submission.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found.' });
    }

    // Send WhatsApp message to manager
    sendWhatsAppMessageRes(candidate);

    res.status(200).json({ message: 'Candidate data sent to manager.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


async function sendWhatsAppMessageRes(candidate) {
 
    const gupshupApiUrl = 'https://api.gupshup.io/sm/api/v1/msg'; // This URL might change, refer to the Gupshup documentation
    const apiKey = 'etdnk32cmakq3bgmfvg49b6kshmbrumq';
    const whatsappNumber = '+918603735691'; // Manager's WhatsApp number with country code
    const srcName = 'interviewApi'; // Your Gupshup app name
  
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': apiKey
    };
  const message = `Candidate Name: ${candidate.firstName}\nEmail: ${candidate.email}\nPosition: ${candidate.position}\nPlease reply with 'approve' or 'reject'.`;
  
    const data = `channel=whatsapp&source=${srcName}&destination=${whatsappNumber}&message=${encodeURIComponent(message)}&src.name=${srcName}`;
  
    try {
      const response = await axios.post(gupshupApiUrl, data, { headers: headers });
      console.log('Message sent successfully:', response.data);
    } catch (error)
  {
      console.error('Error sending WhatsApp message:', error);
    }
  }
  
