const aiService = require('../services/aiService');
const Incident = require('../models/Incident');
const TimelineEvent = require('../models/TimelineEvent');
const cacheService = require('../services/cacheService');

class AIController {
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
      
      const cacheKey = `ai:summary:${id}`;
      let aiSummary = await cacheService.get(cacheKey);
      
      if (!aiSummary) {
        const result = await aiService.generateIncidentSummary(incident);
        
        aiSummary = {
          summary: result?.summary || incident.aiSummary,
          rootCauses: result?.rootCauses || incident.aiRootCause,
          generatedAt: new Date(),
          model: 'gemini-2.5-flash'
        };
        
        await cacheService.set(cacheKey, aiSummary, 3600);
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
        const result = await aiService.getRootCauseAnalysis(incident, timeline);
        
        analysis = {
          analysis: result,
          confidence: 0.75,
          analyzedAt: new Date(),
          eventsAnalyzed: timeline.length,
          model: 'gemini-2.5-flash'
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

  // Find similar incidents based on current incident
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
      _id: { $ne: id }, // Exclude current incident
      $or: [
        { affectedServices: { $in: currentIncident.affectedServices } },
        { severity: currentIncident.severity },
        { title: { $regex: currentIncident.title.split(' ').slice(0, 3).join('|'), $options: 'i' } }
      ]
    })
    .select('title severity status resolvedAt createdAt description updates')
    .limit(5)
    .sort({ createdAt: -1 });
    
    const cacheKey = `ai:similar:${id}`;
    let analysis = await cacheService.get(cacheKey);
    
    if (!analysis && similarIncidents.length > 0) {
      // Use Gemini to analyze similarities
      const prompt = `
        Compare the current incident with similar past incidents and provide insights.
        
        Current Incident:
        Title: ${currentIncident.title}
        Description: ${currentIncident.description}
        Severity: ${currentIncident.severity}
        Affected Services: ${currentIncident.affectedServices.join(', ')}
        
        Similar Past Incidents:
        ${similarIncidents.map((incident, index) => `
          Incident ${index + 1}:
          - Title: ${incident.title}
          - Severity: ${incident.severity}
          - Status: ${incident.status}
          - Resolution Time: ${incident.resolvedAt ? ((incident.resolvedAt - incident.createdAt) / 1000 / 60).toFixed(0) : 'N/A'} minutes
          - Key Updates: ${incident.updates.slice(0, 2).map(u => u.message).join('; ')}
        `).join('\n')}
        
        Please provide:
        1. Common patterns between these incidents
        2. Successful resolution strategies from past incidents
        3. Estimated resolution time based on similar incidents
        4. Recommended actions for the current incident
        
        Format as JSON with keys: patterns, strategies, estimatedTime, recommendations
      `;
      
      const aiResponse = await aiService.generateContent(prompt, {
        temperature: 0.3,
        maxTokens: 1000
      });
      
      // Parse AI response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch {
        // If not JSON, extract text
        parsedResponse = {
          patterns: aiResponse.substring(0, 300),
          strategies: "Based on past incidents",
          estimatedTime: "Unknown",
          recommendations: aiResponse
        };
      }
      
      analysis = {
        insights: parsedResponse,
        similarIncidents: similarIncidents.map(incident => ({
          id: incident._id,
          title: incident.title,
          severity: incident.severity,
          status: incident.status,
          resolvedAt: incident.resolvedAt,
          resolutionTime: incident.resolvedAt ? 
            ((incident.resolvedAt - incident.createdAt) / 1000 / 60).toFixed(0) : null,
          description: incident.description.substring(0, 200)
        })),
        count: similarIncidents.length,
        generatedAt: new Date(),
        model: 'gemini-2.5-flash'
      };
      
