import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Search, Briefcase, Users, Star, ArrowRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect
              <span className="block text-primary-200">Internship</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Connect with top companies and kickstart your career with internships 
              tailored for students like you.
            </p>
            
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100">
                  Get Started Free
                </Link>
                <Link to="/internships" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600">
                  Browse Internships
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/internships" className="btn bg-white text-primary-600 hover:bg-gray-100">
                  Browse Internships
                </Link>
                {user.role === 'company' && (
                  <Link to="/create-internship" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600">
                    Post Internship
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Discover Opportunities
            </h2>
            <p className="text-lg text-gray-600">
              Search through thousands of internship opportunities from top companies
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search internships, companies, or skills..."
                    className="input pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select className="input">
                  <option>All Locations</option>
                  <option>Remote</option>
                  <option>New York</option>
                  <option>San Francisco</option>
                  <option>London</option>
                </select>
              </div>
              <Link to="/internships" className="btn-primary">
                Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose InternWithMe?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're built specifically for students and interns, with features designed 
              to help you succeed in your career journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Curated Opportunities
              </h3>
              <p className="text-gray-600">
                We carefully vet all internship postings to ensure they provide 
                real value and learning opportunities for students.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Student-Focused
              </h3>
              <p className="text-gray-600">
                Our platform is designed specifically for students, with features 
                that understand your unique needs and constraints.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Community Reviews
              </h3>
              <p className="text-gray-600">
                Read reviews from other students who have interned at companies 
                to make informed decisions about your applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-primary-200">Active Internships</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-200">Partner Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-primary-200">Successful Placements</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-primary-200">Student Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of students who have found their dream internships through InternWithMe.
          </p>
          
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/internships" className="btn-outline">
                Browse Internships
              </Link>
            </div>
          ) : (
            <Link to="/internships" className="btn-primary">
              Browse Internships
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
