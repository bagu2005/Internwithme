import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthResponse } from '../../../shared/types'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'intern' | 'company'
  }) => Promise<void>
  loginWithGoogle: (authResponse: AuthResponse) => void
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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        console.log('AuthContext: Initializing auth, token exists:', !!token)
        if (token) {
          const userData = await authService.getCurrentUser()
          console.log('AuthContext: User data loaded:', userData)
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext login called:', { email })
      const response = await authService.login(email, password)
      console.log('AuthContext login success:', response)
      localStorage.setItem('token', response.token)
      setUser(response.user)
      toast.success('Welcome back!')
    } catch (error: any) {
      console.error('AuthContext login error:', error)
      toast.error(error.response?.data?.error || 'Login failed')
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
      const response = await authService.register(data)
      console.log('AuthContext register success:', response)
      localStorage.setItem('token', response.token)
      setUser(response.user)
      toast.success('Account created successfully!')
    } catch (error: any) {
      console.error('AuthContext register error:', error)
      toast.error(error.response?.data?.error || 'Registration failed')
      throw error
    }
  }

  const loginWithGoogle = (authResponse: AuthResponse) => {
    localStorage.setItem('token', authResponse.token)
    setUser(authResponse.user)
    toast.success('Welcome!')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    login,
    register,
    loginWithGoogle,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
