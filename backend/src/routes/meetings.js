const express = require('express');
const Meeting = require('../models/Meeting');
const { getQueueStats } = require('../workers/queue');

const router = express.Router();

// GET /api/meetings - Get all meetings
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    
    const meetings = await Meeting.find(query)
      .sort({ uploadDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Meeting.countDocuments(query);
    
    res.json({
      meetings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/meetings/:id - Get specific meeting
router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    res.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/meetings/:id/action-items/:actionId - Update action item
router.put('/:id/action-items/:actionId', async (req, res) => {
  try {
    const { completed, text } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    const actionItem = meeting.actionItems.id(req.params.actionId);
    if (!actionItem) {
      return res.status(404).json({ message: 'Action item not found' });
    }
    
    if (completed !== undefined) actionItem.completed = completed;
    if (text !== undefined) actionItem.text = text;
    
    await meeting.save();
    res.json(meeting);
  } catch (error) {
    console.error('Error updating action item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/meetings/:id/action-items - Add new action item
router.post('/:id/action-items', async (req, res) => {
  try {
    const { text, owner, dueDate } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    meeting.actionItems.push({
      text,
      owner,
      dueDate: dueDate ? new Date(dueDate) : null
    });
    
    await meeting.save();
    res.json(meeting);
  } catch (error) {
    console.error('Error adding action item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/meetings/:id - Delete meeting
router.delete('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Clean up audio file if it exists
    if (meeting.audioPath) {
      const fs = require('fs');
      try {
        fs.unlinkSync(meeting.audioPath);
      } catch (error) {
        console.warn('Could not delete audio file:', error.message);
      }
    }
    
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/meetings/stats/queue - Get queue statistics
router.get('/stats/queue', async (req, res) => {
  try {
    const stats = await getQueueStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
