const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['SEV0', 'SEV1', 'SEV2', 'SEV3', 'SEV4'],
    required: true
  },
  status: {
    type: String,
    enum: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED', 'POSTMORTEM'],
    default: 'INVESTIGATING'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date,
  affectedServices: [{
    type: String,
    required: true
  }],
  updates: [{
    message: String,
    status: String,
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  aiSummary: String,
  aiRootCause: String,
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
incidentSchema.index({ status: 1, createdAt: -1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ 'affectedServices': 1 });

module.exports = mongoose.model('Incident', incidentSchema);