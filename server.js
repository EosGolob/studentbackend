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
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

//Define port
const port = process.env.PORT || 5000;

// start the server
app.listen(port,() => console.log(`Server running on port ${port}`));



// POST submission
app.post('/api/submissions', async (req, res) => {
  const submission = new Submission(req.body);
  try {
    const savedSubmission = await submission.save();
    res.status(201).send(savedSubmission);
  } catch (error) {
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

