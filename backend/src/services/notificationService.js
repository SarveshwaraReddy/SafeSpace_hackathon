const nodemailer = require('nodemailer');
const Incident = require('../models/Incident');
const User = require('../models/User');
const { getSocketManager } = require('../config/socket'); // ✅ IMPORTANT

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async notifyNewIncident(incident) {
    try {
      // 📧 Get responders
      const responders = await User.find({
        role: { $in: ['admin', 'responder'] },
        isAvailable: true
      });

      const emails = responders.map(r => r.email);

      // 📧 Send email
      await this.sendEmail({
        to: emails,
        subject: `🚨 New Incident: ${incident.severity} - ${incident.title}`,
        html: `
          <h2>New Incident Created</h2>
          <p><strong>Title:</strong> ${incident.title}</p>
          <p><strong>Severity:</strong> ${incident.severity}</p>
          <p><strong>Description:</strong> ${incident.description}</p>
          <p><strong>Affected Services:</strong> ${incident.affectedServices.join(', ')}</p>
          <a href="${process.env.APP_URL}/incidents/${incident._id}">
            View Incident
          </a>
        `
      });

      // 🔔 WebSocket Notification (FIXED)
      const socketManager = getSocketManager();
      socketManager.broadcastNewIncident(incident);

      console.log('📡 WebSocket: New incident broadcasted');

    } catch (error) {
      console.error('Notification error:', error.message);
    }
  }

  async notifyStatusChange(incident, oldStatus) {
    try {
      const subscribers = await User.find({
        'notifications.incidentUpdates': true
      });

      const emails = subscribers.map(s => s.email);

      await this.sendEmail({
        to: emails,
        subject: `📢 Incident Update: ${incident.title}`,
        html: `
          <h2>Incident Status Changed</h2>
          <p><strong>Incident:</strong> ${incident.title}</p>
          <p><strong>Status:</strong> ${oldStatus} → ${incident.status}</p>
          <p><strong>Latest Update:</strong> ${
            incident.updates[incident.updates.length - 1]?.message || 'N/A'
          }</p>
          <a href="${process.env.APP_URL}/incidents/${incident._id}">
            View Details
          </a>
        `
      });

      // 🔔 Optional: real-time update bhi bhej sakte ho
      const socketManager = getSocketManager();
      socketManager.emitToDashboard('incident:statusChanged', {
        incidentId: incident._id,
        title: incident.title,
        oldStatus,
        newStatus: incident.status,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Status notification error:', error.message);
    }
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `"Incident Platform" <${process.env.SMTP_USER}>`,
        ...options
      };

      await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully');

    } catch (error) {
      console.error('Email send error:', error.message);
    }
  }

  async sendSlackNotification(webhookUrl, message) {
    // Future implementation
    console.log('Slack notification:', message);
  }

  async sendSMS(phoneNumber, message) {
    // Future implementation
    console.log('SMS notification:', phoneNumber, message);
  }
}

module.exports = new NotificationService();