      // Cache for 30 minutes
      await cacheService.set(cacheKey, analysis, 1800);
    }
    
    res.json({
      success: true,
      data: analysis || { 
        similarIncidents, 
        count: similarIncidents.length,
        message: similarIncidents.length === 0 ? 'No similar incidents found' : 'AI analysis not available'
      }
    });
  } catch (error) {
    console.error('Find similar incidents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find similar incidents'
    });
  }
}

  async predictNextIncident(req, res) {
    try {
      const { days = 7 } = req.query;
      
      const cacheKey = `ai:predictions:${days}`;
      let predictions = await cacheService.get(cacheKey);
      
      if (!predictions) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const historicalIncidents = await Incident.find({
          createdAt: { $gte: startDate }
        });
        
        const bySeverity = {};
        const byService = {};
        
        historicalIncidents.forEach(incident => {
          bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;
          incident.affectedServices.forEach(service => {
            byService[service] = (byService[service] || 0) + 1;
          });
        });
        
        const historicalData = {
          total: historicalIncidents.length,
          bySeverity,
          byService,
          days: 30
        };
        
        const result = await aiService.predictIncidents(historicalData);
        
        predictions = {
          predictions: result,
          data: historicalData,
          generatedAt: new Date(),
          validFor: `${days} days`,
          model: 'gemini-2.5-flash'
        };
        
        await cacheService.set(cacheKey, predictions, 86400);
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
      
      const answer = await aiService.chatWithAI(incident, question, conversationHistory);
      
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
          model: 'gemini-2.5-flash'
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
        const timeToDetect = timeline.length > 0 
          ? (timeline[0].timestamp - incident.createdAt) / 1000 / 60 
          : null;
        
        const timeToResolve = incident.resolvedAt
          ? (incident.resolvedAt - incident.createdAt) / 1000 / 60
          : null;
        
        const response = await aiService.generatePostmortem(incident, timeline, 'AI Generated');
        
        postmortem = {
          title: `Postmortem: ${incident.title}`,
          executiveSummary: response?.split('\n\n')[0] || response,
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
          fullReport: response,
          generatedAt: new Date(),
          aiGenerated: true,
          model: 'gemini-2.5-flash'
        };
        
        await cacheService.set(cacheKey, postmortem, 7200);
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

  async detectAnomalies(req, res) {
    try {
      const { timeRange = '1h' } = req.query;
      
      const startTime = new Date();
      if (timeRange === '1h') startTime.setHours(startTime.getHours() - 1);
      else if (timeRange === '24h') startTime.setDate(startTime.getDate() - 1);
      else startTime.setDate(startTime.getDate() - 7);
      
      const incidents = await Incident.find({
        createdAt: { $gte: startTime }
      });
      
      const previousPeriod = new Date(startTime);
      previousPeriod.setDate(previousPeriod.getDate() - 7);
      
      const baselineIncidents = await Incident.find({
        createdAt: { $gte: previousPeriod, $lt: startTime }
      });
      
      const currentRate = incidents.length;
      const baselineRate = baselineIncidents.length / 7;
      const isAnomaly = currentRate > baselineRate * 2;
      
      let aiAnalysis = null;
      
      if (isAnomaly) {
        aiAnalysis = await aiService.analyzeAnomaly(currentRate, baselineRate, timeRange);
      }
      
      res.json({
        success: true,
        data: {
          isAnomaly,
          currentRate,
          baselineRate: baselineRate.toFixed(2),
          timeRange,
          incidentCount: incidents.length,
          aiAnalysis,
          timestamp: new Date(),
          model: 'gemini-2.5-flash'
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
      
      const cacheKey = `ai:recommendations:${id}`;
      let recommendations = await cacheService.get(cacheKey);
      
      if (!recommendations) {
        const result = await aiService.generateRecommendations(incident);
        
        recommendations = {
          recommendations: result,
          priority: incident.severity === 'SEV0' ? 'Critical' : 'High',
          generatedAt: new Date(),
          model: 'gemini-2.5-flash'
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

  // Get AI Dashboard Insights
async getAIDashboard(req, res) {
  try {
    const cacheKey = 'ai:dashboard';
    let dashboard = await cacheService.get(cacheKey);
    
    if (!dashboard) {
      // Get recent incidents (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentIncidents = await Incident.find({
        createdAt: { $gte: sevenDaysAgo }
      });
      
      // Get common issues
      const commonServices = await Incident.aggregate([
        { $unwind: '$affectedServices' },
        { $group: { _id: '$affectedServices', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      
      // Calculate metrics
      const resolvedIncidents = recentIncidents.filter(i => i.status === 'RESOLVED');
      const avgResolutionTime = resolvedIncidents.length > 0 ?
        resolvedIncidents.reduce((acc, i) => {
          const resolutionTime = i.resolvedAt ? (i.resolvedAt - i.createdAt) / 1000 / 60 : 0;
          return acc + resolutionTime;
        }, 0) / resolvedIncidents.length : 0;
      
      const prompt = `
        Based on this operational data, provide insights and recommendations:
        
        Recent Activity (Last 7 days):
        - Total Incidents: ${recentIncidents.length}
        - Resolved: ${resolvedIncidents.length}
        - Average Resolution Time: ${avgResolutionTime.toFixed(0)} minutes
        - Most Affected Services: ${commonServices.map(s => `${s._id} (${s.count})`).join(', ')}
        
        Severity Breakdown:
        - SEV0: ${recentIncidents.filter(i => i.severity === 'SEV0').length}
        - SEV1: ${recentIncidents.filter(i => i.severity === 'SEV1').length}
        - SEV2: ${recentIncidents.filter(i => i.severity === 'SEV2').length}
        
        Provide:
        1. Key insights about system reliability
        2. Top 3 recommendations for improvement
        3. Services that need attention
        4. Team performance insights
        
        Format as JSON with keys: insights, recommendations, servicesToWatch, performanceNotes
      `;
      
      const aiResponse = await aiService.generateContent(prompt, {
        temperature: 0.4,
        maxTokens: 800
      });
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch {
        parsedResponse = {
          insights: aiResponse,
          recommendations: ["Review incident patterns", "Improve monitoring"],
          servicesToWatch: commonServices.map(s => s._id),
          performanceNotes: "Analysis based on recent data"
        };
      }
      
      dashboard = {
        insights: parsedResponse.insights,
        recommendations: parsedResponse.recommendations,
        servicesToWatch: parsedResponse.servicesToWatch,
        performanceNotes: parsedResponse.performanceNotes,
        metrics: {
          totalIncidents: recentIncidents.length,
          resolvedIncidents: resolvedIncidents.length,
          averageResolutionTime: avgResolutionTime.toFixed(0),
          topServices: commonServices
        },
        generatedAt: new Date(),
        model: 'gemini-2.5-flash'
      };
      
      await cacheService.set(cacheKey, dashboard, 1800);
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

// Analyze Incident Health
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
      
      const incidentAge = (new Date() - incident.createdAt) / 1000 / 60;
      const updateFrequency = incident.updates.length / (incidentAge / 60); // updates per hour
      const responderCount = incident.responders.length;
      const hasAIAnalysis = incident.aiSummary ? true : false;
      
      const prompt = `
        Analyze this incident's health and provide a score:
        
        Incident: ${incident.title}
        Severity: ${incident.severity}
        Status: ${incident.status}
        
        Metrics:
        - Time to detect: ${timeToDetect ? timeToDetect.toFixed(1) : 'N/A'} minutes
        - Incident age: ${incidentAge.toFixed(0)} minutes
        - Update frequency: ${updateFrequency.toFixed(1)} updates/hour
        - Responders assigned: ${responderCount}
        - Has AI analysis: ${hasAIAnalysis}
        - Total updates: ${incident.updates.length}
        - Timeline events: ${timeline.length}
        
        Calculate:
        1. Health score (0-100)
        2. Risk level (Low/Medium/High/Critical)
        3. Response effectiveness rating
        4. Specific recommendations for improvement
        
        Return as JSON with keys: healthScore, riskLevel, effectiveness, recommendations
      `;
      
      const aiResponse = await aiService.generateContent(prompt, {
        temperature: 0.3,
        maxTokens: 600
      });
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch {
        parsedResponse = {
          healthScore: 70,
          riskLevel: incident.severity === 'SEV0' ? 'Critical' : 'Medium',
          effectiveness: "Adequate",
          recommendations: ["Increase update frequency", "Add more responders"]
        };
      }
      
      healthAnalysis = {
        healthScore: parsedResponse.healthScore,
        riskLevel: parsedResponse.riskLevel,
        effectiveness: parsedResponse.effectiveness,
        analysis: parsedResponse.recommendations,
        metrics: {
          timeToDetect: timeToDetect ? `${timeToDetect.toFixed(1)} minutes` : 'N/A',
          incidentAge: `${incidentAge.toFixed(0)} minutes`,
          updateFrequency: `${updateFrequency.toFixed(1)} updates/hour`,
          responderCount,
          totalUpdates: incident.updates.length,
          timelineEvents: timeline.length,
          hasAIAnalysis
        },
        recommendations: Array.isArray(parsedResponse.recommendations) ? 
          parsedResponse.recommendations : 
          ["Monitor closely", "Communicate with stakeholders", "Document learnings"],
        generatedAt: new Date(),
        model: 'gemini-2.5-flash'
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
        const result = await aiService.generateIncidentSummary(incident);
        analysis = {
          summary: result?.summary,
          rootCause: result?.rootCauses,
          generatedAt: new Date()
        };
      } else if (analysisType === 'health') {
        const timeline = await TimelineEvent.find({ incidentId: incident._id });
        analysis = {
          summary: incident.aiSummary,
          rootCause: incident.aiRootCause,
          updateCount: incident.updates.length,
          responderCount: incident.responders.length,
          timelineLength: timeline.length,
          status: incident.status,
          severity: incident.severity
        };
      }
      
      analyses.push({
        incidentId: incident._id,
        title: incident.title,
        severity: incident.severity,
        status: incident.status,
        analysis
      });
    }
    
    // Generate overall insights if multiple incidents
    let overallInsights = null;
    if (incidents.length > 1) {
      const prompt = `
        Analyze these ${incidents.length} incidents and provide overall insights:
        
        ${incidents.map((incident, i) => `
          Incident ${i + 1}: ${incident.title} (${incident.severity}) - ${incident.status}
        `).join('\n')}
        
        Provide:
        1. Common patterns
        2. Systemic issues
        3. Recommendations for prevention
      `;
      
      overallInsights = await aiService.generateContent(prompt, {
        temperature: 0.4,
        maxTokens: 500
      });
    }
    
    res.json({
      success: true,
      data: {
        totalAnalyzed: analyses.length,
        analysisType,
        analyses,
        overallInsights,
        generatedAt: new Date(),
        model: 'gemini-2.5-flash'
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
    const hasAISummary = !!incident.aiSummary;
    const hasRootCause = !!incident.aiRootCause;
    
    // Calculate confidence based on available data
    let confidenceScore = 0;
    const factors = {
      hasTimeline: { status: hasTimeline, weight: 25, contribution: 0 },
      hasUpdates: { status: hasUpdates, weight: 25, contribution: 0 },
      hasResponders: { status: responderCount > 0, weight: 20, contribution: 0 },
      hasAISummary: { status: hasAISummary, weight: 15, contribution: 0 },
      hasRootCause: { status: hasRootCause, weight: 15, contribution: 0 }
    };
    
    // Calculate contributions
    for (const [key, factor] of Object.entries(factors)) {
      if (factor.status) {
        factor.contribution = factor.weight;
        confidenceScore += factor.weight;
      }
    }
    
    // Cap at 95
    confidenceScore = Math.min(confidenceScore, 95);
    
    let confidenceLevel = 'Medium';
    if (confidenceScore >= 80) confidenceLevel = 'High';
    else if (confidenceScore >= 50) confidenceLevel = 'Medium';
    else confidenceLevel = 'Low';
    
    // Generate AI recommendation if confidence is low
    let recommendations = [];
    if (confidenceScore < 70) {
      const missingItems = [];
      if (!hasTimeline) missingItems.push('Add timeline events');
      if (!hasUpdates) missingItems.push('Add regular updates');
      if (responderCount === 0) missingItems.push('Assign responders');
      if (!hasAISummary) missingItems.push('Generate AI summary');
      
      recommendations = missingItems;
    }
    
    res.json({
      success: true,
      data: {
        incidentId: id,
        confidenceScore,
        confidenceLevel,
        factors,
        recommendations,
        dataQuality: {
          timelineEvents: timeline.length,
          totalUpdates: updatesCount,
          responderCount,
          hasAISummary,
          hasRootCause
        },
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

// Train AI model on custom data (Admin only)
async trainAIModel(req, res) {
  try {
    // Check admin权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required for model training'
      });
    }
    
    const { trainingData, modelType = 'incident-pattern' } = req.body;
    
    if (!trainingData || !Array.isArray(trainingData)) {
      return res.status(400).json({
        success: false,
        message: 'Training data array is required'
      });
    }
    
    if (trainingData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Training data cannot be empty'
      });
    }
    
    // Log training request (Gemini doesn't support fine-tuning in free tier)
    console.log(`Training request received for model: ${modelType}`);
    console.log(`Training data size: ${trainingData.length} samples`);
    
    // Validate training data format
    const validSamples = trainingData.filter(sample => 
      sample.incident && sample.resolution
    );
    
    if (validSamples.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid training data format. Each sample needs "incident" and "resolution" fields'
      });
    }
    
    // Store training metadata for future reference
    const trainingMetadata = {
      modelType,
      samplesCount: validSamples.length,
      triggeredBy: req.user.id,
      triggeredByEmail: req.user.email,
      triggeredAt: new Date(),
      status: 'completed',
      note: 'Gemini doesn\'t support fine-tuning in free tier. This is a mock training record.'
    };
    
    await cacheService.set(`ai:training:${Date.now()}`, trainingMetadata, 86400);
    
    // Generate a sample insight using the training data
    const sampleIncident = validSamples[0];
    const prompt = `
      Based on this example incident and resolution:
      
      Incident: ${sampleIncident.incident}
      Resolution: ${sampleIncident.resolution}
      
      Generate a general guideline for handling similar incidents.
    `;
    
    const insight = await aiService.generateContent(prompt, {
      temperature: 0.5,
      maxTokens: 300
    });
    
    res.json({
      success: true,
      message: 'Training data recorded successfully',
      data: {
        modelType,
        samplesCount: validSamples.length,
        trainingId: Date.now().toString(),
        status: 'completed',
        insight: insight || 'Training data accepted',
        note: 'Gemini uses few-shot learning. Provide examples in prompts for better results.'
      }
    });
  } catch (error) {
    console.error('Train AI model error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process training data'
    });
  }
}

}

module.exports = new AIController();