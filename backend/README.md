# ToDoList Backend API

Node.js + Express backend with JSON file storage for the ToDoList application.

## Features

- RESTful API for todos, users, and groups
- JWT authentication
- Role-based access control (admin/user)
- File attachment support (base64 encoded)
- JSON file storage (no database required)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Copy `.env` file (already created)
- Update the following if needed:
  - `PORT`: Server port (default: 5000)
  - `JWT_SECRET`: Secret key for JWT tokens (change in production!)

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

**Note:** On first run, the backend will create a `data` directory with JSON files for storing users, todos, and groups.

## API Endpoints

### Authentication

#### Register
```
POST /api/auth/register
Body: { name, email, password, role (optional) }
Response: { token, user }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { id, name, email, role, avatar }
```

### Users (Admin Only)

#### Get All Users
```
GET /api/users
Headers: Authorization: Bearer <token>
Response: [User objects]
```

#### Get User by ID
```
GET /api/users/:id
Headers: Authorization: Bearer <token>
Response: User object
```

#### Update User
```
PUT /api/users/:id
Headers: Authorization: Bearer <token>
Body: { name, email, role }
Response: Updated User object
```

#### Delete User
```
DELETE /api/users/:id
Headers: Authorization: Bearer <token>
Response: { message }
```

### Groups

#### Get All Groups
```
GET /api/groups
Headers: Authorization: Bearer <token>
Response: [Group objects]
```

#### Get Group by ID
```
GET /api/groups/:id
Headers: Authorization: Bearer <token>
Response: Group object
```

#### Create Group
```
POST /api/groups
Headers: Authorization: Bearer <token>
Body: { name, description, members (array of user IDs) }
Response: Created Group object
```

#### Update Group
```
PUT /api/groups/:id
Headers: Authorization: Bearer <token>
Body: { name, description, members }
Response: Updated Group object
```

#### Delete Group
```
DELETE /api/groups/:id
Headers: Authorization: Bearer <token>
Response: { message }
```

### Todos

#### Get All Todos
```
GET /api/todos
Headers: Authorization: Bearer <token>
Response: [Todo objects] (only todos assigned to or created by user)
```

#### Get Todo by ID
```
GET /api/todos/:id
Headers: Authorization: Bearer <token>
Response: Todo object
```

#### Create Todo
```
POST /api/todos
Headers: Authorization: Bearer <token>
Body: { title, description, remarks, priority, dueDate, assignedTo, assignedGroup, attachments }
Response: Created Todo object
```

#### Update Todo
```
PUT /api/todos/:id
Headers: Authorization: Bearer <token>
Body: { title, description, remarks, priority, dueDate, assignedTo, assignedGroup, attachments, completed, completionRemarks }
Response: Updated Todo object
```

#### Toggle Todo Completion
```
PATCH /api/todos/:id/toggle
Headers: Authorization: Bearer <token>
Response: Updated Todo object
```

#### Add Attachment
```
POST /api/todos/:id/attachment
Headers: Authorization: Bearer <token>
Body: { name, type, size, data (base64), category }
Response: Updated Todo object
```

#### Delete Attachment
```
DELETE /api/todos/:id/attachment/:attachmentId
Headers: Authorization: Bearer <token>
Response: Updated Todo object
```

#### Delete Todo
```
DELETE /api/todos/:id
Headers: Authorization: Bearer <token>
Response: { message }
```

## Data Storage

Data is stored in JSON files in the `data` directory:
- `users.json` - User accounts
- `todos.json` - Todo items
- `groups.json` - Group definitions

### Data Models

### User
```javascript
{
  _id: String,
  id: String,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'user',
  avatar: String (URL),
  createdAt: String (ISO date)
}
```

### Todo
```javascript
{
  _id: String,
  id: String,
  title: String,
  description: String,
  remarks: String,
  priority: 'low' | 'medium' | 'high',
  status: 'pending' | 'completed',
  completed: Boolean,
  dueDate: String (ISO date),
  assignedTo: String (user ID),
  assignedBy: String (user ID),
  assignedGroup: String (group ID),
  attachments: [{
    id: String,
    name: String,
    type: String,
    size: Number,
    data: String (base64),
    category: 'photo' | 'file'
  }],
  completionRemarks: String,
  createdAt: String (ISO date),
  updatedAt: String (ISO date)
}
```

### Group
```javascript
{
  _id: String,
  id: String,
  name: String,
  description: String,
  members: [String] (array of user IDs),
  createdBy: String (user ID),
  createdAt: String (ISO date)
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Tokens expire after 7 days.

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

Error responses include a message field:
```json
{
  "message": "Error description"
}
```

## Development

The backend uses:
- Express.js for the web framework
- JSON file storage (no database)
- bcryptjs for password hashing
- jsonwebtoken for JWT authentication
- cors for CORS support
- dotenv for environment variables

## Default Admin Account

After first login registration, you can create an admin account by setting `role: 'admin'` during registration.
