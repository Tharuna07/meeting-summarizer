// Mock services for demo purposes - no external API calls required
const fs = require('fs');

class MockTranscriptionService {
  async transcribeAudio(filePath) {
    try {
      console.log(`🎤 Mock transcription for: ${filePath}`);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return mock transcript based on file name or generate sample
      const sampleTranscripts = [
        `Meeting Transcript - Project Planning Session

John: Good morning everyone, thanks for joining today's project planning meeting. Let's start by reviewing our Q1 objectives.

Sarah: I've prepared the budget analysis. We're currently at 75% of our allocated budget with two months remaining.

Mike: The development team has completed the user authentication module. We're ahead of schedule on that front.

John: Excellent work Mike. Sarah, can you prepare a detailed budget breakdown for next week's stakeholder meeting?

Sarah: Absolutely, I'll have that ready by Friday.

Mike: We should also discuss the upcoming client presentation. I think we need to prepare some demo scenarios.

John: Good point. Let's schedule a follow-up meeting for next Tuesday to go through the presentation materials.

Sarah: I'll send out calendar invites once we confirm the time.

Mike: Sounds good. Also, I wanted to mention that we might need additional resources for the mobile app development phase.

John: Let's discuss resource allocation in our next planning session. Sarah, can you look into our contractor options?

Sarah: I'll research available contractors and get back to you with options and pricing.

Mike: Perfect. I think that covers everything for today.

John: Great meeting everyone. Let's reconvene next Tuesday at 2 PM.`,

        `Team Standup Meeting - Sprint Review

Alice: Morning team! Let's go through yesterday's accomplishments and today's priorities.

Bob: I completed the database migration script and tested it on staging. All tests are passing.

Carol: I finished the UI mockups for the new dashboard. They're ready for review in Figma.

Dave: I worked on the API documentation and updated the Swagger specs.

Alice: Great progress everyone. Bob, can you deploy the migration to production today?

Bob: Yes, I'll schedule the deployment for 3 PM when traffic is low.

Carol: I need feedback on the mockups before I start implementation. Can we schedule a design review?

Dave: I can review them this afternoon and provide feedback by end of day.

Alice: Perfect. For today's priorities, let's focus on the sprint goals.

Bob: I'll continue with the performance optimization tasks.

Carol: I'll start implementing the approved designs.

Dave: I'll work on the integration tests for the new features.

Alice: Any blockers or concerns?

Bob: The third-party API we're integrating has rate limiting. We might need to implement caching.

Carol: No blockers on my end.

Dave: Same here, everything looks good.

Alice: Alright team, let's make it a productive day!`
      ];

      // Pick a random transcript or use the first one
      const transcript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
      
      console.log(`✅ Mock transcription completed for: ${filePath}`);
      
      return {
        text: transcript,
        language: 'en-US',
        duration: Math.floor(Math.random() * 1800) + 600, // 10-40 minutes
        segments: [
          {
            text: transcript,
            confidence: 0.95,
            startTime: 0,
            endTime: 1800
          }
        ]
      };
    } catch (error) {
      console.error('❌ Mock transcription failed:', error.message);
      throw new Error(`Mock transcription failed: ${error.message}`);
    }
  }

