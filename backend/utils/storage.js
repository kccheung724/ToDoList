const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Helper to read JSON file
async function readJsonFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    if (!data.trim()) {
      console.error(`Empty file: ${filename}`);
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    if (error instanceof SyntaxError) {
      console.error(`Invalid JSON in ${filename}:`, error.message);
      // Backup corrupted file and return empty array
      try {
        const backupPath = filePath + '.backup.' + Date.now();
        await fs.copyFile(filePath, backupPath);
        console.error(`Backed up corrupted file to: ${backupPath}`);
      } catch (backupError) {
        console.error('Failed to backup corrupted file:', backupError);
      }
      return [];
    }
    throw error;
  }
}

// Helper to write JSON file
async function writeJsonFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString);
    console.log(`Successfully wrote ${filename} (${jsonString.length} bytes)`);
  } catch (error) {
    console.error(`Failed to write ${filename}:`, error.message);
    throw error;
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// User storage functions
async function getUsers() {
  await ensureDataDir();
  return await readJsonFile('users.json');
}

async function saveUsers(users) {
  await ensureDataDir();
  await writeJsonFile('users.json', users);
}

async function findUserByEmail(email) {
  const users = await getUsers();
  return users.find(u => u.email === email);
}

async function findUserById(id) {
  const users = await getUsers();
  return users.find(u => u.id === id || u._id === id);
}

async function createUser(userData) {
  const users = await getUsers();
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const newUser = {
    _id: generateId(),
    id: generateId(),
    name: userData.name,
    email: userData.email,
    emailAddress: userData.emailAddress || '',
    password: hashedPassword,
    role: userData.role || 'user',
    group: userData.group || '',
    avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  await saveUsers(users);
  
  // Return user without password
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

async function updateUser(id, updates) {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === id || u._id === id);
  
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  await saveUsers(users);
  
  const { password, ...userWithoutPassword } = users[index];
  return userWithoutPassword;
}

async function deleteUser(id) {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === id || u._id === id);
  
  if (index === -1) return false;
  
  users.splice(index, 1);
  await saveUsers(users);
  return true;
}

// Todo storage functions
async function getTodos() {
  await ensureDataDir();
  return await readJsonFile('todos.json');
}

async function saveTodos(todos) {
  await ensureDataDir();
  await writeJsonFile('todos.json', todos);
}

async function findTodoById(id) {
  const todos = await getTodos();
  return todos.find(t => t.id === id || t._id === id);
}

async function createTodo(todoData) {
  const todos = await getTodos();
  
  const newTodo = {
    _id: generateId(),
    id: generateId(),
    ...todoData,
    completed: todoData.completed || false,
    attachments: todoData.attachments || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  todos.push(newTodo);
  await saveTodos(todos);
  return newTodo;
}

async function updateTodo(id, updates) {
  console.log('updateTodo called for id:', id);
  const todos = await getTodos();
  console.log('Loaded', todos.length, 'todos');
  
  const index = todos.findIndex(t => t.id === id || t._id === id);
  console.log('Found todo at index:', index);
  
  if (index === -1) {
    console.log('Todo not found for id:', id);
    return null;
  }
  
  todos[index] = { 
    ...todos[index], 
    ...updates, 
    updatedAt: new Date().toISOString() 
  };
  
  console.log('Saving updated todo:', todos[index]._id, 'completed:', todos[index].completed);
  await saveTodos(todos);
  console.log('Save completed successfully');
  return todos[index];
}

async function deleteTodo(id) {
  const todos = await getTodos();
  const index = todos.findIndex(t => t.id === id || t._id === id);
  
  if (index === -1) return false;
  
  todos.splice(index, 1);
  await saveTodos(todos);
  return true;
}

async function getTodosByUserId(userId) {
  const todos = await getTodos();
  return todos.filter(t => 
    t.assignedTo === userId || t.createdBy === userId
  );
}

// Group storage functions
async function getGroups() {
  await ensureDataDir();
  return await readJsonFile('groups.json');
}

async function saveGroups(groups) {
  await ensureDataDir();
  await writeJsonFile('groups.json', groups);
}

async function findGroupById(id) {
  const groups = await getGroups();
  return groups.find(g => g.id === id || g._id === id);
}

async function createGroup(groupData) {
  const groups = await getGroups();
  
  const newGroup = {
    _id: generateId(),
    id: generateId(),
    ...groupData,
    members: groupData.members || [],
    createdAt: new Date().toISOString()
  };
  
  groups.push(newGroup);
  await saveGroups(groups);
  return newGroup;
}

async function updateGroup(id, updates) {
  const groups = await getGroups();
  const index = groups.findIndex(g => g.id == id || g._id == id);
  
  if (index === -1) return null;
  
  groups[index] = { ...groups[index], ...updates };
  await saveGroups(groups);
  return groups[index];
}

async function deleteGroup(id) {
  const groups = await getGroups();
  const index = groups.findIndex(g => g.id === id || g._id === id);
  
  if (index === -1) return false;
  
  groups.splice(index, 1);
  await saveGroups(groups);
  return true;
}

async function getGroupsByUserId(userId) {
  const groups = await getGroups();
  return groups.filter(g => 
    g.members.includes(userId) || g.createdBy === userId
  );
}

// Initialize default admin account
async function initDefaultAdmin() {
  await ensureDataDir();
  const users = await getUsers();
  
  // Check if admin already exists
  const adminExists = users.find(u => u.role === 'admin');
  if (adminExists) {
    console.log('Admin account already exists');
    return;
  }
  
  // Create default admin
  const hashedPassword = await bcrypt.hash('123456', 10);
  const adminUser = {
    _id: generateId(),
    id: generateId(),
    name: 'Admin',
    email: 'admin',
    password: hashedPassword,
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=random',
    createdAt: new Date().toISOString()
  };
  
  users.push(adminUser);
  await saveUsers(users);
  console.log('Default admin account created (admin / 123456)');
}

module.exports = {
  generateId,
  initDefaultAdmin,
  // User functions
  getUsers,
  saveUsers,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
  // Todo functions
  getTodos,
  saveTodos,
  findTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodosByUserId,
  // Group functions
  getGroups,
  saveGroups,
  findGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupsByUserId
};
