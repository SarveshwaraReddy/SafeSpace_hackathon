const Incident = require('../models/Incident');
const TimelineEvent = require('../models/TimelineEvent');
const cacheService = require('../services/cacheService');
const aiService = require('../services/aiService');
const notificationService = require('../services/notificationService');

class IncidentController {
  // Create new incident
  async createIncident(req, res) {
    try {
      const { title, description, severity, affectedServices } = req.body;
      
      const incident = new Incident({
        title,
        description,
        severity,
        affectedServices,
        createdBy: req.user.id,
        updates: [{
          message: `Incident created: ${title}`,
          status: 'INVESTIGATING',
          postedBy: req.user.id
        }]
      });

      await incident.save();

      // Create timeline event
      await TimelineEvent.create({
        incidentId: incident._id,
        eventType: 'CREATED',
        description: `Incident created by ${req.user.name}`,
        performedBy: req.user.id
      });

      // Generate AI insights asynchronously
      aiService.generateIncidentSummary(incident).catch(console.error);
      
      // Clear cache
      await cacheService.invalidatePattern('incidents:*');
      
      // Send notifications
      await notificationService.notifyNewIncident(incident);
      
      // Emit WebSocket event
      const io = req.app.get('io');
      if (io) {
        io.emit('new-incident', incident);
      }

      res.status(201).json({
        success: true,
        data: incident
      });
    } catch (error) {
      console.error('Create incident error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create incident'
      });
    }
  }

  // Get incidents with caching
  async getIncidents(req, res) {
    try {
      const { status, severity, page = 1, limit = 10 } = req.query;
      
      const cacheKey = `incidents:${status || 'all'}:${severity || 'all'}:${page}:${limit}`;
      
      // Try cache first
      let incidents = await cacheService.get(cacheKey);
      
      if (!incidents) {
        const query = {};
        if (status) query.status = status;
        if (severity) query.severity = severity;
        
        const skip = (page - 1) * limit;
        
        const [data, total] = await Promise.all([
          Incident.find(query)
            .populate('assignee', 'name email')
            .populate('responders', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
          Incident.countDocuments(query)
        ]);
        
        incidents = {
          data,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        };
        
        // Cache for 1 minute
        await cacheService.set(cacheKey, incidents, 60);
      }
      
      res.json({
        success: true,
        ...incidents
      });
    } catch (error) {
      console.error('Get incidents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch incidents'
      });
    }
  }

  // Get single incident with timeline
  async getIncidentById(req, res) {
    try {
      const { id } = req.params;
      
      const cacheKey = `incident:${id}`;
      let incident = await cacheService.get(cacheKey);
      
      if (!incident) {
        incident = await Incident.findById(id)
          .populate('assignee', 'name email')
          .populate('responders', 'name email')
          .populate('updates.postedBy', 'name email');
        
        if (!incident) {
          return res.status(404).json({
            success: false,
            message: 'Incident not found'
          });
        }
        
        // Get timeline
        const timeline = await TimelineEvent.find({ incidentId: id })
          .populate('performedBy', 'name email')
          .sort({ timestamp: 1 });
        
        incident = incident.toObject();
        incident.timeline = timeline;
        
        // Cache for 30 seconds
        await cacheService.set(cacheKey, incident, 30);
      }
      
      res.json({
        success: true,
        data: incident
      });
    } catch (error) {
      console.error('Get incident error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch incident'
      });
    }
  }

  // Update incident (full update)
  async updateIncident(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const incident = await Incident.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      // Clear cache
      await cacheService.del(`incident:${id}`);
      await cacheService.invalidatePattern('incidents:*');
      
      // Emit WebSocket update
      const io = req.app.get('io');
      if (io) {
        io.to(`incident:${id}`).emit('incident:updated', {
          incidentId: id,
          updates,
          updatedBy: req.user.name,
          timestamp: new Date()
        });
      }
      
      res.json({
        success: true,
        data: incident
      });
    } catch (error) {
      console.error('Update incident error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update incident'
      });
    }
  }

  // Delete incident
  async deleteIncident(req, res) {
    try {
      const { id } = req.params;
      
      const incident = await Incident.findByIdAndDelete(id);
      
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      // Delete associated timeline events
      await TimelineEvent.deleteMany({ incidentId: id });
      
      // Clear cache
      await cacheService.del(`incident:${id}`);
      await cacheService.invalidatePattern('incidents:*');
      await cacheService.del(`timeline:${id}`);
      
      // Emit deletion event
      const io = req.app.get('io');
      if (io) {
        io.emit('incident:deleted', { incidentId: id });
      }
      
      res.json({
        success: true,
        message: 'Incident deleted successfully'
      });
    } catch (error) {
      console.error('Delete incident error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete incident'
      });
    }
  }

  // Update incident status (INVESTIGATING, IDENTIFIED, MONITORING, RESOLVED, POSTMORTEM)
  async updateIncidentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, message } = req.body;
      
      // Validate status
      const validStatuses = ['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED', 'POSTMORTEM'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }
      
      const incident = await Incident.findById(id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      const oldStatus = incident.status;
      incident.status = status;
      
      // Set resolvedAt timestamp if status is RESOLVED
      if (status === 'RESOLVED' && !incident.resolvedAt) {
        incident.resolvedAt = new Date();
        
        // Calculate resolution metrics
        const resolutionTime = (incident.resolvedAt - incident.createdAt) / 1000 / 60; // in minutes
        incident.resolutionTime = resolutionTime;
      }
      
      // Add status update to timeline
      const updateMessage = message || `Status changed from ${oldStatus} to ${status}`;
      incident.updates.push({
        message: updateMessage,
        status,
        postedBy: req.user.id
      });
      
      await incident.save();
      
      // Create timeline event
      await TimelineEvent.create({
        incidentId: id,
        eventType: 'UPDATE',
        description: updateMessage,
        performedBy: req.user.id,
        metadata: { 
          oldStatus, 
          newStatus: status,
          updateMessage 
        }
      });
      
      // Clear cache
      await cacheService.del(`incident:${id}`);
      await cacheService.invalidatePattern('incidents:*');
      
      // If resolved, also clear active incidents cache
      if (status === 'RESOLVED') {
        await cacheService.del('public:current-status');
        await cacheService.del('public:active-incidents');
      }
      
      // Send notifications
      await notificationService.notifyStatusChange(incident, oldStatus);
      
      // Emit WebSocket events
      const io = req.app.get('io');
      if (io) {
        io.to(`incident:${id}`).emit('incident:status-updated', {
          incidentId: id,
          oldStatus,
          newStatus: status,
          message: updateMessage,
          updatedBy: req.user.name,
          timestamp: new Date()
        });
        
        // Broadcast to dashboard
        io.emit('incident:update', {
          incidentId: id,
          title: incident.title,
          status,
          severity: incident.severity,
          updatedBy: req.user.name
        });
        
        // If resolved, broadcast resolution
        if (status === 'RESOLVED') {
          io.emit('incident:resolved', {
            incidentId: id,
            title: incident.title,
            resolvedAt: incident.resolvedAt,
            resolutionTime: incident.resolutionTime
          });
        }
      }
      
      // Generate AI postmortem if status is POSTMORTEM
      if (status === 'POSTMORTEM') {
        aiService.generatePostmortem(incident, await TimelineEvent.find({ incidentId: id }), 'Auto-generated').catch(console.error);
      }
      
      res.json({
        success: true,
        data: incident,
        message: `Incident status updated from ${oldStatus} to ${status}`
      });
    } catch (error) {
      console.error('Update incident status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update incident status'
      });
    }
  }

  // Assign responder to incident
  async assignResponder(req, res) {
    try {
      const { id } = req.params;
      const { responderId, role = 'Support' } = req.body;
      
      const incident = await Incident.findById(id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      // Check if responder already assigned
      if (incident.responders.includes(responderId)) {
        return res.status(400).json({
          success: false,
          message: 'Responder already assigned to this incident'
        });
      }
      
      // Add responder
      incident.responders.push(responderId);
      
      // If no assignee, set this responder as assignee
      if (!incident.assignee) {
        incident.assignee = responderId;
      }
      
      await incident.save();
      
      // Create timeline event
      await TimelineEvent.create({
        incidentId: id,
        eventType: 'ASSIGNED',
        description: `Responder assigned with role: ${role}`,
        performedBy: req.user.id,
        metadata: { responderId, role }
      });
      
      // Clear cache
      await cacheService.del(`incident:${id}`);
      await cacheService.invalidatePattern('incidents:*');
      
      // Emit WebSocket event
      const io = req.app.get('io');
      if (io) {
        io.to(`incident:${id}`).emit('responder:assigned', {
          incidentId: id,
          responderId,
          role,
          assignedBy: req.user.name,
          timestamp: new Date()
        });
      }
      
      res.json({
        success: true,
        data: incident,
        message: 'Responder assigned successfully'
      });
    } catch (error) {
      console.error('Assign responder error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign responder'
      });
    }
  }

  // Get incident timeline
  async getIncidentTimeline(req, res) {
    try {
      const { id } = req.params;
      
      const timeline = await TimelineEvent.find({ incidentId: id })
        .populate('performedBy', 'name email')
        .sort({ timestamp: 1 });
      
      res.json({
        success: true,
        data: timeline,
        count: timeline.length
      });
    } catch (error) {
      console.error('Get timeline error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch timeline'
      });
    }
  }

  // Add comment/update to incident
  async addIncidentUpdate(req, res) {
    try {
      const { id } = req.params;
      const { message, status } = req.body;
      
      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Update message is required'
        });
      }
      
      const incident = await Incident.findById(id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      incident.updates.push({
        message,
        status: status || incident.status,
        postedBy: req.user.id
      });
      
      await incident.save();
      
      // Create timeline event
      await TimelineEvent.create({
        incidentId: id,
        eventType: 'COMMENT',
        description: message,
        performedBy: req.user.id,
        metadata: { message, status: status || incident.status }
      });
      
      // Clear cache
      await cacheService.del(`incident:${id}`);
      
      // Emit WebSocket event
      const io = req.app.get('io');
      if (io) {
        io.to(`incident:${id}`).emit('incident:new-update', {
          incidentId: id,
          message,
          postedBy: req.user.name,
          timestamp: new Date()
        });
      }
      
      res.json({
        success: true,
        data: incident,
        message: 'Update added successfully'
      });
    } catch (error) {
      console.error('Add incident update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add update'
      });
    }
  }

  // Get incident statistics
  async getIncidentStats(req, res) {
    try {
      const cacheKey = 'incident:stats';
      let stats = await cacheService.get(cacheKey);
      
      if (!stats) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const [
          totalIncidents,
          activeIncidents,
          resolvedToday,
          criticalIncidents,
          averageResolutionTime
        ] = await Promise.all([
          Incident.countDocuments(),
          Incident.countDocuments({ status: { $ne: 'RESOLVED' } }),
          Incident.countDocuments({ 
            status: 'RESOLVED',
            resolvedAt: { $gte: today }
          }),
          Incident.countDocuments({ severity: { $in: ['SEV0', 'SEV1'] }, status: { $ne: 'RESOLVED' } }),
          Incident.aggregate([
            { $match: { status: 'RESOLVED', resolutionTime: { $exists: true } } },
            { $group: { _id: null, avg: { $avg: '$resolutionTime' } } }
          ])
        ]);
        
        stats = {
          total: totalIncidents,
          active: activeIncidents,
          resolvedToday,
          critical: criticalIncidents,
          averageResolutionTime: averageResolutionTime[0]?.avg?.toFixed(1) || 0,
          updatedAt: new Date()
        };
        
        await cacheService.set(cacheKey, stats, 300); // Cache for 5 minutes
      }
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get incident stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics'
      });
    }
  }
}

module.exports = new IncidentController();