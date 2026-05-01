const TimelineEvent = require('../models/TimelineEvent');
const Incident = require('../models/Incident');
const cacheService = require('../services/cacheService');

class TimelineController {
  async getTimelineByIncident(req, res) {
    try {
      const { incidentId } = req.params;
      const cacheKey = `timeline:${incidentId}`;
      
      let timeline = await cacheService.get(cacheKey);
      
      if (!timeline) {
        timeline = await TimelineEvent.find({ incidentId })
          .populate('performedBy', 'name email')
          .sort({ timestamp: 1 });
        
        await cacheService.set(cacheKey, timeline, 60);
      }
      
      res.json({
        success: true,
        data: timeline
      });
    } catch (error) {
      console.error('Get timeline error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch timeline'
      });
    }
  }

  async addTimelineEvent(req, res) {
    try {
      const { incidentId } = req.params;
      const { eventType, description, metadata } = req.body;
      
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      const timelineEvent = await TimelineEvent.create({
        incidentId,
        eventType,
        description,
        performedBy: req.user.id,
        metadata
      });
      
      // Invalidate cache
      await cacheService.del(`timeline:${incidentId}`);
      
      // Emit real-time update
      req.app.get('io').to(`incident:${incidentId}`).emit('timeline-update', timelineEvent);
      
      res.status(201).json({
        success: true,
        data: timelineEvent
      });
    } catch (error) {
      console.error('Add timeline event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add timeline event'
      });
    }
  }

  async updateTimelineEvent(req, res) {
    try {
      const { id } = req.params;
      const { description, metadata } = req.body;
      
      const timelineEvent = await TimelineEvent.findByIdAndUpdate(
        id,
        { description, metadata },
        { new: true }
      );
      
      if (!timelineEvent) {
        return res.status(404).json({
          success: false,
          message: 'Timeline event not found'
        });
      }
      
      await cacheService.del(`timeline:${timelineEvent.incidentId}`);
      
      res.json({
        success: true,
        data: timelineEvent
      });
    } catch (error) {
      console.error('Update timeline event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update timeline event'
      });
    }
  }

  async deleteTimelineEvent(req, res) {
    try {
      const { id } = req.params;
      const timelineEvent = await TimelineEvent.findByIdAndDelete(id);
      
      if (timelineEvent) {
        await cacheService.del(`timeline:${timelineEvent.incidentId}`);
      }
      
      res.json({
        success: true,
        message: 'Timeline event deleted successfully'
      });
    } catch (error) {
      console.error('Delete timeline event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete timeline event'
      });
    }
  }

  async exportTimeline(req, res) {
    try {
      const { incidentId } = req.params;
      const timeline = await TimelineEvent.find({ incidentId })
        .populate('performedBy', 'name email')
        .sort({ timestamp: 1 });
      
      // Format for export
      const exportData = timeline.map(event => ({
        timestamp: event.timestamp,
        eventType: event.eventType,
        description: event.description,
        performedBy: event.performedBy?.name || 'System',
        metadata: JSON.stringify(event.metadata)
      }));
      
      res.json({
        success: true,
        data: exportData
      });
    } catch (error) {
      console.error('Export timeline error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export timeline'
      });
    }
  }
}

module.exports = new TimelineController();