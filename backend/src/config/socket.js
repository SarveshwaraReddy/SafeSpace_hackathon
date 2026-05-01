const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketManager {
  constructor(server) {
    this.io = null;
    this.server = server;
    this.connectedClients = new Map();
    this.roomSubscribers = new Map();
  }

  initialize() {
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST']
      },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log('✅ Socket.IO server initialized (standalone mode)');
    return this.io;
  }

  setupMiddleware() {
    // Authentication middleware for sockets
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        socket.userId = user._id.toString();
        next();
      } catch (error) {
        console.error('Socket auth error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🟢 Client connected: ${socket.id} (User: ${socket.user?.name})`);
      
      // Store client connection
      this.connectedClients.set(socket.id, {
        socketId: socket.id,
        userId: socket.userId,
        userName: socket.user?.name,
        connectedAt: new Date(),
        rooms: new Set()
      });

      // Subscribe to incident updates
      socket.on('subscribe:incident', (incidentId) => {
        this.subscribeToIncident(socket, incidentId);
      });

      // Unsubscribe from incident updates
      socket.on('unsubscribe:incident', (incidentId) => {
        this.unsubscribeFromIncident(socket, incidentId);
      });

      // Subscribe to dashboard
      socket.on('subscribe:dashboard', () => {
        this.subscribeToDashboard(socket);
      });

      // Join team room
      socket.on('join:team', (teamId) => {
        socket.join(`team:${teamId}`);
        console.log(`👥 ${socket.user?.name} joined team room team:${teamId}`);
      });

      // Send real-time update
      socket.on('incident:update', async (data) => {
        await this.handleIncidentUpdate(socket, data);
      });

      // Request incident timeline
      socket.on('timeline:request', async (incidentId) => {
        await this.sendTimeline(socket, incidentId);
      });

      // Typing indicators
      socket.on('typing:start', (incidentId) => {
        socket.to(`incident:${incidentId}`).emit('typing:start', {
          userId: socket.userId,
          userName: socket.user.name
        });
      });

      socket.on('typing:stop', (incidentId) => {
        socket.to(`incident:${incidentId}`).emit('typing:stop', {
          userId: socket.userId
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  subscribeToIncident(socket, incidentId) {
    const roomName = `incident:${incidentId}`;
    socket.join(roomName);
    
    const client = this.connectedClients.get(socket.id);
    if (client) {
      client.rooms.add(roomName);
    }
    
    if (!this.roomSubscribers.has(roomName)) {
      this.roomSubscribers.set(roomName, new Set());
    }
    this.roomSubscribers.get(roomName).add(socket.id);
    
    console.log(`📡 ${socket.user?.name} subscribed to ${roomName}`);
    
    socket.emit('subscribed', {
      incidentId,
      room: roomName,
      timestamp: new Date()
    });
  }

  unsubscribeFromIncident(socket, incidentId) {
    const roomName = `incident:${incidentId}`;
    socket.leave(roomName);
    
    const client = this.connectedClients.get(socket.id);
    if (client) {
      client.rooms.delete(roomName);
    }
    
    const subscribers = this.roomSubscribers.get(roomName);
    if (subscribers) {
      subscribers.delete(socket.id);
      if (subscribers.size === 0) {
        this.roomSubscribers.delete(roomName);
      }
    }
    
    console.log(`📡 ${socket.user?.name} unsubscribed from ${roomName}`);
  }

  subscribeToDashboard(socket) {
    socket.join('dashboard');
    const client = this.connectedClients.get(socket.id);
    if (client) {
      client.rooms.add('dashboard');
    }
    console.log(`📊 ${socket.user?.name} subscribed to dashboard`);
  }

  async handleIncidentUpdate(socket, data) {
    try {
      const { incidentId, update, status, severity } = data;
      
      const TimelineEvent = require('../models/TimelineEvent');
      
      const timelineEvent = await TimelineEvent.create({
        incidentId,
        eventType: 'UPDATE',
        description: update,
        performedBy: socket.userId,
        metadata: { status, severity }
      });
      
      this.emitToIncidentRoom(incidentId, 'incident:updated', {
        incidentId,
        update,
        status,
        severity,
        performedBy: {
          id: socket.userId,
          name: socket.user.name
        },
        timestamp: new Date(),
        timelineEvent
      });
      
      this.emitToDashboard('incident:update', {
        incidentId,
        update,
        updatedBy: socket.user.name,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Handle incident update error:', error);
      socket.emit('error', { message: 'Failed to process update' });
    }
  }

  async sendTimeline(socket, incidentId) {
    try {
      const TimelineEvent = require('../models/TimelineEvent');
      
      const timeline = await TimelineEvent.find({ incidentId })
        .populate('performedBy', 'name email')
        .sort({ timestamp: -1 })
        .limit(50);
      
      socket.emit('timeline:response', {
        incidentId,
        timeline,
        count: timeline.length
      });
    } catch (error) {
      console.error('Send timeline error:', error);
      socket.emit('error', { message: 'Failed to fetch timeline' });
    }
  }

  handleDisconnect(socket) {
    console.log(`🔴 Client disconnected: ${socket.id}`);
    
    const client = this.connectedClients.get(socket.id);
    if (client) {
      client.rooms.forEach(room => {
        const subscribers = this.roomSubscribers.get(room);
        if (subscribers) {
          subscribers.delete(socket.id);
          if (subscribers.size === 0) {
            this.roomSubscribers.delete(room);
          }
        }
      });
    }
    
    this.connectedClients.delete(socket.id);
  }

  // Public methods for emitting events
  emitToIncidentRoom(incidentId, event, data) {
    this.io.to(`incident:${incidentId}`).emit(event, data);
  }

  emitToDashboard(event, data) {
    this.io.to('dashboard').emit(event, data);
  }

  emitToTeam(teamId, event, data) {
    this.io.to(`team:${teamId}`).emit(event, data);
  }

  emitToUser(userId, event, data) {
    const userSockets = Array.from(this.connectedClients.entries())
      .filter(([_, client]) => client.userId === userId)
      .map(([socketId]) => socketId);
    
    userSockets.forEach(socketId => {
      this.io.to(socketId).emit(event, data);
    });
  }

  broadcastNewIncident(incident) {
    this.io.emit('new:incident', {
      incident,
      timestamp: new Date()
    });
    this.emitToDashboard('new:incident', incident);
  }

  broadcastIncidentResolution(incident) {
    this.io.emit('incident:resolved', {
      incidentId: incident._id,
      title: incident.title,
      resolvedAt: incident.resolvedAt,
      duration: incident.resolvedAt ? 
        ((incident.resolvedAt - incident.createdAt) / 1000 / 60).toFixed(1) : null
    });
  }

  notifyResponderAssignment(incident, responder) {
    this.emitToUser(responder.userId, 'assigned:incident', {
      incidentId: incident._id,
      title: incident.title,
      severity: incident.severity,
      assignedAt: new Date()
    });
  }

  getStats() {
    return {
      totalConnections: this.connectedClients.size,
      activeRooms: this.roomSubscribers.size,
      rooms: Array.from(this.roomSubscribers.keys()),
      connectionsByUser: Array.from(this.connectedClients.values()).map(c => ({
        userName: c.userName,
        connectedAt: c.connectedAt,
        rooms: Array.from(c.rooms)
      }))
    };
  }

  async close() {
    if (this.io) {
      await this.io.close();
      console.log('Socket.IO server closed');
    }
  }
}

let socketManager = null;

function initializeSocket(server) {
  if (!socketManager) {
    socketManager = new SocketManager(server);
    return socketManager.initialize();
  }
  return socketManager.io;
}

function getSocketManager() {
  if (!socketManager) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return socketManager;
}

module.exports = {
  initializeSocket,
  getSocketManager
};