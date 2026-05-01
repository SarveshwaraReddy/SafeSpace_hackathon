const aiService = require('../services/aiService');
const Incident = require('../models/Incident');
const TimelineEvent = require('../models/TimelineEvent');
const Postmortem = require('../models/Postmortem');
const cacheService = require('../services/cacheService');

class AIController {
  // Generate AI summary for an incident
  async generateIncidentSummary(req, res) {
    try {
      const { id } = req.params;
      
      const incident = await Incident.findById(id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      // Check cache first
      const cacheKey = `ai:summary:${id}`;
      let aiSummary = await cacheService.get(cacheKey);
      
      if (!aiSummary) {
        // Generate new AI summary
        const result = await aiService.generateIncidentSummary(incident);
        
        aiSummary = {
          summary: result.summary,
          rootCauses: result.rootCauses,
          generatedAt: new Date(),
          confidence: 0.85
        };
        
        // Cache for 1 hour
        await cacheService.set(cacheKey, aiSummary, 3600);
        
        // Update incident with AI insights
        incident.aiSummary = result.summary;
        incident.aiRootCause = result.rootCauses;
        await incident.save();
      }
      
      res.json({
        success: true,
        data: aiSummary
      });
    } catch (error) {
      console.error('Generate AI summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI summary'
      });
    }
  }

