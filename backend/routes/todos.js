const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getTodos, findTodoById, createTodo, updateTodo, deleteTodo } = require('../utils/storage');

// Get all todos for current user
router.get('/', auth, async (req, res) => {
  try {
    const allTodos = await getTodos();
    const userId = req.user.id; // Use id not _id for consistency with frontend
    console.log('Fetching todos for user:', userId, 'Total todos:', allTodos.length);
    const todos = allTodos.filter(t => {
      const match = t.assignedTo == userId || t.assignedBy == userId;
      if (match) console.log('Matched todo:', t._id, 'assignedTo:', t.assignedTo, 'assignedBy:', t.assignedBy);
      return match;
    });
    console.log('Returning todos:', todos.length);
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
    const { title, description, remarks, priority, dueDate, assignedTo, assignedGroup, attachments } = req.body;
    
    console.log('Creating todo:', { title, assignedTo, assignedBy: req.user.id });
    
    const todo = await createTodo({
      title,
      description,
      remarks,
      priority,
      dueDate,
      assignedTo,
      assignedGroup,
      attachments,
      assignedBy: req.user.id // Use id not _id for consistency
    });
    
    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update todo
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, remarks, priority, dueDate, assignedTo, assignedGroup, attachments, completed, completionRemarks } = req.body;
    const todo = await updateTodo(req.params.id, { 
      title, 
      description, 
      remarks, 
      priority, 
      dueDate, 
      assignedTo, 
      assignedGroup, 
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
    const todo = await findTodoById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    const updatedTodo = await updateTodo(req.params.id, {
      completed: !todo.completed,
      completedAt: !todo.completed ? new Date().toISOString() : null
    });
    
    res.json(updatedTodo);
  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({ message: 'Server error' });
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
