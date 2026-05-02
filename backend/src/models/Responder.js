const mongoose = require('mongoose');

const responderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    default: () => `EMP${Date.now()}`
  },
  department: {
    type: String,
    enum: ['Engineering', 'SRE', 'DevOps', 'Support', 'Security', 'Network'],
    default: 'Engineering'
  },
  role: {
    type: String,
    enum: ['Primary', 'Secondary', 'Escalation', 'Manager'],
    default: 'Secondary'
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    yearsOfExperience: Number
  }],
  certifications: [{
    name: String,
    issuer: String,
    issuedDate: Date,
    expiryDate: Date
  }],
  availability: {
    isOnCall: {
      type: Boolean,
      default: false
    },
    schedule: {
      type: String,
      enum: ['24/7', 'Business Hours', 'Custom'],
      default: '24/7'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    currentStatus: {
      type: String,
      enum: ['Available', 'Busy', 'Away', 'Offline', 'In Incident'],
      default: 'Available'
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    nextAvailable: Date
  },
  performance: {
    incidentsAssigned: {
      type: Number,
      default: 0
    },
    incidentsResolved: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    averageResolutionTime: {
      type: Number,
      default: 0
    },
    slaComplianceRate: {
      type: Number,
      default: 100
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    }
  },
  communication: {
    phone: String,
    email: String,
    slackId: String,
    teamsId: String,
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    preferredChannel: {
      type: String,
      enum: ['Email', 'SMS', 'Slack', 'Teams'],
      default: 'Email'
    }
  },
  currentIncidents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  }],
  assignedIncidents: [{
    incident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['Lead', 'Support', 'Observer'],
      default: 'Support'
    }
  }],
  onCallHistory: [{
    startDate: Date,
    endDate: Date,
    incidentsHandled: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
responderSchema.index({ user: 1 });
responderSchema.index({ employeeId: 1 });
responderSchema.index({ department: 1, role: 1 });
responderSchema.index({ 'availability.isOnCall': 1, 'availability.currentStatus': 1 });

// Update timestamp on save
responderSchema.pre('save', function() {
  this.updatedAt = Date.now();
  // next();
});

module.exports = mongoose.model('Responder', responderSchema);