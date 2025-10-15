const OpenAI = require('openai');

class SummarizationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateSummary(transcript) {
    try {
      console.log('📝 Generating meeting summary...');
      
      const prompt = this.createSummaryPrompt(transcript);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Cost-effective model
        messages: [
          {
            role: 'system',
            content: 'You are an expert meeting assistant. Your job is to analyze meeting transcripts and create comprehensive summaries with actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Balanced creativity and consistency
        max_tokens: 2000
      });

      const summaryText = response.choices[0].message.content;
      
      // Parse the structured response
      const parsedSummary = this.parseSummaryResponse(summaryText);
      
      console.log('✅ Summary generation completed');
      return parsedSummary;
    } catch (error) {
      console.error('❌ Summary generation failed:', error.message);
      throw new Error(`Summary generation failed: ${error.message}`);
    }
  }

  createSummaryPrompt(transcript) {
    return `
Please analyze the following meeting transcript and provide a comprehensive summary in the following JSON format:

{
  "summary": "A concise 2-3 paragraph overview of the meeting",
  "keyDecisions": ["List of important decisions made during the meeting"],
  "actionItems": [
    {
      "text": "Description of the action item",
      "owner": "Person responsible (if mentioned)",
      "dueDate": "Due date if mentioned (YYYY-MM-DD format or null)",
      "priority": "high/medium/low"
    }
  ],
  "keyTopics": ["Main topics discussed"],
  "participants": ["List of participants mentioned"],
  "nextSteps": ["Follow-up actions or next meeting topics"]
}

Meeting Transcript:
${transcript}

Please ensure the response is valid JSON and focuses on actionable insights and clear decisions.`;
  }

  parseSummaryResponse(summaryText) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: create a structured response from text
      return {
        summary: summaryText,
        keyDecisions: [],
        actionItems: [],
        keyTopics: [],
        participants: [],
        nextSteps: []
      };
    } catch (error) {
      console.error('Error parsing summary response:', error);
      return {
        summary: summaryText,
        keyDecisions: [],
        actionItems: [],
        keyTopics: [],
        participants: [],
        nextSteps: []
      };
    }
  }

  // Helper method to extract action items from text
  extractActionItems(text) {
    const actionItems = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.match(/^\d+\.|^[-*]|^(action|task|todo|follow-up)/i)) {
        actionItems.push({
          text: trimmedLine.replace(/^\d+\.\s*|^[-*]\s*/, ''),
          owner: null,
          dueDate: null,
          priority: 'medium'
        });
      }
    }
    
    return actionItems;
  }
}

module.exports = new SummarizationService();
