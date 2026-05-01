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
    unique: true
  },
  department: {
    type: String,
    enum: ['Engineering', 'SRE', 'DevOps', 'Support', 'Security', 'Network'],
    required: true
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
    lastActive: Date,
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
      type: Number, // in minutes
      default: 0
    },
    averageResolutionTime: {
      type: Number, // in minutes
      default: 0
    },
    slaComplianceRate: {
      type: Number, // percentage
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
responderSchema.index({ 'user': 1 });
responderSchema.index({ 'availability.currentStatus': 1 });
responderSchema.index({ 'availability.isOnCall': 1 });
responderSchema.index({ department: 1, role: 1 });
responderSchema.index({ 'performance.rating': -1 });

// Virtual for full name
responderSchema.virtual('fullName').get(function() {
  return this.user ? this.user.name : this.employeeId;
});

// Method to update performance metrics
responderSchema.methods.updatePerformance = async function(incident) {
  this.performance.incidentsAssigned++;
  
  if (incident.status === 'RESOLVED') {
    this.performance.incidentsResolved++;
    
    // Calculate response time if available
    const firstUpdate = incident.updates[0];
    if (firstUpdate && firstUpdate.timestamp) {
      const responseTime = (firstUpdate.timestamp - incident.createdAt) / 1000 / 60;
      this.performance.averageResponseTime = 
        (this.performance.averageResponseTime * (this.performance.incidentsResolved - 1) + responseTime) 
        / this.performance.incidentsResolved;
    }
    
    // Calculate resolution time
    if (incident.resolvedAt) {
      const resolutionTime = (incident.resolvedAt - incident.createdAt) / 1000 / 60;
      this.performance.averageResolutionTime = 
        (this.performance.averageResolutionTime * (this.performance.incidentsResolved - 1) + resolutionTime) 
        / this.performance.incidentsResolved;
    }
  }
  
  await this.save();
};

// Method to check availability
responderSchema.methods.isAvailable = function() {
  return this.availability.currentStatus === 'Available' && 
         this.availability.isOnCall === true;
};

// Method to assign to incident
responderSchema.methods.assignToIncident = async function(incidentId, role = 'Support') {
  this.currentIncidents.push(incidentId);
  this.assignedIncidents.push({
    incident: incidentId,
    assignedAt: new Date(),
    role
  });
  this.availability.currentStatus = 'In Incident';
  await this.save();
};

// Method to resolve from incident
responderSchema.methods.resolveFromIncident = async function(incidentId) {
  this.currentIncidents = this.currentIncidents.filter(id => id.toString() !== incidentId);
  
  if (this.currentIncidents.length === 0) {
    this.availability.currentStatus = 'Available';
  }
  
  await this.save();
};

// Static method to get on-call responders
responderSchema.statics.getOnCallResponders = function() {
  return this.find({
    'availability.isOnCall': true,
    'availability.currentStatus': 'Available'
  }).populate('user', 'name email');
};

// Static method to get best responder for incident
responderSchema.statics.getBestResponder = async function(incidentType, requiredSkills) {
  const responders = await this.find({
    'availability.isOnCall': true,
    'availability.currentStatus': 'Available'
  }).populate('user', 'name email');
  
  // Score each responder
  const scoredResponders = responders.map(responder => {
    let score = 0;
    
    // Skill match
    const hasSkills = requiredSkills.every(skill => 
      responder.skills.some(s => s.name === skill && s.level !== 'Beginner')
    );
    if (hasSkills) score += 50;
    
    // Performance score
    score += (responder.performance.rating * 10);
    
    // Load balancing (prefer responders with fewer current incidents)
    score += Math.max(0, 10 - responder.currentIncidents.length) * 5;
    
    // SLA compliance bonus
    if (responder.performance.slaComplianceRate > 95) score += 20;
    
    return { responder, score };
  });
  
  // Sort by score and return best
  scoredResponders.sort((a, b) => b.score - a.score);
  return scoredResponders[0]?.responder || null;
};

// Pre-save middleware
responderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Responder', responderSchema);