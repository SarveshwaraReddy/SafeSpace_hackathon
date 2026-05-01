const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true
  },
  eventType: {
    type: String,
    enum: ['CREATED', 'ASSIGNED', 'UPDATE', 'ESCALATED', 'RESOLVED', 'COMMENT'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

timelineEventSchema.index({ incidentId: 1, timestamp: -1 });

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);