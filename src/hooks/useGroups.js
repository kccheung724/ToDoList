import { useState, useEffect } from 'react'
import { groupsAPI } from '../services/api'

export function useGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refreshGroups = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await groupsAPI.getAll()
      setGroups(data)
    } catch (error) {
      setError(error.message)
      console.error('Failed to load groups:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshGroups()
  }, [])

  const addGroup = async (group) => {
    setLoading(true)
    setError(null)
    try {
      const data = await groupsAPI.create(group)
      await refreshGroups()
      return data
    } catch (error) {
      setError(error.message)
      console.error('Failed to add group:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateGroup = async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await groupsAPI.update(id, updates)
      setGroups(groups.map(group => 
        group._id === id ? data : group
      ))
      return data
    } catch (error) {
      setError(error.message)
      console.error('Failed to update group:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteGroup = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await groupsAPI.delete(id)
      setGroups(groups.filter(group => group._id !== id))
    } catch (error) {
      setError(error.message)
      console.error('Failed to delete group:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const addMemberToGroup = async (groupId, userId) => {
    const group = groups.find(g => g._id == groupId || g.id == groupId)
    if (!group) return
    
    const currentMembers = group.members || []
    if (currentMembers.some(m => m == userId)) return // Already a member
    
    const updatedMembers = [...currentMembers, userId]
    await updateGroup(groupId, { members: updatedMembers })
  }

  const removeMemberFromGroup = async (groupId, userId) => {
    const group = groups.find(g => g._id == groupId || g.id == groupId)
    if (!group) return
    
    const updatedMembers = (group.members || []).filter(id => id != userId)
    await updateGroup(groupId, { members: updatedMembers })
  }

  return { groups, addGroup, updateGroup, deleteGroup, addMemberToGroup, removeMemberFromGroup, refreshGroups, loading, error }
}
