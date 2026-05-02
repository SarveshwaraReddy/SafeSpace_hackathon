const OpenAI = require('openai');

class AIService {
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    } else {
      console.log('⚠️  OpenAI API key not found, AI features disabled');
      this.openai = null;
    }
  }

  async generateIncidentSummary(incident) {
    if (!this.openai) {
      console.log('AI service disabled, skipping incident summary generation');
      return null;
    }

    try {
      const prompt = `
        Analyze this production incident and provide:
        1. A concise summary (2-3 sentences)
        2. Possible root causes (list top 3)
        3. Recommended immediate actions
        
        Incident: ${incident.title}
        Description: ${incident.description}
        Severity: ${incident.severity}
        Affected Services: ${incident.affectedServices.join(', ')}
      `;
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert SRE incident analyst. Provide concise, actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      const response = completion.choices[0].message.content;
      
      // Parse AI response
      const summary = response.split('\n')[0];
      const rootCauses = response.match(/root causes?:?\s*(.*?)(?=\d\.|$)/is);
      
      // Update incident with AI insights
      incident.aiSummary = summary;
      incident.aiRootCause = rootCauses ? rootCauses[1] : 'Analysis in progress';
      await incident.save();
      
      return { summary, rootCauses: incident.aiRootCause };
    } catch (error) {
      console.error('AI summary generation error:', error);
      return null;
    }
  }

  async analyzeIncidentTimeline(incident, timeline) {
    if (!this.openai) {
      console.log('AI service disabled, skipping timeline analysis');
      return null;
    }

    try {
      const prompt = `
        Analyze this incident timeline and provide:
        1. Time to detect
        2. Time to resolve
        3. Bottlenecks identified
        4. Recommendations for future improvements
        
        Incident: ${incident.title}
        Timeline events: ${timeline.map(t => `${t.eventType}: ${t.description} at ${t.timestamp}`).join('\n')}
      `;
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an incident postmortem analyst. Provide data-driven insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('AI timeline analysis error:', error);
      return null;
    }
  }

  async generatePostmortem(incident, timeline, resolution) {
    if (!this.openai) {
      console.log('AI service disabled, skipping postmortem generation');
      return null;
    }

    try {
      const prompt = `
        Generate a comprehensive postmortem report for this incident including:
        
        1. Executive Summary
        2. Timeline of Events
        3. Root Cause Analysis
        4. Impact Assessment
        5. Action Items
        
        Incident Details:
        Title: ${incident.title}
        Description: ${incident.description}
        Severity: ${incident.severity}
        Duration: ${incident.createdAt} to ${incident.resolvedAt}
        Affected Services: ${incident.affectedServices.join(', ')}
        
        Timeline: ${timeline.map(t => `- ${t.timestamp}: ${t.description}`).join('\n')}
        
        Resolution: ${resolution}
      `;
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a technical writer generating detailed incident postmortems. Use a professional tone."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1500
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('AI postmortem generation error:', error);
      return null;
    }
  }
}

module.exports = new AIService();