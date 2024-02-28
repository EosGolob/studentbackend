require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParse = require('body-parser');
const cors = require('cors');
const app = express();

const Submission = require('./models/Submission');

// Middleware
app.use(cors());
app.use(bodyParse.json());

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

