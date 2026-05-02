const User = require('../models/User');
const Responder = require('../models/Responder');
const Incident = require('../models/Incident');
const cacheService = require('../services/cacheService');
const bcrypt = require('bcryptjs');

class ResponderController {
  // Get all responders
  async getResponders(req, res) {
    try {
      const { role, isOnCall, department } = req.query;
      const cacheKey = `responders:${role || 'all'}:${isOnCall || 'all'}:${department || 'all'}`;
      
      let responders = await cacheService.get(cacheKey);
      
      if (!responders) {
        // First, get all users with responder role
        const userQuery = { role: { $in: ['admin', 'responder'] } };
        if (role) userQuery.role = role;
        
        const users = await User.find(userQuery).select('-password');
        
        // Then get their responder details
        const responderIds = users.map(u => u._id);
        const responderDetails = await Responder.find({ 
          user: { $in: responderIds } 
        }).populate('user', 'name email role');
        
        // Filter by department if specified
        let filteredResponders = responderDetails;
        if (department) {
          filteredResponders = responderDetails.filter(r => r.department === department);
        }
        
        // Filter by on-call status if specified
        if (isOnCall === 'true') {
          filteredResponders = filteredResponders.filter(r => r.availability.isOnCall === true);
        } else if (isOnCall === 'false') {
          filteredResponders = filteredResponders.filter(r => r.availability.isOnCall === false);
        }
        
        responders = filteredResponders;
        await cacheService.set(cacheKey, responders, 300);
      }
      
      res.json({
        success: true,
        data: responders,
        count: responders.length
      });
    } catch (error) {
      console.error('Get responders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch responders'
      });
    }
  }

  // Add new responder (creates both User and Responder)
  async addResponder(req, res) {
  try {
    const { 
      userId,  // Optional: if user already exists
      name, 
      email, 
      password,
      employeeId,
      department,
      role,
      skills,
      certifications,
      availability,
      communication
    } = req.body;
    
    let user;
    
    // Case 1: User already exists (userId provided)
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with the provided userId'
        });
      }
      
      // Update user role if needed
      if (user.role !== 'responder' && user.role !== 'admin') {
        user.role = 'responder';
        await user.save();
      }
    } 
    // Case 2: Create new user
    else {
      // Validate required fields for new user
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name and email are required when creating a new user'
        });
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      
      // Hash password (use default if not provided)
      const defaultPassword = password || `Temp@${Date.now()}`;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      
      // Create User account
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'responder',
        skills: skills ? skills.map(s => typeof s === 'string' ? s : s.name) : [],
        isAvailable: availability?.currentStatus === 'Available',
        isOnCall: availability?.isOnCall || false,
        lastActive: new Date()
      });
    }
    
    // Check if responder profile already exists
    const existingResponder = await Responder.findOne({ user: user._id });
    if (existingResponder) {
      return res.status(400).json({
        success: false,
        message: 'Responder profile already exists for this user'
      });
    }
    
    // Create Responder profile
    const responder = await Responder.create({
      user: user._id,
      employeeId: employeeId || `EMP${Date.now()}`,
      department: department || 'Engineering',
      role: role || 'Secondary',
      skills: skills || [],
      certifications: certifications || [],
      availability: {
        isOnCall: availability?.isOnCall || false,
        schedule: availability?.schedule || '24/7',
        timezone: availability?.timezone || 'UTC',
        currentStatus: availability?.currentStatus || 'Available',
        lastActive: new Date()
      },
      communication: communication || {
        email: user.email,
        notificationsEnabled: true,
        preferredChannel: 'Email'
      },
      performance: {
        incidentsAssigned: 0,
        incidentsResolved: 0,
        averageResponseTime: 0,
        averageResolutionTime: 0,
        slaComplianceRate: 100,
        rating: 0
      }
    });
    
    // Clear cache
    await cacheService.invalidatePattern('responders:*');
    
    const responseData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      responder: {
        id: responder._id,
        employeeId: responder.employeeId,
        department: responder.department,
        role: responder.role,
        skills: responder.skills,
        availability: responder.availability
      }
    };
    
    res.status(201).json({
      success: true,
      data: responseData,
      message: userId ? 'Responder profile added to existing user' : 'Responder added successfully'
    });
  } catch (error) {
    console.error('Add responder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add responder',
      error: error.message
    });
  }
}

  // Get responder by ID
  async getResponderById(req, res) {
    try {
      const { id } = req.params;

      console.log('Fetching responder with ID:', id);
      
      const responder = await Responder.findOne({ _id: id })
        .populate('user', '-password')
        .populate('currentIncidents', 'title severity status createdAt');
      
      if (!responder) {
        return res.status(404).json({
          success: false,
          message: 'Responder not found'
        });
      }
      
      // Get assigned incidents
      const assignedIncidents = await Incident.find({
        responders: responder.user._id,
        status: { $ne: 'RESOLVED' }
      }).select('title severity status createdAt');
      
      res.json({
        success: true,
        data: {
          ...responder.toObject(),
          activeIncidents: assignedIncidents
        }
      });
    } catch (error) {
      console.error('Get responder error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch responder'
      });
    }
  }

  // Update responder
  async updateResponder(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const responder = await Responder.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('user', '-password');
      
      if (!responder) {
        return res.status(404).json({
          success: false,
          message: 'Responder not found'
        });
      }
      
      // Update corresponding User if needed
      if (updates.skills) {
        await User.findByIdAndUpdate(responder.user._id, {
          skills: updates.skills.map(s => typeof s === 'string' ? s : s.name)
        });
      }
      
      await cacheService.invalidatePattern('responders:*');
      
      res.json({
        success: true,
        data: responder,
        message: 'Responder updated successfully'
      });
    } catch (error) {
      console.error('Update responder error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update responder'
      });
    }
  }

  // Update availability
  async updateAvailability(req, res) {
    try {
      const { id } = req.params;
      const { isAvailable, currentStatus, isOnCall } = req.body;
      
      const responder = await Responder.findById(id);
      if (!responder) {
        return res.status(404).json({
          success: false,
          message: 'Responder not found'
        });
      }
      
      if (isAvailable !== undefined) {
        responder.availability.currentStatus = isAvailable ? 'Available' : 'Offline';
      }
      if (currentStatus) {
        responder.availability.currentStatus = currentStatus;
      }
      if (isOnCall !== undefined) {
        responder.availability.isOnCall = isOnCall;
      }
      
      responder.availability.lastActive = new Date();
      await responder.save();
      
      // Update User model
      await User.findByIdAndUpdate(responder.user, {
        isAvailable: responder.availability.currentStatus === 'Available',
        isOnCall: responder.availability.isOnCall
      });
      
      await cacheService.invalidatePattern('responders:*');
      
      res.json({
        success: true,
        data: responder.availability,
        message: 'Availability updated successfully'
      });
    } catch (error) {
      console.error('Update availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update availability'
      });
    }
  }

  // Get current on-call responders
  async getCurrentOnCall(req, res) {
    try {
      const onCallResponders = await Responder.find({
        'availability.isOnCall': true,
        'availability.currentStatus': 'Available'
      }).populate('user', 'name email skills');
      
      res.json({
        success: true,
        data: onCallResponders,
        count: onCallResponders.length
      });
    } catch (error) {
      console.error('Get on-call error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch on-call responders'
      });
    }
  }

  // Assign responder to incident
  async assignToIncident(req, res) {
    try {
      const { id, incidentId } = req.params;
      const { role = 'Support' } = req.body;
      
      const responder = await Responder.findById(id);
      if (!responder) {
        return res.status(404).json({
          success: false,
          message: 'Responder not found'
        });
      }
      
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      // Check if already assigned
      if (incident.responders.includes(responder.user)) {
        return res.status(400).json({
          success: false,
          message: 'Responder already assigned to this incident'
        });
      }
      
      // Add to incident
      incident.responders.push(responder.user);
      if (!incident.assignee) {
        incident.assignee = responder.user;
      }
      await incident.save();
      
      // Update responder
      responder.currentIncidents.push(incidentId);
      responder.assignedIncidents.push({
        incident: incidentId,
        assignedAt: new Date(),
        role
      });
      responder.availability.currentStatus = 'In Incident';
      responder.performance.incidentsAssigned++;
      await responder.save();
      
      await cacheService.invalidatePattern('responders:*');
      await cacheService.del(`incident:${incidentId}`);
      
      res.json({
        success: true,
        message: 'Responder assigned to incident successfully',
        data: {
          incidentId,
          responderId: id,
          role,
          assignedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Assign to incident error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign responder to incident'
      });
    }
  }

  // Get responder's incidents
  async getResponderIncidents(req, res) {
    try {
      const { id } = req.params;
      
      const responder = await Responder.findById(id);
      if (!responder) {
        return res.status(404).json({
          success: false,
          message: 'Responder not found'
        });
      }
      
      const incidents = await Incident.find({
        responders: responder.user
      })
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 })
      .select('title severity status createdAt resolvedAt');
      
      res.json({
        success: true,
        data: incidents,
        count: incidents.length
      });
    } catch (error) {
      console.error('Get responder incidents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch responder incidents'
      });
    }
  }

  // Get responder statistics
  async getResponderStats(req, res) {
    try {
      const stats = await Responder.aggregate([
        {
          $group: {
            _id: '$department',
            totalResponders: { $sum: 1 },
            avgRating: { $avg: '$performance.rating' },
            totalResolved: { $sum: '$performance.incidentsResolved' },
            avgResponseTime: { $avg: '$performance.averageResponseTime' }
          }
        }
      ]);
      
      const totalOnCall = await Responder.countDocuments({
        'availability.isOnCall': true,
        'availability.currentStatus': 'Available'
      });
      
      res.json({
        success: true,
        data: {
          byDepartment: stats,
          totalOnCall,
          totalResponders: await Responder.countDocuments(),
          averageRating: await Responder.aggregate([
            { $group: { _id: null, avg: { $avg: '$performance.rating' } } }
          ])
        }
      });
    } catch (error) {
      console.error('Get responder stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch responder statistics'
      });
    }
  }

  // Delete responder
  async deleteResponder(req, res) {
    try {
      const { id } = req.params;
      
      const responder = await Responder.findById(id);
      if (!responder) {
        return res.status(404).json({
          success: false,
          message: 'Responder not found'
        });
      }
      
      // Delete associated User
      await User.findByIdAndDelete(responder.user);
      
      // Delete Responder profile
      await Responder.findByIdAndDelete(id);
      
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
}

module.exports = new ResponderController();