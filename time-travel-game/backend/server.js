require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Atlas connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://VarshiniChamakura:Varshini123@cluster1.bqwtvzs.mongodb.net/chronos-game?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Make sure to update your MongoDB connection string in server.js');
  });

// Import auth routes
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());

// Use auth routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chronos Game Backend is running',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
