const express = require('express');
const router = express.Router();

// In-memory storage for users (for demonstration purposes)
const users = [];
let userId = 1;

// Signup route
router.post('/signup', (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Please provide email, username, and password.' });
  }

  // Check if user already exists
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists.' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email is already in use.' });
  }

  const newUser = { id: userId++, email, username, password }; // In a real app, hash the password
  users.push(newUser);

  console.log('Users after signup:', users);
  res.status(201).json({ message: 'User created successfully!' });
});

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password.' });
  }

  const user = users.find(u => u.username === username);

  if (!user || user.password !== password) { // In a real app, compare hashed passwords
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  res.status(200).json({ message: 'Login successful!', token: 'fake-jwt-token' });
});

module.exports = router; 