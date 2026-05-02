const Postmortem = require('../models/Postmortem');
const Incident = require('../models/Incident');
const TimelineEvent = require('../models/TimelineEvent');
const User = require('../models/User');
const aiService = require('../services/aiService');
const cacheService = require('../services/cacheService');
const mongoose = require('mongoose');

class PostmortemController {
  // Create postmortem
  async createPostmortem(req, res) {
    try {
      const { incidentId, title, content, actionItems, metrics, tags } = req.body;
      
      // Validate incident exists
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      // Validate action items and convert assignedTo to ObjectId if needed
      let validatedActionItems = [];
      if (actionItems && Array.isArray(actionItems)) {
        validatedActionItems = actionItems.map(item => {
          const actionItem = {
            task: item.task,
            dueDate: item.dueDate,
            completed: item.completed || false,
            notes: item.notes
          };
          
          // Only add assignedTo if it's a valid ObjectId
          if (item.assignedTo && mongoose.Types.ObjectId.isValid(item.assignedTo)) {
            actionItem.assignedTo = item.assignedTo;
          } else if (item.assignedTo) {
            console.warn('Invalid assignedTo ID:', item.assignedTo);
          }
          
          return actionItem;
        });
      }
      
      // Create postmortem
      const postmortem = await Postmortem.create({
        incidentId,
        title: title || `Postmortem: ${incident.title}`,
        content,
        actionItems: validatedActionItems,
        author: req.user.id,
        aiGenerated: false,
        metrics: metrics || {
          timeToDetect: incident.resolvedAt ? 
            (incident.updates[0]?.timestamp - incident.createdAt) / 1000 / 60 : null,
          timeToResolve: incident.resolvedAt ?
            (incident.resolvedAt - incident.createdAt) / 1000 / 60 : null,
          severity: incident.severity
        },
        tags: tags || [],
        status: 'Draft'
      });
      
      // Update incident status
      await Incident.findByIdAndUpdate(incidentId, { status: 'POSTMORTEM' });
      
      // Clear cache
      await cacheService.invalidatePattern('postmortems:*');
      
      res.status(201).json({
        success: true,
        data: postmortem,
        message: 'Postmortem created successfully'
      });
    } catch (error) {
      console.error('Create postmortem error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create postmortem',
        error: error.message
      });
    }
  }

  // Get all postmortems
  async getPostmortems(req, res) {
    try {
      const { incidentId, status, page = 1, limit = 10 } = req.query;
      
      const query = {};
      if (incidentId) query.incidentId = incidentId;
      if (status) query.status = status;
      
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        Postmortem.find(query)
          .populate('incidentId', 'title severity createdAt resolvedAt')
          .populate('author', 'name email')
          .populate('actionItems.assignedTo', 'name email')
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

  // Get postmortem by ID
  async getPostmortemById(req, res) {
    try {
      const { id } = req.params;
      
      const postmortem = await Postmortem.findById(id)
        .populate('incidentId')
        .populate('author', 'name email')
        .populate('actionItems.assignedTo', 'name email');
      
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

  // Update postmortem
  async updatePostmortem(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Validate action items if present
      if (updates.actionItems && Array.isArray(updates.actionItems)) {
        updates.actionItems = updates.actionItems.map(item => {
          const actionItem = {
            task: item.task,
            dueDate: item.dueDate,
            completed: item.completed,
            notes: item.notes
          };
          
          if (item.assignedTo && mongoose.Types.ObjectId.isValid(item.assignedTo)) {
            actionItem.assignedTo = item.assignedTo;
          }
          
          return actionItem;
        });
      }
      
      const postmortem = await Postmortem.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!postmortem) {
        return res.status(404).json({
          success: false,
          message: 'Postmortem not found'
        });
      }
      
      res.json({
        success: true,
        data: postmortem,
        message: 'Postmortem updated successfully'
      });
    } catch (error) {
      console.error('Update postmortem error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update postmortem'
      });
    }
  }

  // Delete postmortem
  async deletePostmortem(req, res) {
    try {
      const { id } = req.params;
      
      const postmortem = await Postmortem.findByIdAndDelete(id);
      
      if (!postmortem) {
        return res.status(404).json({
          success: false,
          message: 'Postmortem not found'
        });
      }
      
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

  // Generate AI postmortem
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
        postmortem.content || 'Auto-generated postmortem'
      );
      
      postmortem.aiGenerated = true;
      postmortem.aiContent = aiContent;
      await postmortem.save();
      
      res.json({
        success: true,
        data: { aiContent },
        message: 'AI postmortem generated successfully'
      });
    } catch (error) {
      console.error('Generate AI postmortem error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI postmortem'
      });
    }
  }

  // Generate postmortem from incident
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
        aiContent,
        status: 'Draft'
      });
      
      res.status(201).json({
        success: true,
        data: postmortem,
        message: 'Postmortem generated from incident'
      });
    } catch (error) {
      console.error('Generate from incident error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate postmortem from incident'
      });
    }
  }

  // Export as PDF (placeholder)
  async exportAsPDF(req, res) {
    try {
      const { id } = req.params;
      
      const postmortem = await Postmortem.findById(id)
        .populate('incidentId')
        .populate('author', 'name email')
        .populate('actionItems.assignedTo', 'name email');
      
      if (!postmortem) {
        return res.status(404).json({
          success: false,
          message: 'Postmortem not found'
        });
      }
      
      // In production, generate actual PDF here
      res.json({
        success: true,
        data: postmortem,
        message: 'PDF export ready (PDF generation would happen here)'
      });
    } catch (error) {
      console.error('Export PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export PDF'
      });
    }
  }

  // Add action item to postmortem
  async addActionItem(req, res) {
    try {
      const { id } = req.params;
      const { task, assignedTo, dueDate, notes } = req.body;
      
      if (!task) {
        return res.status(400).json({
          success: false,
          message: 'Task is required'
        });
      }
      
      const postmortem = await Postmortem.findById(id);
      if (!postmortem) {
        return res.status(404).json({
          success: false,
          message: 'Postmortem not found'
        });
      }
      
      const actionItem = {
        task,
        dueDate: dueDate || null,
        notes: notes || '',
        completed: false
      };
      
      // Only add assignedTo if it's a valid ObjectId
      if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
        actionItem.assignedTo = assignedTo;
      }
      
      postmortem.actionItems.push(actionItem);
      await postmortem.save();
      
      res.status(201).json({
        success: true,
        data: postmortem.actionItems[postmortem.actionItems.length - 1],
        message: 'Action item added successfully'
      });
    } catch (error) {
      console.error('Add action item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add action item'
      });
    }
  }

  // Update action item
  async updateActionItem(req, res) {
    try {
      const { id, actionItemId } = req.params;
      const updates = req.body;
      
      const postmortem = await Postmortem.findById(id);
      if (!postmortem) {
        return res.status(404).json({
          success: false,
          message: 'Postmortem not found'
        });
      }
      
      const actionItem = postmortem.actionItems.id(actionItemId);
      if (!actionItem) {
        return res.status(404).json({
          success: false,
          message: 'Action item not found'
        });
      }
      
      // Update fields
      if (updates.task) actionItem.task = updates.task;
      if (updates.dueDate) actionItem.dueDate = updates.dueDate;
      if (updates.notes) actionItem.notes = updates.notes;
      if (updates.completed !== undefined) {
        actionItem.completed = updates.completed;
        if (updates.completed === true) {
          actionItem.completedAt = new Date();
        }
      }
      
      if (updates.assignedTo && mongoose.Types.ObjectId.isValid(updates.assignedTo)) {
        actionItem.assignedTo = updates.assignedTo;
      }
      
      await postmortem.save();
      
      res.json({
        success: true,
        data: actionItem,
        message: 'Action item updated successfully'
      });
    } catch (error) {
      console.error('Update action item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update action item'
      });
    }
  }
}

module.exports = new PostmortemController();