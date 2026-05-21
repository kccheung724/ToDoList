import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, AlertCircle, TrendingUp, User, Bell, X, Check, Calendar, FileText } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'

function Dashboard({ onStatClick, unreadCount = 0, setShowNotifications = () => {}, todos = [], toggleTodo, updateTodo, addAttachment }) {
  const { currentUser, users } = useUsers()
  const [showWelcome, setShowWelcome] = useState(true)
  const [showTaskList, setShowTaskList] = useState(false)
  const [showFilteredTasks, setShowFilteredTasks] = useState(false)
  const [filteredTasksTitle, setFilteredTasksTitle] = useState('')
  const [filteredTasks, setFilteredTasks] = useState([])
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [completionRemarks, setCompletionRemarks] = useState('')
  const [showCompletionRemarks, setShowCompletionRemarks] = useState(false)

  // Filter todos for current user
  const userTodos = currentUser 
    ? todos.filter(todo => todo.assignedTo == currentUser.id || todo.assignedBy == currentUser.id)
    : todos

  const totalTodos = userTodos.length
  const completedTodos = userTodos.filter(todo => todo.completed).length
  const pendingTodos = totalTodos - completedTodos
  const highPriorityTodos = userTodos.filter(todo => !todo.completed && todo.priority === 'high').length
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

  // Get this week's tasks (tasks due within the next 7 days or overdue)
  const getThisWeekTasks = () => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    return userTodos.filter(todo => {
      if (!todo.dueDate) return false
      const dueDate = new Date(todo.dueDate)
      return dueDate <= nextWeek || (dueDate < today && !todo.completed)
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }

  const thisWeekTasks = getThisWeekTasks()

  const stats = [
    { title: 'Total Tasks', value: totalTodos, icon: CheckCircle2, color: 'from-blue-500 to-blue-600', filter: 'all', onClick: () => setShowTaskList(true) },
    { title: 'Completed', value: completedTodos, icon: CheckCircle2, color: 'from-green-500 to-green-600', onClick: () => {
      setFilteredTasksTitle('Completed Tasks')
      setFilteredTasks(userTodos.filter(t => t.completed))
      setShowFilteredTasks(true)
    }},
    { title: 'Pending', value: pendingTodos, icon: Clock, color: 'from-yellow-500 to-yellow-600', onClick: () => {
      setFilteredTasksTitle('Pending Tasks')
      setFilteredTasks(userTodos.filter(t => !t.completed))
      setShowFilteredTasks(true)
    }},
    { title: 'High Priority', value: highPriorityTodos, icon: AlertCircle, color: 'from-red-500 to-red-600', onClick: () => {
      setFilteredTasksTitle('High Priority Tasks')
      setFilteredTasks(userTodos.filter(t => t.priority === 'high'))
      setShowFilteredTasks(true)
    }},
  ]

  const recentTodos = [...userTodos]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Welcome Alert */}
      {currentUser && showWelcome && (
        <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 border border-primary/30 relative">
          <button
            onClick={() => setShowWelcome(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Welcome back, {currentUser.name}!
              </h3>
              <p className="text-white/80 mt-1">
                You have {pendingTodos} pending task{pendingTodos !== 1 ? 's' : ''} to complete.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {/* Notification Bell - Pink */}
              <button
                onClick={() => setShowNotifications && setShowNotifications(true)}
                className="relative p-3 rounded-xl bg-pink-500 text-white shadow-lg shadow-pink-500/30 hover:bg-pink-400 transition-all"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold border-2 border-pink-500">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted">Overview of your tasks and productivity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div 
              key={stat.title} 
              onClick={() => {
                if (stat.onClick) {
                  stat.onClick()
                } else if (stat.filter && onStatClick) {
                  onStatClick(stat.filter)
                }
              }}
              className={`bg-surface rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition-all hover:shadow-xl ${(stat.filter || stat.onClick) ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
                <TrendingUp size={20} className="text-green-400" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-muted text-sm">{stat.title}</p>
            </div>
          )
        })}
      </div>

      {/* Two Column Layout - Completion Rate & This Week's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Completion Rate */}
        <div className="bg-surface rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Completion Rate</h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <span className="text-sm font-semibold inline-block text-primary">
                {completionRate}%
              </span>
            </div>
            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-700">
              <div
                style={{ width: `${completionRate}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary to-accent transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column - This Week's Tasks */}
        <div className="bg-surface rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            This Week's Tasks ({thisWeekTasks.length})
          </h3>
          {thisWeekTasks.length === 0 ? (
            <p className="text-muted text-center py-4">No tasks due this week</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {thisWeekTasks.map((todo) => {
                const isOverdue = new Date(todo.dueDate) < new Date() && !todo.completed
                return (
                  <div
                    key={todo._id || todo.id}
                    onClick={() => setSelectedTodo(todo)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:border-gray-500 transition-all ${
                      todo.completed
                        ? 'border-gray-700 bg-gray-800/50'
                        : isOverdue
                        ? 'border-red-500/50 bg-red-500/10'
                        : todo.priority === 'high'
                        ? 'border-red-500/30 bg-red-500/10'
                        : todo.priority === 'medium'
                        ? 'border-yellow-500/30 bg-yellow-500/10'
                        : 'border-gray-700 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${todo.completed ? 'line-through text-muted' : ''}`}>
                        {todo.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${isOverdue ? 'text-red-400 font-semibold' : 'text-muted'}`}>
                          {isOverdue ? 'Overdue: ' : 'Due: '}
                          {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          todo.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          todo.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {todo.priority}
                        </span>
                      </div>
                    </div>
                    {todo.completed && <CheckCircle2 size={16} className="text-green-400 ml-2" />}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-surface rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">{currentUser ? 'Your Recent Tasks' : 'Recent Tasks'}</h3>
        {recentTodos.length === 0 ? (
          <p className="text-muted text-center py-8">No tasks yet. Create your first task!</p>
        ) : (
          <div className="space-y-3">
            {recentTodos.map((todo) => (
              <div
                key={todo._id || todo.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  todo.completed
                    ? 'border-gray-700 bg-gray-800/50'
                    : todo.priority === 'high'
                    ? 'border-red-500/30 bg-red-500/10'
                    : todo.priority === 'medium'
                    ? 'border-yellow-500/30 bg-yellow-500/10'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      todo.completed
                        ? 'bg-green-500'
                        : todo.priority === 'high'
                        ? 'bg-red-500'
                        : todo.priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <span className={todo.completed ? 'line-through text-muted' : ''}>
                    {todo.title}
                  </span>
                </div>
                <span className="text-sm text-muted">
                  {new Date(todo.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task List Modal */}
      {showTaskList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl p-6 border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">All Tasks ({userTodos.length})</h3>
              <button
                onClick={() => setShowTaskList(false)}
                className="p-2 text-muted hover:text-white rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {userTodos.length === 0 ? (
              <p className="text-muted text-center py-8">No tasks yet. Create your first task!</p>
            ) : (
              <div className="space-y-3">
                {userTodos.map((todo) => (
                  <div
                    key={todo._id || todo.id}
                    onClick={() => setSelectedTodo(todo)}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:border-gray-500 transition-all ${
                      todo.completed
                        ? 'border-gray-700 bg-gray-800/50'
                        : todo.priority === 'high'
                        ? 'border-red-500/30 bg-red-500/10'
                        : todo.priority === 'medium'
                        ? 'border-yellow-500/30 bg-yellow-500/10'
                        : 'border-gray-700 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Status indicator (non-clickable) */}
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        todo.completed ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <span className={todo.completed ? 'line-through text-muted' : ''}>
                          {todo.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            todo.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            todo.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {todo.priority}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            todo.completed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {todo.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-muted ml-4">
                      {new Date(todo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filtered Tasks Modal for Completed, Pending, High Priority */}
      {showFilteredTasks && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl p-6 border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{filteredTasksTitle} ({filteredTasks.length})</h3>
              <button
                onClick={() => setShowFilteredTasks(false)}
                className="p-2 text-muted hover:text-white rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {filteredTasks.length === 0 ? (
              <p className="text-muted text-center py-8">No tasks found.</p>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((todo) => (
                  <div
                    key={todo._id || todo.id}
                    onClick={() => setSelectedTodo(todo)}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:border-gray-500 transition-all ${
                      todo.completed
                        ? 'border-gray-700 bg-gray-800/50'
                        : todo.priority === 'high'
                        ? 'border-red-500/30 bg-red-500/10'
                        : todo.priority === 'medium'
                        ? 'border-yellow-500/30 bg-yellow-500/10'
                        : 'border-gray-700 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Status indicator */}
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        todo.completed ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <span className={todo.completed ? 'line-through text-muted' : ''}>
                          {todo.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            todo.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            todo.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {todo.priority}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            todo.completed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {todo.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-muted ml-4">
                      {new Date(todo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Details Modal for This Week's Tasks */}
      {selectedTodo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl p-6 border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Task Details</h3>
              <button
                onClick={() => setSelectedTodo(null)}
                className="p-2 text-muted hover:text-white rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
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
                    {new Date(selectedTodo.dueDate).toLocaleDateString()}
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
                    {users.find(u => u.id === selectedTodo.assignedBy)?.name || 'Unknown'}
                  </p>
                </div>
              )}

              {/* Assigned To */}
              {selectedTodo.assignedTo && (
                <div>
                  <h4 className="text-sm text-muted mb-1">Assigned To</h4>
                  <p className="text-gray-300 flex items-center gap-2">
                    <Users size={16} />
                    {users.find(u => u.id === selectedTodo.assignedTo)?.name || 'Unknown'}
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
                      setSelectedTodo({...selectedTodo, completed: true, completionRemarks: completionRemarks.trim()})
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
