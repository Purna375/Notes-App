const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { isAuthenticated } = require('../middleware/auth');

// Get all notes for the current user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    let query = { user: req.session.userId };
    
    // Filter by tag if provided
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    // Search by keyword if provided
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    const notes = await Note.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get single note
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    // Make sure user owns the note
    if (note.user.toString() !== req.session.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this note' });
    }
    
    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create a note
router.post('/', isAuthenticated, async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.session.userId;
    
    const note = await Note.create(req.body);
    
    res.status(201).json({
      success: true,
      data: note
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update a note
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    // Make sure user owns the note
    if (note.user.toString() !== req.session.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this note' });
    }
    
    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


// Delete a note
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    // Make sure user owns the note
    if (note.user.toString() !== req.session.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this note' });
    }
    
    await note.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
