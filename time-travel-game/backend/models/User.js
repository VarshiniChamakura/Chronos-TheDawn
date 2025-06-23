const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  lastGameTime: {
    type: Number,
    default: 0
  },
  lastConstantGameTime: {
    type: Number,
    default: 0
  },
  lastGameResult: {
    type: String,
    enum: ['won', 'lost', ''],
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last game summary
userSchema.methods.updateGameStats = function(gameResult) {
  if (gameResult.won !== undefined) {
    this.lastGameResult = gameResult.won ? 'won' : 'lost';
  }
  if (gameResult.gameTime !== undefined) {
    this.lastGameTime = gameResult.gameTime;
  }
  if (gameResult.constantGameTime !== undefined) {
    this.lastConstantGameTime = gameResult.constantGameTime;
  }
};

module.exports = mongoose.model('User', userSchema); 