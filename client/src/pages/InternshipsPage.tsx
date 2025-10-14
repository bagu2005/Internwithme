import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Clock, DollarSign, Building, Filter } from 'lucide-react'

// Mock data for demonstration
const mockInternships = [
  {
    id: '1',
    title: 'Software Engineering Intern',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    duration: 12,
    paid: true,
    compensation: { amount: 25, currency: 'USD', type: 'hourly' },
    remote: true,
    category: 'Technology',
    skills: ['React', 'Node.js', 'TypeScript'],
    description: 'Join our engineering team and work on cutting-edge web applications...',
    startDate: '2024-06-01',
    applicationDeadline: '2024-05-15',
  },
  {
    id: '2',
    title: 'Marketing Intern',
    company: 'StartupXYZ',
    location: 'New York, NY',
    duration: 8,
    paid: false,
    remote: false,
    category: 'Marketing',
    skills: ['Social Media', 'Content Creation', 'Analytics'],
    description: 'Help us grow our brand and reach new audiences...',
    startDate: '2024-07-01',
    applicationDeadline: '2024-06-01',
  },
  {
    id: '3',
    title: 'Data Science Intern',
    company: 'DataCorp',
    location: 'Remote',
    duration: 16,
    paid: true,
    compensation: { amount: 3000, currency: 'USD', type: 'monthly' },
    remote: true,
    category: 'Data Science',
    skills: ['Python', 'Machine Learning', 'SQL'],
    description: 'Work with our data team to analyze large datasets...',
    startDate: '2024-05-15',
    applicationDeadline: '2024-04-30',
  },
]

export default function InternshipsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showPaidOnly, setShowPaidOnly] = useState(false)
  const [showRemoteOnly, setShowRemoteOnly] = useState(false)

  const filteredInternships = mockInternships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !selectedCategory || internship.category === selectedCategory
    const matchesPaid = !showPaidOnly || internship.paid
    const matchesRemote = !showRemoteOnly || internship.remote

    return matchesSearch && matchesCategory && matchesPaid && matchesRemote
  })

  const categories = ['Technology', 'Marketing', 'Data Science', 'Design', 'Finance', 'Healthcare']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Internship
          </h1>
          <p className="text-lg text-gray-600">
            Discover opportunities from top companies around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search internships, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Quick Filters */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPaidOnly(!showPaidOnly)}
                className={`btn ${showPaidOnly ? 'btn-primary' : 'btn-secondary'}`}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Paid Only
              </button>
              <button
                onClick={() => setShowRemoteOnly(!showRemoteOnly)}
                className={`btn ${showRemoteOnly ? 'btn-primary' : 'btn-secondary'}`}
              >
                Remote
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Internship List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredInternships.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              filteredInternships.map(internship => (
                <div key={internship.id} className="card-hover p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        <Link 
                          to={`/internships/${internship.id}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {internship.title}
                        </Link>
                      </h3>
                      <p className="text-lg text-gray-600 mb-2">{internship.company}</p>
                      <div className="flex items-center text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {internship.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {internship.duration} weeks
                        </div>
                        {internship.paid && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {internship.compensation?.amount} {internship.compensation?.currency}/{internship.compensation?.type}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="badge-primary">{internship.category}</span>
                      {internship.remote && (
                        <span className="badge-secondary">Remote</span>
                      )}
                      {internship.paid ? (
                        <span className="badge-success">Paid</span>
                      ) : (
                        <span className="badge-warning">Unpaid</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {internship.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {internship.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="badge-secondary text-xs">
                          {skill}
                        </span>
                      ))}
                      {internship.skills.length > 3 && (
                        <span className="badge-secondary text-xs">
                          +{internship.skills.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <Link
                      to={`/internships/${internship.id}`}
                      className="btn-outline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Internships</span>
                  <span className="font-medium">{mockInternships.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Positions</span>
                  <span className="font-medium">
                    {mockInternships.filter(i => i.paid).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remote Positions</span>
                  <span className="font-medium">
                    {mockInternships.filter(i => i.remote).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