  // Get AI-powered root cause analysis
  async getRootCauseAnalysis(req, res) {
    try {
      const { id } = req.params;
      
      const incident = await Incident.findById(id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      const timeline = await TimelineEvent.find({ incidentId: id })
        .sort({ timestamp: 1 });
      
      const cacheKey = `ai:rootcause:${id}`;
      let analysis = await cacheService.get(cacheKey);
      
      if (!analysis) {
        // Analyze timeline for root cause
        const prompt = `
          Analyze this incident timeline and identify:
          1. Most likely root cause
          2. Contributing factors
          3. Patterns or anomalies
          4. Similar past incidents
          
          Incident: ${incident.title}
          Severity: ${incident.severity}
          Timeline events: ${timeline.map(t => `${t.timestamp}: ${t.description}`).join('\n')}
        `;
        
        const openai = require('openai');
        const client = new openai({ apiKey: process.env.OPENAI_API_KEY });
        
        const completion = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert SRE root cause analyst. Provide structured analysis."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        });
        
        analysis = {
          rootCause: completion.choices[0].message.content,
          confidence: 0.75,
          analyzedAt: new Date(),
          eventsAnalyzed: timeline.length
        };
        
        await cacheService.set(cacheKey, analysis, 3600);
      }
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Root cause analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze root cause'
      });
    }
  }

  // Generate incident prediction based on historical data
  async predictNextIncident(req, res) {
    try {
      const { days = 7 } = req.query;
      
      const cacheKey = `ai:predictions:${days}`;
      let predictions = await cacheService.get(cacheKey);
      
      if (!predictions) {
        // Get historical incidents
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const historicalIncidents = await Incident.find({
          createdAt: { $gte: startDate }
        }).select('severity affectedServices createdAt');
        
        // Analyze patterns
        const serviceFrequency = {};
        const severityPatterns = {};
        const timePatterns = {};
        
        historicalIncidents.forEach(incident => {
          // Service frequency
          incident.affectedServices.forEach(service => {
            serviceFrequency[service] = (serviceFrequency[service] || 0) + 1;
          });
          
          // Severity patterns
          const hour = incident.createdAt.getHours();
          severityPatterns[incident.severity] = (severityPatterns[incident.severity] || 0) + 1;
          timePatterns[hour] = (timePatterns[hour] || 0) + 1;
        });
        
        // Use AI to predict
        const openai = require('openai');
        const client = new openai({ apiKey: process.env.OPENAI_API_KEY });
        
        const completion = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an AI predicting future incidents based on patterns."
            },
            {
              role: "user",
              content: `
                Based on these patterns, predict likely incidents in next ${days} days:
                Service frequency: ${JSON.stringify(serviceFrequency)}
                Severity distribution: ${JSON.stringify(severityPatterns)}
                Time patterns: ${JSON.stringify(timePatterns)}
                
                Provide:
                1. Most at-risk services
                2. Expected incident count
                3. Recommended preventive actions
              `
            }
          ],
          temperature: 0.5,
          max_tokens: 800
        });
        
        predictions = {
          predictions: completion.choices[0].message.content,
          data: {
            serviceFrequency,
            severityPatterns,
            timePatterns,
            totalIncidents: historicalIncidents.length
          },
          generatedAt: new Date(),
          validFor: `${days} days`
        };
        
        await cacheService.set(cacheKey, predictions, 86400); // Cache for 24 hours
      }
      
      res.json({
        success: true,
        data: predictions
      });
    } catch (error) {
      console.error('Predict incident error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate predictions'
      });
    }
  }

  // Analyze incident similarity for learning
  async findSimilarIncidents(req, res) {
    try {
      const { id } = req.params;
      
      const currentIncident = await Incident.findById(id);
      if (!currentIncident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      // Find similar incidents based on title, description, affected services
      const similarIncidents = await Incident.find({
        _id: { $ne: id },
        $or: [
          { affectedServices: { $in: currentIncident.affectedServices } },
          { severity: currentIncident.severity },
          { title: { $regex: currentIncident.title.split(' ').slice(0, 3).join('|'), $options: 'i' } }
        ]
      })
      .limit(5)
      .select('title severity status resolvedAt createdAt');
      
      const cacheKey = `ai:similar:${id}`;
      let analysis = await cacheService.get(cacheKey);
      
      if (!analysis && similarIncidents.length > 0) {
        const openai = require('openai');
        const client = new openai({ apiKey: process.env.OPENAI_API_KEY });
        
        const completion = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an incident analysis AI. Compare and provide insights."
            },
            {
              role: "user",
              content: `
                Current incident: ${currentIncident.title} - ${currentIncident.description}
                Similar past incidents: ${similarIncidents.map(i => i.title).join(', ')}
                
                Provide:
                1. Common patterns
                2. Successful resolution strategies from past incidents
                3. Estimated resolution time based on similar incidents
              `
            }
          ],
          temperature: 0.3,
          max_tokens: 600
        });
        
        analysis = {
          insights: completion.choices[0].message.content,
          similarIncidents: similarIncidents,
          count: similarIncidents.length,
          generatedAt: new Date()
        };
        
        await cacheService.set(cacheKey, analysis, 1800); // Cache for 30 minutes
      }
      
      res.json({
        success: true,
        data: analysis || { similarIncidents, message: 'No AI analysis available' }
      });
    } catch (error) {
      console.error('Find similar incidents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to find similar incidents'
      });
    }
  }

  // Generate automated postmortem using AI
  async generatePostmortemAI(req, res) {
    try {
      const { id } = req.params;
      
      const incident = await Incident.findById(id)
        .populate('assignee', 'name email')
        .populate('responders', 'name email');
      
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }
      
      const timeline = await TimelineEvent.find({ incidentId: id })
        .populate('performedBy', 'name')
        .sort({ timestamp: 1 });
      
      const cacheKey = `ai:postmortem:${id}`;
      let postmortem = await cacheService.get(cacheKey);
      
      if (!postmortem) {
        // Calculate metrics
        const timeToDetect = timeline.length > 0 
          ? (timeline[0].timestamp - incident.createdAt) / 1000 / 60 
          : null;
        
        const timeToResolve = incident.resolvedAt
          ? (incident.resolvedAt - incident.createdAt) / 1000 / 60
          : null;
        
        const response = await aiService.generatePostmortem(incident, timeline, 'AI Generated');
        
        postmortem = {
          title: `Postmortem: ${incident.title}`,
          executiveSummary: response.split('\n\n')[0],
          timeline: timeline.map(t => ({
            time: t.timestamp,
            event: t.description,
            actor: t.performedBy?.name || 'System'
          })),
          metrics: {
            timeToDetect: timeToDetect ? `${timeToDetect.toFixed(1)} minutes` : 'N/A',
            timeToResolve: timeToResolve ? `${timeToResolve.toFixed(1)} minutes` : 'In progress',
            responderCount: incident.responders.length,
            updateCount: incident.updates.length
          },
          rootCause: incident.aiRootCause || 'Analysis pending',
          recommendations: [
            'Implement better monitoring for affected services',
            'Create runbook for similar incidents',
            'Improve alerting thresholds',
            'Conduct team training on incident response'
          ],
          fullReport: response,
          generatedAt: new Date(),
          aiGenerated: true
        };
        
        await cacheService.set(cacheKey, postmortem, 7200); // Cache for 2 hours
      }
      
      res.json({
        success: true,
        data: postmortem
      });
    } catch (error) {
      console.error('Generate postmortem AI error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI postmortem'
      });
    }
  }

  // Get AI-powered insights dashboard
  async getAIDashboard(req, res) {
    try {
      const cacheKey = 'ai:dashboard';
      let dashboard = await cacheService.get(cacheKey);
      
      if (!dashboard) {
        // Get recent incidents
        const recentIncidents = await Incident.find({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }).limit(10);
        
        // Get common issues
        const commonServices = await Incident.aggregate([
          { $unwind: '$affectedServices' },
          { $group: { _id: '$affectedServices', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]);
        
        // Generate AI insights
        const openai = require('openai');
        const client = new openai({ apiKey: process.env.OPENAI_API_KEY });
        
        const completion = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an AI providing operational insights."
            },
            {
              role: "user",
              content: `
                Based on recent data:
                - Recent incidents: ${recentIncidents.length}
                - Most affected services: ${commonServices.map(s => s._id).join(', ')}
                
                Provide 3 key insights and recommendations for improving system reliability.
              `
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });
        
        dashboard = {
          insights: completion.choices[0].message.content,
          commonIssues: commonServices,
          recentActivity: recentIncidents.length,
          recommendations: [
            'Review alerting thresholds for frequently affected services',
            'Schedule reliability review meeting',
            'Update incident runbooks'
          ],
          generatedAt: new Date()
        };
        
        await cacheService.set(cacheKey, dashboard, 1800); // Cache for 30 minutes
      }
      
      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Get AI dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch AI dashboard'
      });
    }
  }

  // Real-time anomaly detection
  async detectAnomalies(req, res) {
    try {
      const { timeRange = '1h' } = req.query;
      
      // Get incident frequency
      const startTime = new Date();
      if (timeRange === '1h') startTime.setHours(startTime.getHours() - 1);
      else if (timeRange === '24h') startTime.setDate(startTime.getDate() - 1);
      else startTime.setDate(startTime.getDate() - 7);
      
      const incidents = await Incident.find({
        createdAt: { $gte: startTime }
      });
      
      // Calculate baseline
      const previousPeriod = new Date(startTime);
      previousPeriod.setDate(previousPeriod.getDate() - 7);
      
      const baselineIncidents = await Incident.find({
        createdAt: { $gte: previousPeriod, $lt: startTime }
      });
      
      const currentRate = incidents.length;
      const baselineRate = baselineIncidents.length / 7; // Average per day
      
      const isAnomaly = currentRate > baselineRate * 2; // 2x baseline is anomaly
      
      let aiAnalysis = null;
      
      if (isAnomaly) {
        const openai = require('openai');
        const client = new openai({ apiKey: process.env.OPENAI_API_KEY });
        
        const completion = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an anomaly detection AI."
            },
            {
              role: "user",
              content: `
                Detected anomaly: ${currentRate} incidents in ${timeRange} vs baseline ${baselineRate.toFixed(1)} per day.
                Please provide analysis and recommended actions.
              `
            }
          ],
          temperature: 0.3,
          max_tokens: 400
        });
        
        aiAnalysis = completion.choices[0].message.content;
      }
      
      res.json({
        success: true,
        data: {
          isAnomaly,
          currentRate,
          baselineRate,
          timeRange,
          incidentCount: incidents.length,
          aiAnalysis,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Anomaly detection error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to detect anomalies'
      });
    }
  }


  // Analyze incident health and provide recommendations
