import { useState } from 'react'
import { Lock, Users, CheckSquare2, Calendar, ArrowRight } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loginError, setLoginError] = useState('')
  const { login, addUser, loading, error } = useUsers()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    const success = await login(email, password)
    if (!success) {
      setLoginError('Invalid email or password')
    } else {
      setEmail('')
      setPassword('')
      window.location.reload()
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      await addUser({ name, email, password, role: 'user' })
      setLoginError('')
      window.location.reload()
    } catch (error) {
      setLoginError('Registration failed. Email may already exist.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Left Side - Welcome Info */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Todo App
            </h1>
            <p className="text-xl text-gray-300">
              Manage your tasks efficiently with our powerful todo list application
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <CheckSquare2 size={20} className="text-primary" />
              </div>
              <span>Organize tasks with priorities</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calendar size={20} className="text-primary" />
              </div>
              <span>Calendar view for scheduling</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users size={20} className="text-primary" />
              </div>
              <span>Assign tasks to users and groups</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login/Register Form */}
        <div className="bg-surface rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-muted mt-2">{isLogin ? 'Sign in to your account' : 'Register a new account'}</p>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm text-muted mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  disabled={loading}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-muted mb-2">Username</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                disabled={loading}
                required
              />
            </div>
            {(loginError || error) && (
              <p className="text-sm text-red-400 text-center">{loginError || error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock size={18} />
              {loading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Register')}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setLoginError('')
                setEmail('')
                setPassword('')
                setName('')
              }}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default LoginPage
