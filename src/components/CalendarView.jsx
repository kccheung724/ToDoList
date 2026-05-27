import { useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, getDate } from 'date-fns'
import { useUsers } from '../hooks/useUsers'
import { CheckCircle2, Clock, X, Calendar as CalendarIcon, FileText, User, Users, ChevronLeft, ChevronRight } from 'lucide-react'

function CalendarView({ todos = [], toggleTodo, updateTodo, addAttachment }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [completionRemarks, setCompletionRemarks] = useState('')
  const { users } = useUsers()

  // Get todos for a specific date
  const getTodosForDate = (date) => {
    return todos.filter(todo => {
      const todoDate = new Date(todo.dueDate || todo.createdAt)
      return isSameDay(todoDate, date)
    })
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days = []
    let day = calendarStart

    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Calendar</h2>
        <p className="text-muted">View and manage your tasks by date</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-surface rounded-xl p-4 border border-gray-700">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h3 className="text-xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-300">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center font-semibold text-sm text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((day, index) => {
            const dayTodos = getTodosForDate(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={index}
                className={`min-h-[140px] p-2 border-r border-b border-gray-300 last:border-r-0 ${
                  !isCurrentMonth ? 'bg-gray-100 text-black' : 'bg-white'
                } ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}
              >
                {/* Day Number */}
                <div className={`text-sm font-bold mb-1 ${isToday ? 'text-primary' : 'text-black'}`}>
                  {getDate(day)}
                </div>

                {/* Tasks */}
                <div className="space-y-1">
                  {dayTodos.slice(0, 2).map(todo => (
                    <div
                      key={todo._id || todo.id}
                      onClick={() => setSelectedTodo(todo)}
                      className={`text-xs p-1 rounded cursor-pointer break-words leading-tight ${
                        todo.completed
                          ? 'bg-green-600 text-white'
                          : todo.priority === 'high'
                          ? 'bg-red-600 text-white'
                          : todo.priority === 'medium'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {todo.title}
                    </div>
                  ))}
                  {dayTodos.length > 2 && (
                    <div className="text-xs text-gray-400 text-center">
                      +{dayTodos.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>


      {/* Task Details Modal */}
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
                    <CalendarIcon size={16} />
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView
