import { useState, useEffect } from 'react'
import { todosAPI } from '../services/api'

export function useTodos() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refreshTodos = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await todosAPI.getAll()
      setTodos(data)
    } catch (error) {
      setError(error.message)
      console.error('Failed to load todos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTodos()
  }, [])

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const addTodo = async (todo) => {
    setLoading(true)
    setError(null)
    try {
      let attachments = []
      
      if (todo.files && todo.files.length > 0) {
        for (const file of todo.files) {
          try {
            const base64 = await fileToBase64(file)
            attachments.push({
              id: Date.now() + Math.random(),
              name: file.name,
              type: file.type,
              size: file.size,
              data: base64,
              category: file.type.startsWith('image/') ? 'photo' : 'file'
            })
          } catch (error) {
            console.error('Error converting file to base64:', error)
          }
        }
      }

      const todoData = {
        title: todo.title,
        priority: todo.priority,
        dueDate: todo.dueDate,
        description: todo.description || '',
        remarks: todo.remarks || '',
        completed: false,
        attachments,
        assignedTo: todo.assignedTo || null,
        assignedGroup: todo.assignedGroup || null,
        assignedBy: todo.assignedBy || null
      }

      const data = await todosAPI.create(todoData)
      await refreshTodos()
      return data
    } catch (error) {
      setError(error.message)
      console.error('Failed to add todo:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const toggleTodo = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const data = await todosAPI.toggle(id)
      setTodos(todos.map(todo => 
        todo._id === id ? data : todo
      ))
    } catch (error) {
      setError(error.message)
      console.error('Failed to toggle todo:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateTodo = async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await todosAPI.update(id, updates)
      setTodos(todos.map(todo => 
        todo._id === id ? data : todo
      ))
      return data
    } catch (error) {
      setError(error.message)
      console.error('Failed to update todo:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteTodo = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await todosAPI.delete(id)
      setTodos(todos.filter(todo => todo._id !== id))
    } catch (error) {
      setError(error.message)
      console.error('Failed to delete todo:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteAttachment = async (todoId, attachmentId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await todosAPI.deleteAttachment(todoId, attachmentId)
      setTodos(todos.map(todo => 
        todo._id === todoId ? data : todo
      ))
    } catch (error) {
      setError(error.message)
      console.error('Failed to delete attachment:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const addAttachment = async (todoId, file) => {
    setLoading(true)
    setError(null)
    try {
      const base64 = await fileToBase64(file)
      const attachmentData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        category: file.type.startsWith('image/') ? 'photo' : 'file'
      }
      
      const data = await todosAPI.addAttachment(todoId, attachmentData)
      setTodos(todos.map(todo => 
        todo._id === todoId ? data : todo
      ))
    } catch (error) {
      setError(error.message)
      console.error('Failed to add attachment:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { todos, addTodo, toggleTodo, updateTodo, deleteTodo, deleteAttachment, addAttachment, refreshTodos, loading, error }
}
