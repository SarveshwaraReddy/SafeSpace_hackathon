const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
      return;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // Use gemini-2.5-flash model for text generation
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      this.isInitialized = true;
      console.log('✅ Gemini AI service initialized');
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
    }
  }

  async generateContent(prompt, options = {}) {
    if (!this.isInitialized) {
      console.warn('Gemini AI not initialized');
      return null;
    }

    try {
      const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 1000,
        topP: options.topP || 0.9,
        topK: options.topK || 40,
      };

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return null;
    }
  }

  async generateIncidentSummary(incident) {
    try {
      const prompt = `
        Analyze this production incident and provide:
        1. A concise summary (2-3 sentences)
        2. Possible root causes (list top 3)
        3. Recommended immediate actions
        
        Incident Details:
        - Title: ${incident.title}
        - Description: ${incident.description}
        - Severity: ${incident.severity}
        - Affected Services: ${incident.affectedServices ? incident.affectedServices.join(', ') : 'Not specified'}
        
        Format your response as JSON with keys: summary, rootCauses, actions
      `;
      
      const response = await this.generateContent(prompt, {
        temperature: 0.7,
        maxTokens: 500
      });
      
      if (!response) return null;
      
      // Parse JSON response or extract text
      let result;
      try {
        // Try to parse as JSON
        result = JSON.parse(response);
      } catch {
        // If not JSON, extract sections
        const lines = response.split('\n');
        result = {
          summary: lines.find(l => l.includes('summary') || l.includes('Summary')) || response.substring(0, 200),
          rootCauses: lines.filter(l => l.includes('root') || l.includes('cause')),
          actions: lines.filter(l => l.includes('action') || l.includes('recommend'))
        };
      }
      
      // Update incident with AI insights
      incident.aiSummary = result.summary || response.substring(0, 300);
      incident.aiRootCause = Array.isArray(result.rootCauses) ? result.rootCauses.join('\n') : result.rootCauses;
      await incident.save();
      
      return { 
        summary: incident.aiSummary, 
        rootCauses: incident.aiRootCause 
      };
    } catch (error) {
      console.error('Gemini summary generation error:', error);
      return null;
    }
  }

  async analyzeIncidentTimeline(incident, timeline) {
    try {
      const prompt = `
        Analyze this incident timeline and provide:
        1. Time to detect
        2. Time to resolve
        3. Bottlenecks identified
        4. Recommendations for future improvements
        
        Incident: ${incident.title}
        Severity: ${incident.severity}
        Timeline events:
        ${timeline.map(t => `- ${t.eventType}: ${t.description} at ${t.timestamp}`).join('\n')}
        
        Provide a structured analysis.
      `;
      
      const response = await this.generateContent(prompt, {
        temperature: 0.5,
        maxTokens: 800
      });
      
      return response;
    } catch (error) {
      console.error('Gemini timeline analysis error:', error);
      return null;
    }
  }

  async generatePostmortem(incident, timeline, resolution) {
    try {
      const prompt = `
        Generate a comprehensive postmortem report for this incident.
        
        Incident Details:
        Title: ${incident.title}
        Description: ${incident.description}
        Severity: ${incident.severity}
        Duration: ${incident.createdAt} to ${incident.resolvedAt || 'Ongoing'}
        Affected Services: ${incident.affectedServices ? incident.affectedServices.join(', ') : 'Not specified'}
        
        Timeline:
        ${timeline.map(t => `- ${t.timestamp}: ${t.description}`).join('\n')}
        
        Resolution: ${resolution}
        
        Please include:
        1. Executive Summary
        2. Timeline of Events
        3. Root Cause Analysis
        4. Impact Assessment
        5. Action Items
        
        Format the response in markdown.
      `;
      
      const response = await this.generateContent(prompt, {
        temperature: 0.5,
        maxTokens: 1500
      });
      
      return response;
    } catch (error) {
      console.error('Gemini postmortem generation error:', error);
      return null;
    }
  }

  async getRootCauseAnalysis(incident, timeline) {
    try {
      const prompt = `
        Analyze this incident and identify:
        1. Most likely root cause
        2. Contributing factors
        3. Patterns or anomalies detected
        4. Similar past incidents (if any)
        
        Incident: ${incident.title}
        Description: ${incident.description}
        Timeline events: ${timeline.length} events recorded
        
        Provide a detailed root cause analysis.
      `;
      
      const response = await this.generateContent(prompt, {
        temperature: 0.3,
        maxTokens: 1000
      });
      
      return response;
    } catch (error) {
      console.error('Gemini root cause analysis error:', error);
      return null;
    }
  }

  async predictIncidents(historicalData) {
    try {
      const prompt = `
        Based on this historical incident data, predict future incidents:
        
        Historical Data:
        Total Incidents: ${historicalData.total}
        By Severity: ${JSON.stringify(historicalData.bySeverity)}
        By Service: ${JSON.stringify(historicalData.byService)}
        Time Range: Last ${historicalData.days} days
        
        Provide:
        1. Most at-risk services
        2. Expected incident count in next 7 days
        3. Preventive recommendations
        
        Format as JSON.
      `;
      
      const response = await this.generateContent(prompt, {
        temperature: 0.6,
        maxTokens: 800
      });
      
      return response;
    } catch (error) {
      console.error('Gemini prediction error:', error);
      return null;
    }
  }

  async chatWithAI(incident, question, conversationHistory = []) {
    try {
      const prompt = `
        You are an AI assistant helping with a production incident.
        
        Incident Context:
        Title: ${incident.title}
        Description: ${incident.description}
        Severity: ${incident.severity}
        Status: ${incident.status}
        Current Updates: ${incident.updates ? incident.updates.length : 0} updates recorded
        Affected Services: ${incident.affectedServices ? incident.affectedServices.join(', ') : 'None'}
        
        AI Summary (if available): ${incident.aiSummary || 'Not available'}
        AI Root Cause (if available): ${incident.aiRootCause || 'Not available'}
        
        Previous conversation:
        ${conversationHistory.map(h => `${h.role}: ${h.content}`).join('\n')}
        
        User Question: ${question}
        
        Provide a helpful, accurate response based on the incident context. Be specific and actionable.
      `;
      
      const response = await this.generateContent(prompt, {
        temperature: 0.7,
        maxTokens: 1000
      });
      
      return response || "I'm having trouble analyzing the incident right now. Please try again later.";
    } catch (error) {
      console.error('Gemini chat error:', error);
      return "I'm having trouble analyzing the incident right now. Please try again later.";
    }
  }

  async analyzeAnomaly(currentRate, baselineRate, timeRange) {
    try {
      const prompt = `
        Analyze this anomaly in incident rate:
        
        Current Rate: ${currentRate} incidents per ${timeRange}
        Baseline Rate: ${baselineRate.toFixed(2)} incidents per day
        
        Provide:
        1. Severity assessment (Low/Medium/High/Critical)
        2. Possible causes
        3. Recommended investigation steps
        4. Immediate actions to take
        
        Format as a structured response.
      `;
      
      const response = await this.generateContent(prompt, {
        temperature: 0.4,
        maxTokens: 500
      });
      
      return response;
    } catch (error) {
      console.error('Gemini anomaly analysis error:', error);
      return null;
    }
  }

  async generateRecommendations(incident) {
    try {
      const prompt = `
        Generate incident response recommendations for:
        
        Incident: ${incident.title}
        Severity: ${incident.severity}
        Status: ${incident.status}
        Affected Services: ${incident.affectedServices ? incident.affectedServices.join(', ') : 'Not specified'}
        Description: ${incident.description}
        
        Provide:
        1. Immediate actions (next 30 minutes)
        2. Short-term fixes (next 2 hours)
        3. Long-term preventive measures
        4. Communication strategy
        
        Be specific and actionable.
      `;
      
      const response = await this.generateContent(prompt, {
        temperature: 0.6,
        maxTokens: 800
      });
      
      return response;
    } catch (error) {
      console.error('Gemini recommendations error:', error);
      return null;
    }
  }

  async generateHealthScore(incident, metrics) {
    try {
      const prompt = `
        Calculate a health score for this incident response:
        
        Metrics:
        - Time to detect: ${metrics.timeToDetect} minutes
        - Update frequency: ${metrics.updateFrequency} updates/hour
        - Responder count: ${metrics.responderCount}
        - Has timeline: ${metrics.hasTimeline}
        - Has AI analysis: ${metrics.hasAI}
        - Incident age: ${metrics.incidentAge} minutes
        - Total updates: ${metrics.totalUpdates}
        
        Provide:
        1. Health score (0-100)
        2. Risk level (Low/Medium/High/Critical)
        3. Response effectiveness rating
        4. Specific improvement suggestions
        
        Return as JSON.
      `;
      
      const response = await this.generateContent(prompt, {
        temperature: 0.3,
        maxTokens: 400
      });
      
      return response;
    } catch (error) {
      console.error('Gemini health score error:', error);
      return null;
    }
  }

  async findSimilarIncidents(currentIncident, similarIncidents) {
    try {
      const prompt = `
        Compare the current incident with similar past incidents and provide insights.
        
        Current Incident:
        Title: ${currentIncident.title}
        Description: ${currentIncident.description}
        Severity: ${currentIncident.severity}
        Affected Services: ${currentIncident.affectedServices ? currentIncident.affectedServices.join(', ') : 'Not specified'}
        
        Similar Past Incidents:
        ${similarIncidents.map((incident, index) => `
          Incident ${index + 1}:
          - Title: ${incident.title}
          - Severity: ${incident.severity}
          - Status: ${incident.status}
          - Resolution Time: ${incident.resolutionTime || 'N/A'} minutes
        `).join('\n')}
        
        Please provide:
        1. Common patterns between these incidents
        2. Successful resolution strategies from past incidents
        3. Estimated resolution time based on similar incidents
        4. Recommended actions for the current incident
        
        Format as JSON with keys: patterns, strategies, estimatedTime, recommendations
      `;
      
      const response = await this.generateContent(prompt, {
        temperature: 0.3,
        maxTokens: 800
      });
      
      return response;
    } catch (error) {
      console.error('Gemini find similar incidents error:', error);
      return null;
    }
  }

  async bulkAnalyze(incidents, analysisType) {
    try {
      const prompt = `
        Analyze these ${incidents.length} incidents and provide insights:
        
        ${incidents.map((incident, i) => `
          Incident ${i + 1}:
          - Title: ${incident.title}
          - Severity: ${incident.severity}
          - Status: ${incident.status}
          - Affected Services: ${incident.affectedServices ? incident.affectedServices.join(', ') : 'None'}
        `).join('\n')}
        
        Analysis Type: ${analysisType}
        
        Provide:
        1. Common patterns and trends
        2. Systemic issues identified
        3. Recommendations for prevention
        4. Priority areas for improvement
        
        Format as JSON.
      `;
      
      const response = await this.generateContent(prompt, {
        temperature: 0.4,
        maxTokens: 1000
      });
      
      return response;
    } catch (error) {
      console.error('Gemini bulk analyze error:', error);
      return null;
    }
  }

  async generateDashboardInsights(metrics) {
    try {
      const prompt = `
        Generate operational insights based on these metrics:
        
        Total Incidents: ${metrics.totalIncidents}
        Active Incidents: ${metrics.activeIncidents}
        Resolved Today: ${metrics.resolvedToday}
        Critical Incidents: ${metrics.criticalIncidents}
        Average Resolution Time: ${metrics.averageResolutionTime} minutes
        Top Services: ${metrics.topServices.join(', ')}
        
        Provide:
        1. Key insights about system reliability
        2. Top 3 recommendations for improvement
        3. Services that need immediate attention
        4. Team performance insights
        
        Format as JSON with keys: insights, recommendations, servicesToWatch, performanceNotes
      `;
      
      const response = await this.generateContent(prompt, {
        temperature: 0.4,
        maxTokens: 800
      });
      
      return response;
    } catch (error) {
      console.error('Gemini dashboard insights error:', error);
      return null;
    }
  }
}

module.exports = new AIService();