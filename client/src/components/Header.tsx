import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { User, LogOut, Briefcase, UserCircle, Plus, Shield, ShieldCheck, Crown, MessageCircle } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">InternWithMe</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/internships"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Browse Internships
            </Link>
            {user && (
              <Link
                to="/my-applications"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                My Applications
              </Link>
            )}
            <Link
              to="/contact"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'company' && (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/create-internship"
                      className="btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Post Internship
                    </Link>
                  </>
                )}
                
                {user.role === 'intern' && (
                  <Link
                    to="/applications"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    My Applications
                  </Link>
                )}

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <UserCircle className="w-5 h-5" />
                    <span>{user.firstName}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/verification"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Verification
                      </Link>
              <Link
                to="/subscription"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Crown className="w-4 h-4 mr-2" />
                Subscription
              </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/internships"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Internships
              </Link>
              {user && (
                <Link
                  to="/my-applications"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Applications
                </Link>
              )}
              <Link
                to="/contact"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {user ? (
                <>
                  {user.role === 'company' && (
                    <>
                      <Link
                        to="/dashboard"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/create-internship"
                        className="btn-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Post Internship
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'intern' && (
                    <Link
                      to="/applications"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Applications
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  <Link
                    to="/verification"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Verification
                  </Link>
                  
                  <Link
                    to="/subscription"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Subscription
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
