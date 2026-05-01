const Postmortem = require('../models/Postmortem');
const Incident = require('../models/Incident');
const TimelineEvent = require('../models/TimelineEvent');
const aiService = require('../services/aiService');
const cacheService = require('../services/cacheService');

class PostmortemController {
  async getPostmortems(req, res) {
    try {
      const { incidentId, page = 1, limit = 10 } = req.query;
      const query = {};
      if (incidentId) query.incidentId = incidentId;
      
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        Postmortem.find(query)
          .populate('incidentId', 'title severity createdAt resolvedAt')
          .populate('author', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Postmortem.countDocuments(query)
      ]);
      
      res.json({
        success: true,
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get postmortems error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch postmortems'
      });
    }
  }

  async getPostmortemById(req, res) {
    try {
      const { id } = req.params;
      const postmortem = await Postmortem.findById(id)
        .populate('incidentId')
        .populate('author', 'name email');
      
      if (!postmortem) {
        return res.status(404).json({
          success: false,
          message: 'Postmortem not found'
        });
      }
      
      res.json({
        success: true,
        data: postmortem
      });
    } catch (error) {
      console.error('Get postmortem error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch postmortem'
      });
    }
  }

  async createPostmortem(req, res) {
    try {
      const { incidentId, title, content, actionItems } = req.body;
      
      const postmortem = await Postmortem.create({
        incidentId,
        title,
        content,
        actionItems,
        author: req.user.id
      });
      
      // Update incident status
      await Incident.findByIdAndUpdate(incidentId, { status: 'POSTMORTEM' });
      
      res.status(201).json({
        success: true,
        data: postmortem
      });
    } catch (error) {
      console.error('Create postmortem error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create postmortem'
      });
    }
  }

  async updatePostmortem(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const postmortem = await Postmortem.findByIdAndUpdate(id, updates, { new: true });
      
      if (!postmortem) {
        return res.status(404).json({
          success: false,
          message: 'Postmortem not found'
        });
      }
      
      res.json({
        success: true,
        data: postmortem
      });
    } catch (error) {
      console.error('Update postmortem error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update postmortem'
      });
    }
  }

  async deletePostmortem(req, res) {
    try {
      const { id } = req.params;
      await Postmortem.findByIdAndDelete(id);
      
      res.json({
        success: true,
        message: 'Postmortem deleted successfully'
      });
    } catch (error) {
      console.error('Delete postmortem error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete postmortem'
      });
    }
  }

  async generateAIPostmortem(req, res) {
    try {
      const { id } = req.params;
      const postmortem = await Postmortem.findById(id).populate('incidentId');
      
      if (!postmortem) {
        return res.status(404).json({
          success: false,
          message: 'Postmortem not found'
        });
      }
      
      const timeline = await TimelineEvent.find({ incidentId: postmortem.incidentId._id })
        .sort({ timestamp: 1 });
      
      const aiContent = await aiService.generatePostmortem(
        postmortem.incidentId,
        timeline,
        postmortem.content
      );
      
      postmortem.aiGenerated = true;
      postmortem.aiContent = aiContent;
      await postmortem.save();
      
      res.json({
        success: true,
        data: { aiContent }
      });
    } catch (error) {
      console.error('Generate AI postmortem error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI postmortem'
      });
    }
  }

  async generateFromIncident(req, res) {
    try {
      const { incidentId } = req.params;
      
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      const timeline = await TimelineEvent.find({ incidentId })
        .sort({ timestamp: 1 });
      
      const aiContent = await aiService.generatePostmortem(
        incident,
        timeline,
        'Auto-generated postmortem'
      );
      
      const postmortem = await Postmortem.create({
        incidentId,
        title: `Postmortem: ${incident.title}`,
        content: aiContent,
        author: req.user.id,
        aiGenerated: true,
        aiContent
      });
      
      res.status(201).json({
        success: true,
        data: postmortem
      });
    } catch (error) {
      console.error('Generate from incident error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate postmortem from incident'
      });
    }
  }

  async exportAsPDF(req, res) {
    try {
      const { id } = req.params;
      const postmortem = await Postmortem.findById(id)
        .populate('incidentId')
        .populate('author', 'name email');
      
      if (!postmortem) {
        return res.status(404).json({
          success: false,
          message: 'Postmortem not found'
        });
      }
      
      // In a real implementation, you would generate a PDF here
      // For now, return the data for PDF generation
      res.json({
        success: true,
        data: postmortem,
        message: 'PDF export ready'
      });
    } catch (error) {
      console.error('Export PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export PDF'
      });
    }
  }
}

module.exports = new PostmortemController();