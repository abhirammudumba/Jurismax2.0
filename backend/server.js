
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

const Enquiry = require('./models/enquiry');
const protectAdmin = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('Jurismax 2.0 Backend is running!');
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter username and password.'
      });
    }

    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token
    });

  } catch (error) {
    console.error('Admin login error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Get all enquiries - Admin only
app.get('/api/enquiries', protectAdmin, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries
    });

  } catch (error) {
    console.error('Error fetching enquiries:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries.'
    });
  }
});

// Update enquiry status - Admin only
app.patch('/api/enquiries/:id/status', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ['Pending', 'In Progress', 'Completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry status.'
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry status updated successfully.',
      enquiry
    });

  } catch (error) {
    console.error('Status update error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to update enquiry status.'
    });
  }
});

// Delete enquiry - Admin only
app.delete('/api/enquiries/:id', protectAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID.'
      });
    }

    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully.'
    });

  } catch (error) {
    console.error('Delete enquiry error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry.'
    });
  }
});

// Submit a new enquiry - Public
app.post('/api/enquiries', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !phone || !service || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all fields.'
      });
    }

    const newEnquiry = new Enquiry({
      name,
      email,
      phone,
      service,
      message
    });

    await newEnquiry.save();

    res.status(201).json({
      success: true,
      message: 'Your enquiry has been submitted successfully!'
    });

  } catch (error) {
    console.error('Enquiry error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry.'
    });
  }
});

// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas connected successfully!');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
  });
