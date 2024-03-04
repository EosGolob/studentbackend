require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();

const Submission = require('./models/Submission');
const AdminUser = require('./models/AdminUser');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection 
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected Amrit Raj'))
  .catch(err => console.error('MongoDB connection error:', err));

//Define port
const port = process.env.PORT || 5000;

// start the server
app.listen(port,() => console.log(`Server running on port ${port}`));

// POST submission
app.post('/api/submissions', async (req, res) => {
  // Create a new Submission instance using the data from the request body
  const submissionData = req.body;
  try {
    const submission = new Submission(submissionData);
    // Save the submission to the database
    const savedSubmission = await submission.save();
    // Send back the saved submission as the response
    res.status(201).send(savedSubmission);
  } catch (error) {
    // If there's an error, send back a 400 response with the error message
    res.status(400).send(error);
  }
});
// POST admin
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

// Update submission status
app.put('/api/submissions/:id/updateStatus', async (req, res) => {
  try {
    const updatedSubmission = await Submission.findByIdAndUpdate(req.params.id, {
      $set: req.body
    }, { new: true });
    res.status(200).send(updatedSubmission);
  } catch (error) {
    res.status(400).send(error);
  }
});
  // User login
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