import { useState, useEffect } from 'react'
import { authAPI, usersAPI, getToken, setToken, removeToken } from '../services/api'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load current user from token on mount
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const token = getToken()
        if (token) {
          const data = await authAPI.getCurrentUser()
          setCurrentUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            avatar: data.avatar
          })
        }
      } catch (error) {
        console.error('Failed to load current user:', error)
        removeToken()
      }
    }
    loadCurrentUser()
  }, [])

  // Load users list
  const refreshUsers = async () => {
    if (!currentUser) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await usersAPI.getAll()
      setUsers(data)
    } catch (error) {
      setError(error.message)
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load users when current user is set
  useEffect(() => {
    if (currentUser) {
      refreshUsers()
    }
  }, [currentUser])

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authAPI.login(email, password)
      setCurrentUser(data.user)
      return true
    } catch (error) {
      setError(error.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authAPI.logout()
    setCurrentUser(null)
    setUsers([])
  }

  const addUser = async (user) => {
    setLoading(true)
    setError(null)
    try {
      const data = await usersAPI.create(user)
      await refreshUsers()
      return data.user
    } catch (error) {
      setError(error.message)
      console.error('Failed to add user:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await usersAPI.update(id, updates)
      await refreshUsers()
      if (currentUser?.id === id) {
        setCurrentUser({
          ...currentUser,
          ...updates
        })
      }
      return data
    } catch (error) {
      setError(error.message)
      console.error('Failed to update user:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await usersAPI.delete(id)
      await refreshUsers()
      if (currentUser?.id === id) {
        logout()
      }
      return true
    } catch (error) {
      setError(error.message)
      console.error('Failed to delete user:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = () => {
    return currentUser?.role === 'admin'
  }

  const setCurrentUserById = (id) => {
    const user = users.find(u => u.id === id)
    setCurrentUser(user)
  }

  return {
    users,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    login,
    logout,
    setCurrentUserById,
    setCurrentUser,
    isAdmin,
    refreshUsers,
    loading,
    error
  }
}
