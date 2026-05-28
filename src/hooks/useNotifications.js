import { useState, useEffect } from 'react'
import { useGroups } from './useGroups'

export function useNotifications(currentUser, todos) {
  const { getUserGroups, groups } = useGroups()
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications')
    if (saved) {
      return JSON.parse(saved)
    }
    return []
  })

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  useEffect(() => {
    if (!currentUser || !todos) return

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Get user's groups
    const userIds = [currentUser.id, currentUser._id].filter(Boolean)
    const userGroups = userIds.flatMap(id => getUserGroups(id))
    const groupIds = userGroups.flatMap(g => [g._id, g.id].filter(Boolean))

    // Check if user can see task (direct assignment or group)
    const canSeeTask = (todo) => {
      const directAssignment = todo.assignedTo == currentUser.id || todo.assignedBy == currentUser.id
      const groupAssignment = todo.assignedGroup && groupIds.includes(todo.assignedGroup)
      return directAssignment || groupAssignment
    }

    // Check for new tasks assigned to current user or their group
    const newTasks = todos.filter(todo => 
      canSeeTask(todo) &&
      todo.assignedBy != currentUser.id &&
      !notifications.some(n => n.type === 'new_task' && n.taskId == todo.id)
    )

    newTasks.forEach(task => {
      addNotification({
        id: Date.now() + Math.random(),
        type: 'new_task',
        taskId: task.id,
        title: 'New Task Assigned',
        message: `You have been assigned "${task.title}"`,
        createdAt: new Date().toISOString(),
        read: false
      })
    })

    // Check for tasks due today
    const todayTasks = todos.filter(todo => {
      if (!todo.dueDate || todo.completed) return false
      const dueDate = new Date(todo.dueDate)
      return dueDate.toDateString() === today.toDateString() &&
             canSeeTask(todo) &&
             !notifications.some(n => n.type === 'due_today' && n.taskId == todo.id)
    })

    todayTasks.forEach(task => {
      addNotification({
        id: Date.now() + Math.random(),
        type: 'due_today',
        taskId: task.id,
        title: 'Task Due Today',
        message: `"${task.title}" is due today`,
        createdAt: new Date().toISOString(),
        read: false
      })
    })

    // Check for tasks completed by assignee (current user assigned these tasks to others)
    const completedByAssignee = todos.filter(todo =>
      todo.completed &&
      todo.assignedBy == currentUser.id &&
      todo.assignedTo != currentUser.id &&
      !notifications.some(n => n.type === 'completed_by_assignee' && n.taskId == todo.id)
    )

    completedByAssignee.forEach(task => {
      addNotification({
        id: Date.now() + Math.random(),
        type: 'completed_by_assignee',
        taskId: task.id,
        title: 'Task Completed',
        message: `"${task.title}" has been completed`,
        createdAt: new Date().toISOString(),
        read: false
      })
    })

  }, [currentUser, todos])

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev])
  }

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  }
}
