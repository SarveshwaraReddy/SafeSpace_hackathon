const mongoose = require('mongoose');

const actionItemSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Make optional
    validate: {
      validator: function(v) {
        // Allow null, undefined, or valid ObjectId
        return v === null || v === undefined || mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid user ID format'
    }
  },
  dueDate: {
    type: Date
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  notes: String
});

const postmortemSchema = new mongoose.Schema({
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  actionItems: [actionItemSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiContent: String,
  metrics: {
    timeToDetect: Number,
    timeToResolve: Number,
    customerImpact: String,
    severity: String
  },
  tags: [String],
  status: {
    type: String,
    enum: ['Draft', 'Review', 'Published', 'Archived'],
    default: 'Draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
postmortemSchema.pre('save', function() {
  this.updatedAt = Date.now();
  // next();
});

module.exports = mongoose.model('Postmortem', postmortemSchema);