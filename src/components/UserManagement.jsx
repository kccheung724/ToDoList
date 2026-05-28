import { useState, useEffect } from 'react'
import { Plus, Trash2, User, UserCheck, Mail, Shield, Lock, Edit2, X, Users } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import { useGroups } from '../hooks/useGroups'

function UserManagement() {
  const { users, currentUser, addUser, updateUser, deleteUser, setCurrentUserById, setCurrentUser, isAdmin, refreshUsers, error, loading } = useUsers()
  const { groups } = useGroups()
  const [addError, setAddError] = useState('')
  
  // Edit modal state
  const [editingUser, setEditingUser] = useState(null)
  const [editName, setEditName] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState('user')
  const [editGroup, setEditGroup] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editError, setEditError] = useState('')

  // Refresh users from localStorage on mount
  useEffect(() => {
    refreshUsers()
  }, [])

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [group, setGroup] = useState('')

  const handleAddUser = async (e) => {
    e.preventDefault()
    setAddError('')
    if (name.trim()) {
      try {
        await addUser({ name, email: username, emailAddress, password, role, group })
        setName('')
        setUsername('')
        setEmailAddress('')
        setPassword('')
        setRole('user')
        setGroup('')
      } catch (err) {
        setAddError(err.message || 'Failed to add user')
      }
    }
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setEditName(user.name)
    setEditUsername(user.email || '')
    setEditEmail(user.emailAddress || '')
    setEditRole(user.role)
    setEditGroup(user.group || '')
    setEditPassword('')
    setEditError('')
  }

  const closeEditModal = () => {
    setEditingUser(null)
    setEditName('')
    setEditUsername('')
    setEditEmail('')
    setEditRole('user')
    setEditGroup('')
    setEditPassword('')
    setEditError('')
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    setEditError('')
    try {
      const updates = {
        name: editName,
        email: editUsername,
        emailAddress: editEmail,
        role: editRole,
        group: editGroup
      }
      if (editPassword.trim()) {
        updates.password = editPassword
      }
      await updateUser(editingUser._id || editingUser.id, updates)
      closeEditModal()
    } catch (err) {
      setEditError(err.message || 'Failed to update user')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">User Management</h2>
        <p className="text-muted">Manage users and set current user</p>
      </div>

      {/* Current User */}
      {currentUser ? (
        <div className="bg-surface rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserCheck size={20} className="text-green-400" />
            Current User
          </h3>
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <p className="text-lg font-semibold">{currentUser.name}</p>
              {currentUser.email && <p className="text-sm text-muted">{currentUser.email}</p>}
              {(() => {
                const userGroups = groups.filter(g => 
                  g.members && g.members.some(m => m == currentUser._id || m == currentUser.id)
                )
                if (userGroups.length > 0) {
                  return (
                    <p className="text-sm text-muted flex items-center gap-1">
                      <Users size={12} />
                      {userGroups.map(g => g.name).join(', ')}
                    </p>
                  )
                }
                return null
              })()}
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className="ml-auto px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Switch User
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">No Current User</h3>
          <p className="text-muted">Select a user from the list below to set as current user</p>
        </div>
      )}

      {/* Add User Form - Only visible to admin */}
      {isAdmin() && (
      <div className="bg-surface rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Add New User</h3>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username (required for login)"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <div className="flex gap-4">
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Email Address (optional)"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            >
              <option value="user">User</option>
              {isAdmin() && <option value="admin">Administrator</option>}
            </select>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">No Group</option>
              {groups.map((g) => (
                <option key={g._id || g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>
          {addError && (
            <div className="text-red-400 text-sm text-center">{addError}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={20} />
            {loading ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>
      )}

      {/* All Users List */}
      <div className="bg-surface rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Users ({users.length})</h3>
        </div>
        {users.length === 0 ? (
          <p className="text-muted text-center py-8">No users yet. Add your first user!</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user._id || user.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  currentUser?.id === (user._id || user.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{user.name}</p>
                    {user.role === 'admin' && (
                      <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        <Shield size={10} />
                        Admin
                      </span>
                    )}
                  </div>
                  {user.email && (
                    <p className="text-sm text-muted flex items-center gap-1">
                      <Mail size={12} />
                      {user.email}
                    </p>
                  )}
                  {(() => {
                    const userGroups = groups.filter(g => 
                      g.members && g.members.some(m => m == user._id || m == user.id)
                    )
                    if (userGroups.length > 0) {
                      return (
                        <p className="text-sm text-muted flex items-center gap-1">
                          <Users size={12} />
                          {userGroups.map(g => g.name).join(', ')}
                        </p>
                      )
                    }
                    return null
                  })()}
                </div>
                {isAdmin() && (
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                )}
                {isAdmin() && currentUser?.id !== (user._id || user.id) && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                        deleteUser(user._id || user.id)
                      }
                    }}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl p-6 border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Edit User</h3>
              <button
                onClick={closeEditModal}
                className="p-1 text-muted hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-muted mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-muted mb-1">Group</label>
                  <select
                    value={editGroup}
                    onChange={(e) => setEditGroup(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">No Group</option>
                    {groups.map((g) => (
                      <option key={g._id || g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {editError && (
                <div className="text-red-400 text-sm">{editError}</div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
