const axios = require('axios');

class HuggingFaceSummarizationService {
  constructor() {
    // Hugging Face API endpoint for summarization
    this.apiUrl = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
    // You can get a free API token from https://huggingface.co/settings/tokens
    this.apiToken = process.env.HUGGINGFACE_API_TOKEN;
  }

  async generateSummary(transcript) {
    try {
      console.log('📝 Generating summary using Hugging Face...');
      
      // Split transcript into chunks if too long (Hugging Face has token limits)
      const chunks = this.splitIntoChunks(transcript, 1000); // ~1000 words per chunk
      const summaries = [];

      for (const chunk of chunks) {
        const summary = await this.summarizeChunk(chunk);
        summaries.push(summary);
      }

      // Combine summaries
      const combinedSummary = summaries.join(' ');
      
      // Extract action items and decisions using simple pattern matching
      const actionItems = this.extractActionItems(transcript);
      const decisions = this.extractDecisions(transcript);
      const keyTopics = this.extractKeyTopics(transcript);

      console.log('✅ Hugging Face summary generation completed');
      
      return {
        summary: combinedSummary,
        keyDecisions: decisions,
        actionItems: actionItems,
        keyTopics: keyTopics,
        participants: this.extractParticipants(transcript),
        nextSteps: this.extractNextSteps(transcript)
      };
    } catch (error) {
      console.error('❌ Hugging Face summarization failed:', error.message);
      
      // Fallback to simple text processing
      return this.fallbackSummarization(transcript);
    }
  }

  async summarizeChunk(text) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          inputs: text,
          parameters: {
            max_length: 150,
            min_length: 50,
            do_sample: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data[0].summary_text;
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      // Return a simple extract if API fails
      return text.split('.').slice(0, 3).join('.') + '...';
    }
  }

  splitIntoChunks(text, maxWords) {
    const words = text.split(' ');
    const chunks = [];
    
    for (let i = 0; i < words.length; i += maxWords) {
      chunks.push(words.slice(i, i + maxWords).join(' '));
    }
    
    return chunks;
  }

  extractActionItems(text) {
    const actionItems = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for common action item patterns
      if (trimmedLine.match(/^\d+\.|^[-*]|^(action|task|todo|follow-up|need to|will do)/i)) {
        actionItems.push({
          text: trimmedLine.replace(/^\d+\.\s*|^[-*]\s*/, ''),
          owner: this.extractOwner(trimmedLine),
          dueDate: this.extractDueDate(trimmedLine),
          priority: 'medium'
        });
      }
    }
    
    return actionItems.slice(0, 10); // Limit to 10 action items
  }

  extractDecisions(text) {
    const decisions = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for decision patterns
      if (trimmedLine.match(/(decided|agreed|concluded|resolved|determined|chose|selected)/i)) {
        decisions.push(trimmedLine);
      }
    }
    
    return decisions.slice(0, 5); // Limit to 5 decisions
  }

  extractKeyTopics(text) {
    // Simple keyword extraction - in production, you'd use NLP libraries
    const topics = [];
    const words = text.toLowerCase().split(/\s+/);
    const topicWords = ['project', 'budget', 'timeline', 'deadline', 'team', 'client', 'product', 'feature', 'bug', 'issue'];
    
    for (const word of topicWords) {
      if (words.includes(word)) {
        topics.push(word.charAt(0).toUpperCase() + word.slice(1));
      }
    }
    
    return [...new Set(topics)]; // Remove duplicates
  }

  extractParticipants(text) {
    // Simple participant extraction - look for names or roles
    const participants = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.match(/(says|said|speaking|here|present)/i)) {
        const nameMatch = line.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
        if (nameMatch) {
          participants.push(nameMatch[1]);
        }
      }
    }
    
    return [...new Set(participants)].slice(0, 10);
  }

  extractNextSteps(text) {
    const nextSteps = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.match(/(next|follow up|tomorrow|next week|next meeting)/i)) {
        nextSteps.push(trimmedLine);
      }
    }
    
    return nextSteps.slice(0, 5);
  }

  extractOwner(text) {
    // Look for names or roles in the text
    const nameMatch = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    return nameMatch ? nameMatch[1] : null;
  }

  extractDueDate(text) {
    // Look for date patterns
    const dateMatch = text.match(/(tomorrow|next week|next month|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i);
    return dateMatch ? dateMatch[1] : null;
  }

  fallbackSummarization(transcript) {
    // Simple fallback when external services fail
    const sentences = transcript.split('.').filter(s => s.trim().length > 10);
    const summary = sentences.slice(0, 5).join('. ') + '.';
    
    return {
      summary: summary,
      keyDecisions: this.extractDecisions(transcript),
      actionItems: this.extractActionItems(transcript),
      keyTopics: this.extractKeyTopics(transcript),
      participants: this.extractParticipants(transcript),
      nextSteps: this.extractNextSteps(transcript)
    };
  }
}

module.exports = new HuggingFaceSummarizationService();