async analyzeIncidentHealth(req, res) {
  try {
    const { id } = req.params;
    
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }
    
    const timeline = await TimelineEvent.find({ incidentId: id })
      .sort({ timestamp: 1 });
    
    const cacheKey = `ai:health:${id}`;
    let healthAnalysis = await cacheService.get(cacheKey);
    
    if (!healthAnalysis) {
      // Calculate health metrics
      const timeToDetect = timeline.length > 0 
        ? (timeline[0].timestamp - incident.createdAt) / 1000 / 60 
        : null;
      
      const updateFrequency = incident.updates.length / 
        ((incident.resolvedAt || new Date()) - incident.createdAt) * 1000 * 60 * 60;
      
      const responderCount = incident.responders.length;
      const hasAIAnalysis = incident.aiSummary ? true : false;
      
      const openai = require('openai');
      const client = new openai({ apiKey: process.env.OPENAI_API_KEY });
      
      const completion = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an incident health analyzer. Provide a health score and recommendations."
          },
          {
            role: "user",
            content: `
              Analyze this incident's health:
              - Time to detect: ${timeToDetect} minutes
              - Update frequency: ${updateFrequency} updates/hour
              - Responder count: ${responderCount}
              - Has AI analysis: ${hasAIAnalysis}
              - Current status: ${incident.status}
              - Severity: ${incident.severity}
              
              Provide:
              1. Health score (0-100)
              2. Risk level (Low/Medium/High/Critical)
              3. Improvement recommendations
              4. Estimated time to resolution
            `
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });
      
      healthAnalysis = {
        healthScore: 75, // Default, AI will provide better
        riskLevel: incident.severity === 'SEV0' ? 'Critical' : 
                   incident.severity === 'SEV1' ? 'High' : 'Medium',
        analysis: completion.choices[0].message.content,
        metrics: {
          timeToDetect: timeToDetect ? `${timeToDetect.toFixed(1)} minutes` : 'N/A',
          updateFrequency: updateFrequency.toFixed(1),
          responderCount,
          hasAIAnalysis
        },
        recommendations: [
          'Increase update frequency',
          'Add more responders if severity is high',
          'Enable AI assistance for faster resolution'
        ],
        estimatedResolution: incident.status === 'RESOLVED' ? 'Resolved' : 'Unknown',
        generatedAt: new Date()
      };
      
      await cacheService.set(cacheKey, healthAnalysis, 1800);
    }
    
    res.json({
      success: true,
      data: healthAnalysis
    });
  } catch (error) {
    console.error('Health analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze incident health'
    });
  }
}

