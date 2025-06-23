const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Please provide email, username, and password.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email is already in use.' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists.' });
      }
    }

    // Create new user
    const newUser = new User({
      email,
      username,
      password
    });

    await newUser.save();

    console.log('User created successfully:', { username: newUser.username, email: newUser.email });
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password.' });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('User logged in successfully:', { username: user.username });
    res.status(200).json({ 
      message: 'Login successful!', 
      token: 'fake-jwt-token',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gameStats: user.gameStats
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Get user stats route
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('username email lastGameTime lastConstantGameTime lastGameResult');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ 
      username: user.username,
      email: user.email,
      lastGameTime: user.lastGameTime,
      lastConstantGameTime: user.lastConstantGameTime,
      lastGameResult: user.lastGameResult
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error while fetching stats.' });
  }
});

// Update game stats route
router.post('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const gameResult = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update game statistics
    user.updateGameStats(gameResult);
    await user.save();

    console.log('Game stats updated for user:', { username: user.username, gameResult });
    res.status(200).json({ 
      message: 'Game stats updated successfully!',
      lastGameTime: user.lastGameTime,
      lastConstantGameTime: user.lastConstantGameTime,
      lastGameResult: user.lastGameResult
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ message: 'Server error while updating stats.' });
  }
});

module.exports = router; 