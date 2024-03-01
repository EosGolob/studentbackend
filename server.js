require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

const Submission = require('./models/Submission');

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

// GET all submissions
app.get('/api/submissions', async (req, res) => {
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