// Generate incident response recommendations
async generateRecommendations(req, res) {
  try {
    const { id } = req.params;
    
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }
    
    const timeline = await TimelineEvent.find({ incidentId: id })
      .sort({ timestamp: -1 })
      .limit(10);
    
    const cacheKey = `ai:recommendations:${id}`;
    let recommendations = await cacheService.get(cacheKey);
    
    if (!recommendations) {
      const openai = require('openai');
      const client = new openai({ apiKey: process.env.OPENAI_API_KEY });
      
      const completion = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an incident response expert. Provide actionable recommendations."
          },
          {
            role: "user",
            content: `
              Based on this incident:
              Title: ${incident.title}
              Severity: ${incident.severity}
              Status: ${incident.status}
              Recent updates: ${timeline.map(t => t.description).join('; ')}
              
              Provide:
              1. Immediate actions to take
              2. Short-term mitigation steps
              3. Long-term preventive measures
              4. Communication strategy
              5. Resource requirements
            `
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      });
      
      recommendations = {
        incidentId: id,
        recommendations: completion.choices[0].message.content,
        priority: incident.severity === 'SEV0' ? 'Critical' : 'High',
        estimatedEffort: incident.severity === 'SEV0' ? '2-4 hours' : '1-2 hours',
        generatedAt: new Date(),
        actionItems: [
          { action: "Assess impact scope", priority: "High", estimatedTime: "30 min" },
          { action: "Communicate with stakeholders", priority: "High", estimatedTime: "15 min" },
          { action: "Implement workaround", priority: "Medium", estimatedTime: "1 hour" },
          { action: "Root cause investigation", priority: "Medium", estimatedTime: "2 hours" }
        ]
      };
      
      await cacheService.set(cacheKey, recommendations, 3600);
    }
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations'
    });
  }
}

