import { useState } from 'react'
import { Plus, Trash2, Users, UserPlus, UserMinus, Edit2, X, Check } from 'lucide-react'
import { useGroups } from '../hooks/useGroups'
import { useUsers } from '../hooks/useUsers'

function GroupManagement() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingGroup, setEditingGroup] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const { groups, addGroup, updateGroup, deleteGroup, addMemberToGroup, removeMemberFromGroup } = useGroups()
  const { users } = useUsers()

  const handleAddGroup = (e) => {
    e.preventDefault()
    if (name.trim()) {
      addGroup({ name, description })
      setName('')
      setDescription('')
    }
  }

  const startEditGroup = (group) => {
    setEditingGroup(group._id || group.id)
    setEditName(group.name || '')
    setEditDescription(group.description || '')
  }

  const cancelEditGroup = () => {
    setEditingGroup(null)
    setEditName('')
    setEditDescription('')
  }

  const saveEditGroup = async (groupId) => {
    if (editName.trim()) {
      await updateGroup(groupId, { name: editName, description: editDescription })
      setEditingGroup(null)
      setEditName('')
      setEditDescription('')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Group Management</h2>
        <p className="text-muted">Manage user groups and memberships</p>
      </div>

      {/* Add Group Form */}
      <div className="bg-surface rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Add New Group</h3>
        <form onSubmit={handleAddGroup} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Group description (optional)"
            rows="2"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-primary to-accent px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Add Group
          </button>
        </form>
      </div>

      {/* Groups List */}
      <div className="bg-surface rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Groups ({groups.length})</h3>
        {groups.length === 0 ? (
          <p className="text-muted text-center py-8">No groups yet. Create your first group!</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group._id || group.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  {editingGroup === (group._id || group.id) ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                        placeholder="Group name"
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                        placeholder="Description (optional)"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold flex items-center gap-2">
                        <Users size={18} className="text-primary" />
                        {group.name}
                      </h4>
                      {group.description && (
                        <p className="text-sm text-muted mt-1">{group.description}</p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {editingGroup === (group._id || group.id) ? (
                      <>
                        <button
                          onClick={() => saveEditGroup(group._id || group.id)}
                          className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-all"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={cancelEditGroup}
                          className="p-2 text-gray-400 hover:bg-gray-600 rounded-lg transition-all"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditGroup(group)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => deleteGroup(group._id || group.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Members */}
                <div className="mt-4">
                  <h5 className="text-sm font-semibold mb-2">Members ({group.members?.length || 0})</h5>
                  {(!group.members || group.members.length === 0) ? (
                    <p className="text-sm text-muted">No members yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {group.members.map((memberId) => {
                        const member = users.find(u => u.id == memberId || u._id == memberId)
                        if (!member) return null
                        return (
                          <div
                            key={memberId}
                            className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2"
                          >
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm">{member.name}</span>
                            <button
                              onClick={() => removeMemberFromGroup(group._id || group.id, memberId)}
                              className="p-1 text-red-400 hover:text-red-300"
                            >
                              <UserMinus size={14} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Add Member Dropdown */}
                  <div className="mt-3">
                    <select
                      onChange={(e) => {
                        const selectedValue = e.target.value
                        if (selectedValue) {
                          addMemberToGroup(group._id || group.id, selectedValue)
                          e.target.value = ''
                        }
                      }}
                      value=""
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="">Add member...</option>
                      {users
                        .filter(user => !(group.members || []).some(m => m == (user._id || user.id)))
                        .map(user => (
                          <option key={user._id || user.id} value={user._id || user.id}>{user.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GroupManagement