  validateAudioFile(filePath) {
    const allowedExtensions = ['.mp3', '.mp4', '.m4a', '.wav', '.ogg'];
    const ext = require('path').extname(filePath).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Unsupported audio format: ${ext}`);
    }

    return true;
  }
}

class MockSummarizationService {
  async generateSummary(transcript) {
    try {
      console.log('📝 Generating mock summary...');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock summary based on transcript content
      const summary = this.generateMockSummary(transcript);
      const actionItems = this.extractMockActionItems(transcript);
      const decisions = this.extractMockDecisions(transcript);
      const keyTopics = this.extractMockKeyTopics(transcript);
      
      console.log('✅ Mock summary generation completed');
      
      return {
        summary: summary,
        keyDecisions: decisions,
        actionItems: actionItems,
        keyTopics: keyTopics,
        participants: this.extractMockParticipants(transcript),
        nextSteps: this.extractMockNextSteps(transcript)
      };
    } catch (error) {
      console.error('❌ Mock summarization failed:', error.message);
      throw new Error(`Mock summarization failed: ${error.message}`);
    }
  }

  generateMockSummary(transcript) {
    // Generate a contextual summary based on transcript content
    if (transcript.includes('budget') || transcript.includes('Q1')) {
      return `This was a project planning session focused on Q1 objectives and budget analysis. The team reviewed current progress, with development ahead of schedule on the authentication module. Key discussions included budget breakdown preparation for stakeholder meetings, upcoming client presentations, and resource allocation for mobile app development. The meeting concluded with action items for budget analysis and contractor research, with a follow-up meeting scheduled for next Tuesday.`;
    } else if (transcript.includes('sprint') || transcript.includes('standup')) {
      return `This sprint review meeting covered yesterday's accomplishments and today's priorities. The team made good progress on database migration, UI mockups, and API documentation. Key focus areas include production deployment scheduling, design review coordination, and addressing potential rate limiting issues with third-party APIs. The team is aligned on sprint goals and ready for productive development work.`;
    } else {
      return `This meeting covered important project updates and team coordination. Participants discussed progress on various initiatives, upcoming deadlines, and resource needs. Key decisions were made regarding timelines and responsibilities, with several action items assigned to team members. The meeting concluded with clear next steps and follow-up commitments.`;
    }
  }

  extractMockActionItems(transcript) {
    const actionItems = [];
    
    // Extract from transcript or generate based on content
    if (transcript.includes('prepare') && transcript.includes('budget')) {
      actionItems.push({
        text: 'Prepare detailed budget breakdown for stakeholder meeting',
        owner: 'Sarah',
        dueDate: '2024-10-18',
        priority: 'high'
      });
    }
    
    if (transcript.includes('research') && transcript.includes('contractor')) {
      actionItems.push({
        text: 'Research available contractors and pricing options',
        owner: 'Sarah',
        dueDate: '2024-10-20',
        priority: 'medium'
      });
    }
    
    if (transcript.includes('calendar') && transcript.includes('invite')) {
      actionItems.push({
        text: 'Send out calendar invites for follow-up meeting',
        owner: 'Sarah',
        dueDate: '2024-10-16',
        priority: 'high'
      });
    }
    
    if (transcript.includes('deploy') && transcript.includes('production')) {
      actionItems.push({
        text: 'Deploy database migration to production at 3 PM',
        owner: 'Bob',
        dueDate: '2024-10-15',
        priority: 'high'
      });
    }
    
    if (transcript.includes('review') && transcript.includes('mockup')) {
      actionItems.push({
        text: 'Review UI mockups and provide feedback',
        owner: 'Dave',
        dueDate: '2024-10-15',
        priority: 'medium'
      });
    }
    
    return actionItems;
  }

  extractMockDecisions(transcript) {
    const decisions = [];
    
    if (transcript.includes('Tuesday') && transcript.includes('2 PM')) {
      decisions.push('Schedule follow-up meeting for next Tuesday at 2 PM');
    }
    
    if (transcript.includes('Friday')) {
      decisions.push('Budget breakdown to be completed by Friday');
    }
    
    if (transcript.includes('3 PM')) {
      decisions.push('Production deployment scheduled for 3 PM');
    }
    
    if (transcript.includes('stakeholder')) {
      decisions.push('Proceed with stakeholder meeting preparation');
    }
    
    return decisions;
  }

  extractMockKeyTopics(transcript) {
    const topics = [];
    
    if (transcript.includes('budget')) topics.push('Budget');
    if (transcript.includes('project')) topics.push('Project Planning');
    if (transcript.includes('development')) topics.push('Development');
    if (transcript.includes('presentation')) topics.push('Client Presentation');
    if (transcript.includes('sprint')) topics.push('Sprint Review');
    if (transcript.includes('database')) topics.push('Database');
    if (transcript.includes('UI') || transcript.includes('mockup')) topics.push('UI/UX');
    if (transcript.includes('API')) topics.push('API Development');
    
    return topics;
  }

  extractMockParticipants(transcript) {
    // Extract names from transcript
    const names = [];
    const namePattern = /([A-Z][a-z]+):/g;
    let match;
    
    while ((match = namePattern.exec(transcript)) !== null) {
      const name = match[1];
      if (!names.includes(name)) {
        names.push(name);
      }
    }
    
    return names.length > 0 ? names : ['John', 'Sarah', 'Mike'];
  }

  extractMockNextSteps(transcript) {
    const nextSteps = [];
    
    if (transcript.includes('Tuesday')) {
      nextSteps.push('Follow-up meeting scheduled for next Tuesday');
    }
    
    if (transcript.includes('Friday')) {
      nextSteps.push('Budget analysis due Friday');
    }
    
    if (transcript.includes('stakeholder')) {
      nextSteps.push('Prepare for stakeholder meeting');
    }
    
    nextSteps.push('Continue with current sprint goals');
    nextSteps.push('Monitor project progress and blockers');
    
    return nextSteps;
  }
}

module.exports = {
  MockTranscriptionService: new MockTranscriptionService(),
  MockSummarizationService: new MockSummarizationService()
};
