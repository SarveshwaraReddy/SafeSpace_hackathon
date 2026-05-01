const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'responder', 'viewer'],
    default: 'responder'
  },
  skills: [String],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isOnCall: {
    type: Boolean,
    default: false
  },
  lastActive: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
userSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Match password method - FIXED: removed next parameter
userSchema.methods.matchPassword = async function(enteredPassword) {
  console.log('Comparing passwords:', enteredPassword, this.password);
  const result = await bcrypt.compare(enteredPassword, this.password);
  console.log('Password match result:', result);
  return result;
};

// Compare password (alias)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);