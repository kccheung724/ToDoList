const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getGroups, findGroupById, createGroup, updateGroup, deleteGroup } = require('../utils/storage');

// Get all groups
router.get('/', auth, async (req, res) => {
  try {
    const groups = await getGroups();
    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await findGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create group
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const group = await createGroup({
      name,
      description,
      members: members || [],
      createdBy: req.user.userId
    });
    res.status(201).json(group);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update group
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (members !== undefined) updates.members = members;
    const group = await updateGroup(req.params.id, updates);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete group
router.delete('/:id', auth, async (req, res) => {
  try {
    const success = await deleteGroup(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json({ message: 'Group deleted' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
