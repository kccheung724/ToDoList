const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getTodos, findTodoById, createTodo, updateTodo, deleteTodo, getGroups, getUsers } = require('../utils/storage');

// Get all todos for current user
router.get('/', auth, async (req, res) => {
  try {
    const allTodos = await getTodos();
    const userId = req.user.id;
    const userGroups = await getGroups();
    const allUsers = await getUsers();
    
    // Find current user to get both id and _id
    const currentUser = allUsers.find(u => u.id == userId || u._id == userId);
    const userIds = [userId, currentUser?._id].filter(Boolean);
    
    // Get groups the user is a member of
    const memberOfGroups = userGroups.filter(g => 
      g.members && g.members.some(m => userIds.includes(m))
    );
    const groupIds = memberOfGroups.flatMap(g => [g._id, g.id].filter(Boolean));
    
    const todos = allTodos.filter(t => {
      const directMatch = t.assignedTo == userId || t.assignedBy == userId;
      
      // Handle new assignedGroups array format
      let groupMatch = false;
      if (t.assignedGroups) {
        if (t.assignedGroups.includes('all')) {
          // Task assigned to all groups - show to everyone
          groupMatch = true;
        } else {
          // Check if any of the task's assigned groups match user's groups
          groupMatch = t.assignedGroups.some(groupId => groupIds.includes(groupId));
        }
      } else if (t.assignedGroup) {
        // Handle old assignedGroup format for backward compatibility
        groupMatch = groupIds.includes(t.assignedGroup);
      }
      
      // If task is assigned to "all", show it to everyone regardless of group membership
      // Otherwise, require direct assignment or group membership
      if (t.assignedGroups && t.assignedGroups.includes('all')) {
        return true;
      }
      
      return directMatch || groupMatch;
    });
    res.json(todos);
  } catch (error) {
    console.error('Fetch todos error:', error);
    res.status(500).json({ message: 'Error fetching todos' });
  }
});

// Get todo by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const todo = await findTodoById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    // Check if user has access to this todo
    const userId = req.user.id;
    if (todo.assignedTo != userId && todo.assignedBy != userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(todo);
  } catch (error) {
    console.error('Fetch todo error:', error);
    res.status(500).json({ message: 'Error fetching todo' });
  }
});

// Create todo
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, remarks, priority, dueDate, assignedTo, assignedGroup, assignedGroups, attachments } = req.body;
    
    console.log('Creating todo - Full request body:', JSON.stringify(req.body, null, 2));
    console.log('Creating todo:', { title, description, priority, dueDate, assignedTo, assignedGroup, assignedGroups, assignedBy: req.user.id });
    
    // Validation: Ensure required fields are present
    if (!title || !description || !priority || !dueDate) {
      console.error('Missing required fields:', { title, description, priority, dueDate });
      return res.status(400).json({ 
        message: 'Missing required fields. Title, description, priority, and dueDate are required.' 
      });
    }
    
    // Support both old format (assignedGroup) and new format (assignedGroups)
    const finalAssignedGroups = assignedGroups || (assignedGroup ? [assignedGroup] : null);
    
    const todo = await createTodo({
      title,
      description,
      remarks,
      priority,
      dueDate,
      assignedTo,
      assignedGroups: finalAssignedGroups,
      // Keep assignedGroup for backward compatibility
      assignedGroup: assignedGroup || (assignedGroups && assignedGroups.length === 1 ? assignedGroups[0] : null),
      attachments,
      assignedBy: req.user.id // Use id not _id for consistency
    });
    
    console.log('Todo created:', JSON.stringify(todo, null, 2));
    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update todo
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, remarks, priority, dueDate, assignedTo, assignedGroup, assignedGroups, attachments, completed, completionRemarks } = req.body;
    
    // Support both old format (assignedGroup) and new format (assignedGroups)
    const finalAssignedGroups = assignedGroups || (assignedGroup ? [assignedGroup] : null);
    
    const todo = await updateTodo(req.params.id, { 
      title, 
      description, 
      remarks, 
      priority, 
      dueDate, 
      assignedTo, 
      assignedGroups: finalAssignedGroups,
      // Keep assignedGroup for backward compatibility
      assignedGroup: assignedGroup || (assignedGroups && assignedGroups.length === 1 ? assignedGroups[0] : null),
      attachments, 
      completed, 
      completionRemarks 
    });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle todo completion
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    console.log('Toggle todo called for id:', req.params.id);
    const todo = await findTodoById(req.params.id);
    if (!todo) {
      console.log('Todo not found for id:', req.params.id);
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    console.log('Found todo:', todo._id, 'current completed:', todo.completed);
    
    const newCompleted = !todo.completed;
    console.log('Setting completed to:', newCompleted);
    
    const updatedTodo = await updateTodo(req.params.id, {
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : null
    });
    
    if (!updatedTodo) {
      console.error('updateTodo returned null for id:', req.params.id);
      return res.status(404).json({ message: 'Todo not found after update' });
    }
    
    console.log('Updated todo:', updatedTodo._id, 'new completed:', updatedTodo.completed);
    res.json(updatedTodo);
  } catch (error) {
    console.error('Toggle todo error:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Add attachment
router.post('/:id/attachment', auth, async (req, res) => {
  try {
    const { name, type, size, data, category } = req.body;
    const todo = await findTodoById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    const newAttachments = [
      ...(todo.attachments || []),
      {
        id: Date.now().toString(),
        name,
        type,
        size,
        data,
        category
      }
    ];
    
    const updatedTodo = await updateTodo(req.params.id, { attachments: newAttachments });
    res.json(updatedTodo);
  } catch (error) {
    console.error('Add attachment error:', error);
    res.status(500).json({ message: 'Error adding attachment' });
  }
});

// Delete attachment from todo
router.delete('/:id/attachment/:attachmentId', auth, async (req, res) => {
  try {
    const todo = await findTodoById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    // Check if user is the creator
    if (todo.assignedBy != req.user.id) {
      return res.status(403).json({ message: 'Access denied. Only the creator can delete attachments.' });
    }
    
    const newAttachments = (todo.attachments || []).filter(
      a => a.id !== req.params.attachmentId
    );
    
    const updatedTodo = await updateTodo(req.params.id, { attachments: newAttachments });
    res.json(updatedTodo);
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ message: 'Error deleting attachment' });
  }
});

// Delete todo
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await findTodoById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    // Check if user is the creator
    if (todo.assignedBy != req.user.id) {
      return res.status(403).json({ message: 'Access denied. Only the creator can delete this todo.' });
    }
    
    await deleteTodo(req.params.id);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ message: 'Error deleting todo' });
  }
});

module.exports = router;
