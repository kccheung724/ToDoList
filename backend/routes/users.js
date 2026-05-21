const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { auth, adminAuth } = require('../middleware/auth');
const { getUsers, findUserById, updateUser, deleteUser } = require('../utils/storage');

// Get all users (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const users = await getUsers();
    // Remove passwords from response
    const usersWithoutPasswords = users.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, emailAddress, role, group, password } = req.body;
    const updates = { name, email, role, group };
    
    // Add emailAddress if provided (separate from username/email login)
    if (emailAddress !== undefined) {
      updates.emailAddress = emailAddress;
    }
    
    // Hash password if provided
    if (password && password.trim()) {
      updates.password = await bcrypt.hash(password, 10);
    }
    
    const user = await updateUser(req.params.id, updates);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const success = await deleteUser(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
