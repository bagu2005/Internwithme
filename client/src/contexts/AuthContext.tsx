import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, supabase } from '../services/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: any | null
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'intern' | 'company'
  }) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('AuthContext: Initial session:', session)
        setUser(session?.user || null)
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, session?.user?.email)
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext login called:', { email })
      const response = await authService.signIn(email, password)
      console.log('AuthContext login success:', response)
      // Don't manually set user - let onAuthStateChange handle it
      toast.success('Welcome back!')
    } catch (error: any) {
      console.error('AuthContext login error:', error)
      toast.error(error.message || 'Login failed')
      throw error
    }
  }

  const register = async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'intern' | 'company'
  }) => {
    try {
      console.log('AuthContext register called:', { email: data.email })
      const response = await authService.signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role
      })
      console.log('AuthContext register success:', response)
      toast.success('Account created successfully!')
    } catch (error: any) {
      console.error('AuthContext register error:', error)
      toast.error(error.message || 'Registration failed')
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.signOut()
      setUser(null)
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
