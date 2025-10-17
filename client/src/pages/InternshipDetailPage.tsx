import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { MapPin, Clock, DollarSign, Building, Calendar, Users, Send, ExternalLink, ArrowLeft } from 'lucide-react'
import ApplicationForm from '../components/ApplicationForm'
import { jobService } from '../services/supabase'
import toast from 'react-hot-toast'

export default function InternshipDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [internship, setInternship] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchJobDetails()
    }
  }, [id])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const jobs = await jobService.getJobs()
      const job = jobs.find(j => j.id === id)
      
      if (job) {
        setInternship(job)
      } else {
        toast.error('Job not found')
        navigate('/internships')
      }
    } catch (error) {
      console.error('Error fetching job details:', error)
      toast.error('Failed to load job details')
      navigate('/internships')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/internships')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {internship.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">{internship.company}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {internship.location}
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  {internship.duration || '12'} weeks
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {internship.startDate ? new Date(internship.startDate).toLocaleDateString() : 'Flexible'} - {internship.endDate ? new Date(internship.endDate).toLocaleDateString() : 'Flexible'}
                </div>
                {internship.salary && (
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    {internship.salary}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <span className="badge-primary text-lg px-4 py-2">{internship.type || 'Internship'}</span>
              {internship.remote && (
                <span className="badge-secondary">Remote</span>
              )}
              {internship.salary ? (
                <span className="badge-success">Paid</span>
              ) : (
                <span className="badge-warning">Unpaid</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {internship.skills ? internship.skills.map(skill => (
              <span key={skill} className="badge-secondary">
                {skill}
              </span>
            )) : internship.requirements ? internship.requirements.slice(0, 5).map((req, index) => (
              <span key={index} className="badge-secondary">
                {req}
              </span>
            )) : (
              <span className="badge-secondary">Skills to be discussed</span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {user && user.role === 'intern' ? (
              hasApplied ? (
                <button className="btn-secondary" disabled>
                  Application Submitted
                </button>
              ) : (
                <button 
                  onClick={() => setShowApplicationForm(true)}
                  className="btn-primary flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Apply Now
                </button>
              )
            ) : (
              <button className="btn-secondary" disabled>
                {user ? 'Companies cannot apply' : 'Login to Apply'}
              </button>
            )}
            
            <button
              onClick={() => {
                const url = internship.sourceUrl || 
                  (internship.company.includes('Google') ? 'https://careers.google.com/jobs/results/?location=Singapore&q=intern' :
                   internship.company.includes('Microsoft') ? 'https://careers.microsoft.com/us/en/search-results?keywords=intern&location=singapore' :
                   internship.company.includes('Amazon') ? 'https://www.amazon.jobs/en/search?base_query=intern&loc_query=singapore' :
                   internship.company.includes('Grab') ? 'https://grab.careers/jobs/' :
                   internship.company.includes('Shopee') ? 'https://careers.shopee.sg/jobs/' :
                   internship.company.includes('DBS') ? 'https://www.dbs.com/careers/default.page' :
                   internship.company.includes('OCBC') ? 'https://www.ocbc.com/group/careers/' :
                   internship.company.includes('UOB') ? 'https://www.uobgroup.com/uobgroup/careers/' :
                   internship.company.includes('GovTech') ? 'https://www.tech.gov.sg/careers/' :
                   internship.company.includes('Enterprise') ? 'https://www.enterprisesg.gov.sg/careers' :
                   internship.company.includes('A*STAR') ? 'https://www.a-star.edu.sg/careers' :
                   internship.company.includes('Carousell') ? 'https://careers.carousell.com/' :
                   internship.company.includes('99.co') ? 'https://99.co/singapore/careers' :
                   internship.company.includes('Ninja Van') ? 'https://www.ninjavan.co/en-sg/careers' :
                   internship.company.includes('McKinsey') ? 'https://www.mckinsey.com/careers/search-jobs' :
                   internship.company.includes('PwC') ? 'https://www.pwc.com/sg/en/careers.html' :
                   internship.company.includes('Allen') ? 'https://www.allenandgledhill.com/careers/' :
                   internship.company.includes('National University Hospital') ? 'https://www.nuh.com.sg/careers/' :
                   internship.company.includes('Remote') ? 'https://remote.co/remote-jobs/' :
                   `https://${internship.company.toLowerCase().replace(/\s+/g, '')}.com/careers`)
                window.open(url, '_blank')
              }}
              className="btn-outline flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Original
            </button>
            
            <button
              onClick={() => navigate('/internships')}
              className="btn-outline flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {internship.description}
              </p>
            </div>

            {/* Requirements */}
            {internship.requirements && internship.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {internship.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span className="text-gray-600">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {internship.responsibilities && internship.responsibilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">What You'll Do</h2>
                <ul className="space-y-2">
                  {internship.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span className="text-gray-600">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {internship.benefits && internship.benefits.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <ul className="space-y-2">
                  {internship.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Application Deadline</p>
                  <p className="font-medium">
                    {internship.applicationDeadline ? new Date(internship.applicationDeadline).toLocaleDateString() : 'Rolling basis'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {internship.startDate ? new Date(internship.startDate).toLocaleDateString() : 'Flexible'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{internship.duration || '12'} weeks</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Posted Date</p>
                  <p className="font-medium">
                    {internship.posted_date ? new Date(internship.posted_date).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About {internship.company}</h3>
              <p className="text-gray-600 text-sm mb-4">
                TechCorp is a leading technology company focused on building innovative solutions 
                that make a difference in people's lives.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Building className="w-4 h-4 mr-2" />
                Technology • 1000+ employees
              </div>
            </div>

            {/* Similar Internships */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Internships</h3>
              <div className="space-y-3">
                <div className="border-l-4 border-primary-500 pl-4">
                  <h4 className="font-medium text-gray-900">Frontend Developer Intern</h4>
                  <p className="text-sm text-gray-600">StartupXYZ • Remote</p>
                </div>
                <div className="border-l-4 border-primary-500 pl-4">
                  <h4 className="font-medium text-gray-900">Full Stack Intern</h4>
                  <p className="text-sm text-gray-600">DataCorp • San Francisco</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <ApplicationForm
          internshipId={internship.id}
          internshipTitle={internship.title}
          companyName={internship.company}
          onClose={() => setShowApplicationForm(false)}
          onSuccess={() => setHasApplied(true)}
        />
      )}
    </div>
  )
}
