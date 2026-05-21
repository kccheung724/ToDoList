# Todo List App with Calendar and Dashboard

A modern, feature-rich todo list application built with React, featuring a calendar view and comprehensive dashboard.

## Features

- **Dashboard**: Overview of tasks with statistics and completion rates
- **Calendar View**: Visual calendar showing tasks by date with color-coded indicators
- **Todo List**: Full CRUD functionality with priority levels and due dates
- **Data Persistence**: All tasks are saved to localStorage
- **Modern UI**: Beautiful dark theme with gradient accents and smooth animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Calendar** - Calendar component
- **date-fns** - Date manipulation
- **Lucide React** - Icons

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

### Dashboard
- View task statistics (total, completed, pending, high priority)
- Monitor completion rate with progress bar
- See recent tasks at a glance

### Calendar
- Navigate through months to view tasks
- Click on any date to see tasks scheduled for that day
- Color-coded dots indicate task status and priority

### Todo List
- Add new tasks with title, priority, and due date
- Mark tasks as complete by clicking the circle
- Filter tasks by status (all, active, completed)
- Delete tasks by hovering and clicking the trash icon
- Tasks are automatically sorted by priority and completion status

## Priority Levels

- **High** - Urgent tasks (red accent)
- **Medium** - Normal priority tasks (yellow accent)
- **Low** - Less urgent tasks (blue accent)

## Data Storage

All tasks are stored in the browser's localStorage, so your data persists between sessions.