// Chat with AI about incident (interactive Q&A)
async chatWithAI(req, res) {
  try {
    const { id } = req.params;
    const { question, conversationHistory = [] } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }
    
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }
    
    const timeline = await TimelineEvent.find({ incidentId: id })
      .populate('performedBy', 'name')
      .sort({ timestamp: -1 })
      .limit(20);
    
    const openai = require('openai');
    const client = new openai({ apiKey: process.env.OPENAI_API_KEY });
    
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant helping with incident: ${incident.title}. 
                  You have access to incident details, timeline, and updates.
                  Provide helpful, accurate, and concise answers based on the incident context.`
      },
      {
        role: "user",
        content: `
          Incident Context:
          Title: ${incident.title}
          Description: ${incident.description}
          Severity: ${incident.severity}
          Status: ${incident.status}
          Affected Services: ${incident.affectedServices.join(', ')}
          
          Timeline Events:
          ${timeline.map(t => `- ${t.timestamp}: ${t.description} (by ${t.performedBy?.name || 'System'})`).join('\n')}
          
          Recent Updates:
          ${incident.updates.slice(-5).map(u => `- ${u.timestamp}: ${u.message}`).join('\n')}
          
          AI Summary: ${incident.aiSummary || 'Not available'}
          AI Root Cause: ${incident.aiRootCause || 'Not available'}
          
          Conversation History:
          ${conversationHistory.map(h => `${h.role}: ${h.content}`).join('\n')}
          
          Question: ${question}
        `
      }
    ];
    
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const answer = completion.choices[0].message.content;
    
    // Store conversation in cache for context
    const conversationKey = `ai:chat:${id}:${req.user.id}`;
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: question, timestamp: new Date() },
      { role: "assistant", content: answer, timestamp: new Date() }
    ];
    await cacheService.set(conversationKey, updatedHistory, 1800);
    
    res.json({
      success: true,
      data: {
        question,
        answer,
        conversationId: conversationKey,
        timestamp: new Date(),
        context: {
          incidentTitle: incident.title,
          incidentStatus: incident.status
        }
      }
    });
  } catch (error) {
    console.error('Chat with AI error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response'
    });
  }
}

// Bulk analyze multiple incidents
async bulkAnalyzeIncidents(req, res) {
  try {
    const { incidentIds, analysisType = 'summary' } = req.body;
    
    if (!incidentIds || !Array.isArray(incidentIds) || incidentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Incident IDs array is required'
      });
    }
    
    if (incidentIds.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 incidents can be analyzed at once'
      });
    }
    
    const incidents = await Incident.find({
      _id: { $in: incidentIds }
    });
    
    const analyses = [];
    
    for (const incident of incidents) {
      let analysis = null;
      
      if (analysisType === 'summary') {
        analysis = await aiService.generateIncidentSummary(incident);
      } else if (analysisType === 'health') {
        const timeline = await TimelineEvent.find({ incidentId: incident._id });
        analysis = {
          summary: incident.aiSummary,
          rootCause: incident.aiRootCause,
          updateCount: incident.updates.length,
          responderCount: incident.responders.length,
          timelineLength: timeline.length
        };
      }
      
      analyses.push({
        incidentId: incident._id,
        title: incident.title,
        analysis
      });
    }
    
    res.json({
      success: true,
      data: {
        totalAnalyzed: analyses.length,
        analysisType,
        analyses,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Bulk analyze error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze incidents'
    });
  }
}

// Get AI confidence score for analysis
async getAnalysisConfidence(req, res) {
  try {
    const { id } = req.params;
    
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }
    
    const timeline = await TimelineEvent.find({ incidentId: id });
    const updatesCount = incident.updates.length;
    const responderCount = incident.responders.length;
    const hasTimeline = timeline.length > 0;
    const hasUpdates = updatesCount > 0;
    
    // Calculate confidence based on available data
    let confidenceScore = 0;
    
    if (hasTimeline) confidenceScore += 30;
    if (hasUpdates) confidenceScore += 25;
    if (responderCount > 0) confidenceScore += 20;
    if (incident.aiSummary) confidenceScore += 15;
    if (incident.resolvedAt) confidenceScore += 10;
    
    // Cap at 95
    confidenceScore = Math.min(confidenceScore, 95);
    
    let confidenceLevel = 'Medium';
    if (confidenceScore >= 80) confidenceLevel = 'High';
    else if (confidenceScore >= 50) confidenceLevel = 'Medium';
    else confidenceLevel = 'Low';
    
    const factors = {
      hasTimeline: { status: hasTimeline, weight: 30, contribution: hasTimeline ? 30 : 0 },
      hasUpdates: { status: hasUpdates, weight: 25, contribution: hasUpdates ? 25 : 0 },
      hasResponders: { status: responderCount > 0, weight: 20, contribution: responderCount > 0 ? 20 : 0 },
      hasAISummary: { status: !!incident.aiSummary, weight: 15, contribution: !!incident.aiSummary ? 15 : 0 },
      isResolved: { status: !!incident.resolvedAt, weight: 10, contribution: !!incident.resolvedAt ? 10 : 0 }
    };
    
    res.json({
      success: true,
      data: {
        incidentId: id,
        confidenceScore,
        confidenceLevel,
        factors,
        recommendations: confidenceScore < 70 ? [
          'Add more timeline events',
          'Increase update frequency',
          'Assign more responders',
          'Generate AI summary for better insights'
        ] : [],
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Get confidence score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate confidence score'
    });
  }
}

// Train AI model on custom data (admin only)
async trainAIModel(req, res) {
  try {
    const { trainingData, modelType = 'incident-pattern' } = req.body;
    
    // Check admin权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required for model training'
      });
    }
    
    if (!trainingData || !Array.isArray(trainingData)) {
      return res.status(400).json({
        success: false,
        message: 'Training data array is required'
      });
    }
    
    // Log training request (in production, you would actually train a model)
    console.log(`Training request received for model: ${modelType}`);
    console.log(`Training data size: ${trainingData.length} samples`);
    
    // Store training metadata
    const trainingMetadata = {
      modelType,
      samplesCount: trainingData.length,
      triggeredBy: req.user.id,
      triggeredAt: new Date(),
      status: 'queued'
    };
    
    await cacheService.set(`ai:training:${Date.now()}`, trainingMetadata, 86400);
    
    res.json({
      success: true,
      message: 'Training job queued successfully',
      data: {
        modelType,
        samplesCount: trainingData.length,
        estimatedCompletion: 'This is a mock response. In production, actual model training would occur.',
        trainingId: Date.now().toString()
      }
    });
  } catch (error) {
    console.error('Train AI model error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to queue training job'
    });
  }
}
}

module.exports = new AIController();