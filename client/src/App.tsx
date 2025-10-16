import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyOTPPage from './pages/VerifyOTPPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import UserVerificationPage from './pages/UserVerificationPage'
import AdminVerificationPage from './pages/AdminVerificationPage'
import InternshipsPage from './pages/InternshipsPage'
import InternshipDetailPage from './pages/InternshipDetailPage'
import ProfilePage from './pages/ProfilePage'
import ApplicationsPage from './pages/ApplicationsPage'
import SubscriptionPage from './pages/SubscriptionPage'
import ContactPage from './pages/ContactPage'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/jobs" element={<InternshipsPage />} />
        <Route path="/jobs/:id" element={<InternshipDetailPage />} />
        <Route path="/internships" element={<InternshipsPage />} />
        <Route path="/internships/:id" element={<InternshipDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
               {/* Protected routes */}
               {user && (
                 <>
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/applications" element={<ApplicationsPage />} />
                  <Route path="/subscription" element={<SubscriptionPage />} />

                   {/* Verification routes */}
                   {user.role === 'intern' && (
                     <Route path="/verification" element={<UserVerificationPage />} />
                   )}

                   {/* Admin routes */}
                   {user.role === 'admin' && (
                     <Route path="/admin/verification" element={<AdminVerificationPage />} />
                   )}
                 </>
               )}
        
        {/* 404 route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Page not found</p>
              <a href="/" className="btn-primary">
                Go Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Layout>
  )
}

export default App
