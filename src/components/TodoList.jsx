import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar, Filter, Paperclip, Image, FileText, X, User, Users, Clock, CheckCircle2 } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import { useGroups } from '../hooks/useGroups'

function TodoList({ initialFilter = 'all', todos = [], addTodo, toggleTodo, updateTodo, deleteTodo, deleteAttachment, refreshTodos }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [remarks, setRemarks] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [assignedGroups, setAssignedGroups] = useState([])
  const [assignToAllGroups, setAssignToAllGroups] = useState(false)
  const [files, setFiles] = useState([])
  const [filter, setFilter] = useState(initialFilter)
  const [expandedTodo, setExpandedTodo] = useState(null)
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [completionRemarks, setCompletionRemarks] = useState('')
  const [showCompletionRemarks, setShowCompletionRemarks] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPriority, setEditPriority] = useState('medium')
  const [editDueDate, setEditDueDate] = useState('')

  // Check if user can edit task (creator or admin)
  const canEditTask = (todo) => {
    return todo.assignedBy == currentUser?.id || currentUser?.role === 'admin'
  }

  const startEdit = () => {
    if (selectedTodo) {
      setEditTitle(selectedTodo.title)
      setEditDescription(selectedTodo.description)
      setEditPriority(selectedTodo.priority)
      setEditDueDate(selectedTodo.dueDate)
      setIsEditing(true)
    }
  }

  const saveEdit = async () => {
    if (selectedTodo) {
      await updateTodo(selectedTodo._id || selectedTodo.id, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        dueDate: editDueDate
      })
      setIsEditing(false)
      setSelectedTodo(null)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
  }
  const { users, currentUser, refreshUsers } = useUsers()
  const { groups } = useGroups()

  // Refresh users from localStorage on mount
  useEffect(() => {
    refreshUsers()
  }, [])

  console.log('TodoList: users loaded:', users)

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('handleSubmit called', { title: title.trim(), description, priority, dueDate, assignedTo, assignedGroup, files })
    
    // Validation: Ensure all required fields are filled
    if (!title.trim()) {
      alert('Title is required')
      return
    }
    if (!description.trim()) {
      alert('Description is required')
      return
    }
    if (!dueDate) {
      alert('Due Date is required')
      return
    }
    
    // Validate and convert date format from dd-mm-yyyy to yyyy-mm-dd
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/
    const match = dueDate.match(dateRegex)
    if (!match) {
      alert('Due Date must be in format dd-mm-yyyy (e.g., 28-05-2026)')
      return
    }
    const [, day, month, year] = match
    const isoDate = `${year}-${month}-${day}`
    
    try {
      await addTodo({
        title: title.trim(),
        description,
        remarks,
        priority,
        dueDate: isoDate,
        assignedTo: assignedTo || null,
        assignedGroups: assignToAllGroups ? ['all'] : (assignedGroups.length > 0 ? assignedGroups : null),
        assignedBy: currentUser?.id || null,
        files,
      })
      console.log('addTodo completed')
      setTitle('')
      setDescription('')
      setRemarks('')
      setPriority('medium')
      setDueDate('')
      setAssignedTo('')
      setAssignedGroups([])
      setAssignToAllGroups(false)
      setFiles([])
    } catch (error) {
      console.error('Failed to create task:', error)
      alert('Failed to create task: ' + (error.message || 'Unknown error'))
    }
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles([...files, ...selectedFiles])
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const downloadAttachment = (attachment) => {
    const link = document.createElement('a')
    link.href = attachment.data
    link.download = attachment.name
    link.click()
  }

  const canCompleteTask = (todo) => {
    // User can complete if they are the assignee or the creator
    return !todo.completed && 
           (todo.assignedTo == currentUser?.id || todo.assignedBy == currentUser?.id)
  }

  const canDeleteTask = (todo) => {
    // User can delete if they created the task OR if they are an admin
    return todo.assignedBy == currentUser?.id || currentUser?.role === 'admin'
  }

  const filteredTodos = todos.filter(todo => {
    // Backend handles user/group filtering, just filter by status/priority
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    if (filter === 'high') return !todo.completed && todo.priority === 'high'
    return true
  })

  const priorityOrder = { high: 0, medium: 1, low: 2 }
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const isFilteredFromDashboard = initialFilter !== 'all' && filter === initialFilter
  const isAllTasksView = filter === 'all'

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">
          {isFilteredFromDashboard 
            ? `${filter === 'completed' ? 'Completed' : filter === 'active' ? 'Pending' : filter === 'high' ? 'High Priority' : ''} Tasks`
            : 'Todo List'
          }
        </h2>
        <p className="text-muted">
          {isFilteredFromDashboard 
            ? 'Viewing filtered tasks from Dashboard'
            : 'Manage and track your tasks'
          }
        </p>
      </div>

      {/* Add Task Form - Show for 'all' view, hide for specific filters */}
      {isAllTasksView && (
      <div className="bg-surface rounded-xl p-6 border border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-primary to-accent px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Add Task
            </button>
          </div>
          
          <div>
            <label className="block text-sm text-muted mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task description..."
              rows="2"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any additional notes or remarks..."
              rows="2"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-muted mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-muted mb-2">Due Date</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="dd-mm-yyyy"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  pattern="\d{2}-\d{2}-\d{4}"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
                <input
                  type="date"
                  id="datePicker"
                  onChange={(e) => {
                    if (e.target.value) {
                      const [year, month, day] = e.target.value.split('-')
                      setDueDate(`${day}-${month}-${year}`)
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('datePicker').showPicker?.() || document.getElementById('datePicker').click()}
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors"
                >
                  <Calendar size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-muted mb-2">Assign to User</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Unassigned</option>
                {users.sort((a, b) => a.name.localeCompare(b.name)).map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-muted mb-2">Assign to Group</label>
              <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignToAllGroups}
                    onChange={(e) => {
                      setAssignToAllGroups(e.target.checked)
                      if (e.target.checked) {
                        setAssignedGroups([])
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-gray-700"
                  />
                  <span className="text-white">All Groups</span>
                </label>
                {!assignToAllGroups && groups.sort((a, b) => a.name.localeCompare(b.name)).map(group => (
                  <label key={group.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignedGroups.includes(group._id || group.id)}
                      onChange={(e) => {
                        const groupId = group._id || group.id
                        if (e.target.checked) {
                          setAssignedGroups([...assignedGroups, groupId])
                        } else {
                          setAssignedGroups(assignedGroups.filter(id => id !== groupId))
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-gray-700"
                    />
                    <span className="text-white">{group.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Attachments (Files, Photos)</label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Paperclip size={32} className="text-muted" />
                <span className="text-muted">Click to upload files or photos</span>
                <span className="text-xs text-muted">Supports images, PDF, documents</span>
              </label>
            </div>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2"
                  >
                    <div className="flex items-center gap-2">
                      {file.type.startsWith('image/') ? (
                        <Image size={16} className="text-accent" />
                      ) : (
                        <FileText size={16} className="text-primary" />
                      )}
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={20} className="text-muted" />
        <div className="flex gap-2">
          {['all', 'active', 'completed', 'high'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-surface text-muted hover:bg-gray-700'
              }`}
            >
              {f === 'high' ? 'High Priority' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {sortedTodos.length === 0 ? (
          <div className="bg-surface rounded-xl p-12 border border-gray-700 text-center">
            <p className="text-muted text-lg">No tasks found</p>
            <p className="text-muted text-sm mt-2">Add a new task to get started!</p>
          </div>
        ) : (
          sortedTodos.map((todo) => (
            <div
              key={todo._id || todo.id}
              onClick={() => setSelectedTodo(todo)}
              className={`group bg-surface rounded-xl p-4 border transition-all hover:shadow-xl cursor-pointer ${
                todo.completed
                  ? 'border-gray-700 opacity-60'
                  : todo.priority === 'high'
                  ? 'border-red-500/50'
                  : todo.priority === 'medium'
                  ? 'border-yellow-500/50'
                  : 'border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-lg ${todo.completed ? 'line-through text-muted' : ''}`}>
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className="text-sm text-muted mt-1">{todo.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      todo.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      todo.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {todo.priority}
                    </span>
                    {todo.dueDate && (
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {todo.assignedBy && (
                      <span className="text-xs text-muted flex items-center gap-1">
                        <User size={12} />
                        Assigned by: {users.find(u => u.id == todo.assignedBy)?.name || 'Unknown'}
                      </span>
                    )}
                    {todo.attachments && todo.attachments.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedTodo(expandedTodo === (todo._id || todo.id) ? null : (todo._id || todo.id))
                        }}
                        className="text-xs text-primary flex items-center gap-1 hover:text-primary/80"
                      >
                        <Paperclip size={12} />
                        {todo.attachments.length} attachment{todo.attachments.length > 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Delete Button - Only for task creators */}
                  {canDeleteTask(todo) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTodo(todo._id || todo.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      title="Delete Task"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Attachments Section */}
              {expandedTodo === (todo._id || todo.id) && todo.attachments && todo.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-semibold mb-3">Attachments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {todo.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {attachment.category === 'photo' ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={attachment.data}
                                alt={attachment.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <FileText size={20} className="text-primary" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm truncate">{attachment.name}</p>
                            {attachment.size > 0 && (
                              <p className="text-xs text-muted">{formatFileSize(attachment.size)}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => downloadAttachment(attachment)}
                            className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-all"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => deleteAttachment(todo._id || todo.id, attachment.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                            title="Delete"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTodo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl p-6 border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{isEditing ? 'Edit Task' : 'Task Details'}</h3>
              <div className="flex items-center gap-2">
                {!isEditing && canEditTask(selectedTodo) && (
                  <button
                    onClick={startEdit}
                    className="px-4 py-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all flex items-center gap-2"
                  >
                    <FileText size={20} />
                    Edit Task
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedTodo(null)
                    setIsEditing(false)
                  }}
                  className="p-2 text-muted hover:text-white rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {isEditing ? (
                <>
                  {/* Edit Title */}
                  <div>
                    <h4 className="text-sm text-muted mb-1">Title</h4>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Edit Description */}
                  <div>
                    <h4 className="text-sm text-muted mb-1">Description</h4>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                      rows={3}
                    />
                  </div>

                  {/* Edit Priority */}
                  <div>
                    <h4 className="text-sm text-muted mb-1">Priority</h4>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Edit Due Date */}
                  <div>
                    <h4 className="text-sm text-muted mb-1">Due Date</h4>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Edit Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Title */}
                  <div>
                    <h4 className="text-sm text-muted mb-1">Title</h4>
                    <p className={`text-lg ${selectedTodo.completed ? 'line-through text-muted' : ''}`}>
                      {selectedTodo.title}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <h4 className="text-sm text-muted mb-1">Status</h4>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      selectedTodo.completed 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {selectedTodo.completed ? (
                        <><CheckCircle2 size={16} /> Completed</>
                      ) : (
                        <><Clock size={16} /> Pending</>
                      )}
                    </span>
                  </div>

                  {/* Description */}
                  {selectedTodo.description && (
                    <div>
                      <h4 className="text-sm text-muted mb-1">Description</h4>
                      <p className="text-gray-300">{selectedTodo.description}</p>
                    </div>
                  )}

                  {/* Remarks */}
                  {selectedTodo.remarks && (
                    <div>
                      <h4 className="text-sm text-muted mb-1">Remarks</h4>
                      <p className="text-gray-300">{selectedTodo.remarks}</p>
                    </div>
                  )}

                  {/* Priority */}
                  <div>
                    <h4 className="text-sm text-muted mb-1">Priority</h4>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      selectedTodo.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      selectedTodo.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {selectedTodo.priority}
                    </span>
                  </div>

                  {/* Due Date */}
                  {selectedTodo.dueDate && (
                    <div>
                      <h4 className="text-sm text-muted mb-1">Due Date</h4>
                      <p className="text-gray-300 flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(selectedTodo.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}

                  {/* Created Date */}
                  <div>
                    <h4 className="text-sm text-muted mb-1">Created</h4>
                    <p className="text-gray-300 text-sm">
                      {new Date(selectedTodo.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Assigned By */}
                  {selectedTodo.assignedBy && (
                    <div>
                      <h4 className="text-sm text-muted mb-1">Assigned By</h4>
                      <p className="text-gray-300 flex items-center gap-2">
                        <User size={16} />
                        {users.find(u => u.id == selectedTodo.assignedBy)?.name || 'Unknown'}
                      </p>
                    </div>
                  )}

                  {/* Assigned To */}
                  {(selectedTodo.assignedTo || selectedTodo.assignedGroups || selectedTodo.assignedGroup) && (
                    <div>
                      <h4 className="text-sm text-muted mb-1">Assigned To</h4>
                      <p className="text-gray-300 flex items-center gap-2">
                        <Users size={16} />
                        {selectedTodo.assignedTo && users.find(u => u.id == selectedTodo.assignedTo)?.name}
                        {selectedTodo.assignedTo && (selectedTodo.assignedGroups || selectedTodo.assignedGroup) && ' / '}
                        {(selectedTodo.assignedGroups && selectedTodo.assignedGroups.includes('all')) && (
                          <span className="text-yellow-400">All Groups</span>
                        )}
                        {(selectedTodo.assignedGroups && !selectedTodo.assignedGroups.includes('all')) && selectedTodo.assignedGroups.map((groupId, idx) => {
                          const group = groups.find(g => g._id == groupId || g.id == groupId)
                          return group ? (
                            <span key={groupId}>
                              {idx > 0 && ', '}{group.name}
                            </span>
                          ) : null
                        })}
                        {(!selectedTodo.assignedGroups && selectedTodo.assignedGroup) && groups.find(g => g._id == selectedTodo.assignedGroup || g.id == selectedTodo.assignedGroup)?.name}
                      </p>
                    </div>
                  )}

                  {/* Completion Remarks */}
                  {selectedTodo.completed && selectedTodo.completionRemarks && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h4 className="text-sm text-green-400 mb-2 flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        Completion Remarks
                      </h4>
                      <p className="text-gray-300">{selectedTodo.completionRemarks}</p>
                    </div>
                  )}

                  {/* Attachments */}
                  {selectedTodo.attachments && selectedTodo.attachments.length > 0 && (
                    <div>
                      <h4 className="text-sm text-muted mb-2">Attachments ({selectedTodo.attachments.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedTodo.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {attachment.category === 'photo' ? (
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={attachment.data}
                                    alt={attachment.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                                  <FileText size={20} className="text-primary" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm truncate">{attachment.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completion Remarks Input - Always visible for incomplete tasks */}
                  {!selectedTodo.completed && (
                    <div>
                      <h4 className="text-sm text-muted mb-2 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-400" />
                        Completion Remarks (optional)
                      </h4>
                      <textarea
                        value={completionRemarks}
                        onChange={(e) => setCompletionRemarks(e.target.value)}
                        placeholder="Add any completion notes here..."
                        rows="2"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    {/* Add Attachment Button */}
                    <label className="flex-1 bg-blue-500/20 text-blue-400 py-3 rounded-lg font-semibold hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <FileText size={20} />
                      Add Attachment
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            addAttachment(selectedTodo._id || selectedTodo.id, file)
                            // Update selected todo to show new attachment
                            const updatedAttachments = [...(selectedTodo.attachments || []), {
                              id: Date.now(),
                              name: file.name,
                              type: file.type,
                              size: file.size,
                              category: file.type.startsWith('image/') ? 'photo' : 'file'
                            }]
                            setSelectedTodo({...selectedTodo, attachments: updatedAttachments})
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Complete Task Button - Saves remarks automatically */}
                    {!selectedTodo.completed && (
                      <button
                        onClick={() => {
                          toggleTodo(selectedTodo._id || selectedTodo.id)
                          if (completionRemarks.trim()) {
                            updateTodo(selectedTodo._id || selectedTodo.id, { completionRemarks: completionRemarks.trim() })
                          }
                          setSelectedTodo(null)
                          setCompletionRemarks('')
                        }}
                        className="flex-1 bg-green-500/20 text-green-400 py-3 rounded-lg font-semibold hover:bg-green-500/30 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={20} />
                        Complete Task
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedTodo(null)}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TodoList
