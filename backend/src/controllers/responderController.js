const User = require('../models/User');
const Incident = require('../models/Incident');
const cacheService = require('../services/cacheService');

class ResponderController {
  async getResponders(req, res) {
    try {
      const { role, isOnCall } = req.query;
      const cacheKey = `responders:${role || 'all'}:${isOnCall || 'all'}`;
      
      let responders = await cacheService.get(cacheKey);
      
      if (!responders) {
        const query = { role: { $in: ['admin', 'responder'] } };
        if (role) query.role = role;
        if (isOnCall) query.isOnCall = isOnCall === 'true';
        
        responders = await User.find(query).select('-password');
        await cacheService.set(cacheKey, responders, 300);
      }
      
      res.json({
        success: true,
        data: responders
      });
    } catch (error) {
      console.error('Get responders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch responders'
      });
    }
  }

  async addResponder(req, res) {
    try {
      const { name, email, role, skills } = req.body;
      
      const responder = await User.create({
        name,
        email,
        role: role || 'responder',
        skills,
        isAvailable: true
      });
      
      await cacheService.invalidatePattern('responders:*');
      
      res.status(201).json({
        success: true,
        data: responder
      });
    } catch (error) {
      console.error('Add responder error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add responder'
      });
    }
  }

  async updateAvailability(req, res) {
    try {
      const { id } = req.params;
      const { isAvailable } = req.body;
      
      const responder = await User.findByIdAndUpdate(
        id,
        { isAvailable, lastActive: new Date() },
        { new: true }
      ).select('-password');
      
      await cacheService.invalidatePattern('responders:*');
      
      res.json({
        success: true,
        data: responder
      });
    } catch (error) {
      console.error('Update availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update availability'
      });
    }
  }

  async getCurrentOnCall(req, res) {
    try {
      const onCallResponders = await User.find({
        isOnCall: true,
        isAvailable: true
      }).select('name email skills');
      
      res.json({
        success: true,
        data: onCallResponders
      });
    } catch (error) {
      console.error('Get on-call error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch on-call responders'
      });
    }
  }

  async updateResponder(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const responder = await User.findByIdAndUpdate(id, updates, { new: true })
        .select('-password');
      
      await cacheService.invalidatePattern('responders:*');
      
      res.json({
        success: true,
        data: responder
      });
    } catch (error) {
      console.error('Update responder error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update responder'
      });
    }
  }

  async deleteResponder(req, res) {
    try {
      const { id } = req.params;
      await User.findByIdAndDelete(id);
      
      await cacheService.invalidatePattern('responders:*');
      
      res.json({
        success: true,
        message: 'Responder deleted successfully'
      });
    } catch (error) {
      console.error('Delete responder error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete responder'
      });
    }
  }

  async getResponderById(req, res) {
    try {
      const { id } = req.params;
      const responder = await User.findById(id).select('-password');
      
      if (!responder) {
        return res.status(404).json({
          success: false,
          message: 'Responder not found'
        });
      }
      
      // Get assigned incidents
      const activeIncidents = await Incident.find({
        responders: id,
        status: { $ne: 'RESOLVED' }
      }).select('title severity status createdAt');
      
      res.json({
        success: true,
        data: { ...responder.toObject(), activeIncidents }
      });
    } catch (error) {
      console.error('Get responder error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch responder'
      });
    }
  }
}

module.exports = new ResponderController();