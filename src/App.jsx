import { useState } from 'react'
import { LayoutDashboard, Calendar, CheckSquare2, Menu, X, Users, User, LogOut, Bell, Trash2, Check } from 'lucide-react'
import Dashboard from './components/Dashboard'
import CalendarView from './components/CalendarView'
import TodoList from './components/TodoList'
import UserManagement from './components/UserManagement'
import GroupManagement from './components/GroupManagement'
import LoginPage from './components/LoginPage'
import { useUsers } from './hooks/useUsers'
import { useTodos } from './hooks/useTodos'
import { useNotifications } from './hooks/useNotifications'

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [todoFilter, setTodoFilter] = useState('all')
  const [showNotifications, setShowNotifications] = useState(false)
  const { currentUser, logout } = useUsers()
  const { todos, addTodo, toggleTodo, updateTodo, deleteTodo, deleteAttachment, addAttachment, refreshTodos } = useTodos()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications(currentUser, todos || [])

  const handleDashboardStatClick = (filter) => {
    setTodoFilter(filter)
    setActiveView('todos')
  }

  const views = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'todos', name: 'Todo List', icon: CheckSquare2 },
    { id: 'users', name: 'Users', icon: User, adminOnly: true },
    { id: 'groups', name: 'Groups', icon: Users, adminOnly: true },
  ]

  // Filter views based on user role
  const filteredViews = views.filter(view => !view.adminOnly || currentUser?.role === 'admin')

  // Show login page if not logged in
  if (!currentUser) {
    return <LoginPage />
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-surface border-r border-gray-700 transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between">
          <h1 className={`${sidebarOpen ? 'block' : 'hidden'} text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
            Todo App
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {filteredViews.map((view) => {
            const Icon = view.icon
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  activeView === view.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-muted hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className={`${sidebarOpen ? 'block' : 'hidden'}`}>{view.name}</span>
              </button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full"
            />
            <div className={`flex-1 ${sidebarOpen ? 'block' : 'hidden'}`}>
              <p className="text-sm font-semibold">{currentUser.name}</p>
              <p className="text-xs text-muted">{currentUser.role === 'admin' ? 'Administrator' : 'User'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <LogOut size={18} />
            <span className={`${sidebarOpen ? 'block' : 'hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-auto">
        {/* Header with Notifications */}
        <header className="bg-surface border-b border-gray-700 p-4 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-xl font-bold">
            {filteredViews.find(v => v.id === activeView)?.name || 'Dashboard'}
          </h1>
          
          {/* Notification Bell - Top Right */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-3 rounded-xl transition-all ${
                showNotifications 
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' 
                  : 'bg-pink-500 text-white hover:bg-pink-400 shadow-lg shadow-pink-500/30'
              }`}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold border-2 border-surface">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-surface rounded-xl border border-gray-700 shadow-xl max-h-96 overflow-y-auto z-50">
                <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary hover:text-white transition-colors px-2 py-1 rounded"
                        title="Mark all as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="text-xs text-red-400 hover:text-white transition-colors px-2 py-1 rounded"
                        title="Clear all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                {notifications.length === 0 ? (
                  <p className="text-muted text-center py-8 text-sm">No notifications</p>
                ) : (
                  <div className="divide-y divide-gray-700">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-3 cursor-pointer hover:bg-gray-700/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                            notification.type === 'new_task' ? 'bg-blue-500' :
                            notification.type === 'due_today' ? 'bg-yellow-500' :
                            notification.type === 'completed_by_assignee' ? 'bg-green-500' :
                            'bg-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-muted'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="text-muted hover:text-red-400 transition-colors p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8">
          {activeView === 'dashboard' && <Dashboard onStatClick={handleDashboardStatClick} unreadCount={unreadCount} setShowNotifications={setShowNotifications} todos={todos} toggleTodo={toggleTodo} updateTodo={updateTodo} addAttachment={addAttachment} />}
          {activeView === 'calendar' && <CalendarView todos={todos} toggleTodo={toggleTodo} updateTodo={updateTodo} addAttachment={addAttachment} />}
          {activeView === 'todos' && <TodoList initialFilter={todoFilter} todos={todos} addTodo={addTodo} toggleTodo={toggleTodo} updateTodo={updateTodo} deleteTodo={deleteTodo} deleteAttachment={deleteAttachment} refreshTodos={refreshTodos} />}
          {activeView === 'users' && <UserManagement />}
          {activeView === 'groups' && <GroupManagement />}
        </div>
      </main>
    </div>
  )
}

export default App
