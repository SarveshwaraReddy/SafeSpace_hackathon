const Incident = require('../models/Incident');
const cacheService = require('../services/cacheService');

class StatusController {
  async getCurrentStatus(req, res) {
    try {
      const cacheKey = 'public:current-status';
      let status = await cacheService.get(cacheKey);
      
      if (!status) {
        const activeIncidents = await Incident.find({
          status: { $ne: 'RESOLVED' },
          isPublic: true
        }).select('title severity status createdAt aiSummary');
        
        const resolvedToday = await Incident.countDocuments({
          status: 'RESOLVED',
          resolvedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
        });
        
        const overallStatus = this.calculateOverallStatus(activeIncidents);
        
        status = {
          overall: overallStatus,
          activeIncidents: activeIncidents.length,
          resolvedToday,
          incidents: activeIncidents,
          lastUpdated: new Date()
        };
        
        await cacheService.set(cacheKey, status, 30); // Cache for 30 seconds
      }
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Get current status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch status'
      });
    }
  }

  async getActiveIncidents(req, res) {
    try {
      const cacheKey = 'public:active-incidents';
      let incidents = await cacheService.get(cacheKey);
      
      if (!incidents) {
        incidents = await Incident.find({
          status: { $ne: 'RESOLVED' },
          isPublic: true
        })
        .select('title severity status createdAt updates')
        .sort({ createdAt: -1 })
        .limit(10);
        
        await cacheService.set(cacheKey, incidents, 30);
      }
      
      res.json({
        success: true,
        data: incidents
      });
    } catch (error) {
      console.error('Get active incidents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active incidents'
      });
    }
  }

  async getServicesStatus(req, res) {
    try {
      const cacheKey = 'public:services-status';
      let services = await cacheService.get(cacheKey);
      
      if (!services) {
        // Get unique services from incidents
        const allServices = await Incident.distinct('affectedServices');
        
        services = await Promise.all(allServices.map(async (service) => {
          const activeIncidents = await Incident.countDocuments({
            affectedServices: service,
            status: { $ne: 'RESOLVED' }
          });
          
          const lastIncident = await Incident.findOne({
            affectedServices: service
          }).sort({ createdAt: -1 });
          
          return {
            name: service,
            status: activeIncidents > 0 ? 'degraded' : 'operational',
            activeIncidents,
            lastIncident: lastIncident?.createdAt || null
          };
        }));
        
        await cacheService.set(cacheKey, services, 60);
      }
      
      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      console.error('Get services status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch services status'
      });
    }
  }

  async getStatusHistory(req, res) {
    try {
      const { days = 7 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const incidents = await Incident.find({
        createdAt: { $gte: startDate }
      }).select('status severity createdAt resolvedAt');
      
      // Group by date
      const history = {};
      incidents.forEach(incident => {
        const date = incident.createdAt.toISOString().split('T')[0];
        if (!history[date]) {
          history[date] = { date, incidents: 0, resolved: 0, sev0: 0, sev1: 0 };
        }
        history[date].incidents++;
        if (incident.status === 'RESOLVED') history[date].resolved++;
        if (incident.severity === 'SEV0') history[date].sev0++;
        if (incident.severity === 'SEV1') history[date].sev1++;
      });
      
      const historyArray = Object.values(history).sort((a, b) => a.date.localeCompare(b.date));
      
      res.json({
        success: true,
        data: historyArray
      });
    } catch (error) {
      console.error('Get status history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch status history'
      });
    }
  }

  async getUptimeStats(req, res) {
    try {
      const { period = '30d' } = req.query;
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const totalMinutes = days * 24 * 60;
      const incidentMinutes = await this.calculateIncidentMinutes(startDate);
      
      const uptime = ((totalMinutes - incidentMinutes) / totalMinutes) * 100;
      
      res.json({
        success: true,
        data: {
          period: days,
          uptime: uptime.toFixed(2),
          totalMinutes,
          incidentMinutes,
          sla: uptime >= 99.9 ? 'met' : 'breached'
        }
      });
    } catch (error) {
      console.error('Get uptime stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch uptime stats'
      });
    }
  }

  calculateOverallStatus(activeIncidents) {
    if (activeIncidents.some(i => i.severity === 'SEV0')) return 'critical';
    if (activeIncidents.some(i => i.severity === 'SEV1')) return 'major';
    if (activeIncidents.length > 0) return 'degraded';
    return 'operational';
  }

  async calculateIncidentMinutes(startDate) {
    const incidents = await Incident.find({
      createdAt: { $gte: startDate },
      status: 'RESOLVED'
    });
    
    let totalIncidentMinutes = 0;
    incidents.forEach(incident => {
      if (incident.resolvedAt) {
        const duration = (incident.resolvedAt - incident.createdAt) / (1000 * 60);
        totalIncidentMinutes += duration;
      }
    });
    
    return totalIncidentMinutes;
  }
}

module.exports = new StatusController();