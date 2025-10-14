import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { MapPin, Clock, DollarSign, Building, Calendar, Users, Send } from 'lucide-react'
import ApplicationForm from '../components/ApplicationForm'

export default function InternshipDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  // Mock data - in real app, fetch from API
  const internship = {
    id: '1',
    title: 'Software Engineering Intern',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    duration: 12,
    paid: true,
    compensation: { amount: 25, currency: 'USD', type: 'hourly' },
    remote: true,
    category: 'Technology',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
    description: 'Join our engineering team and work on cutting-edge web applications. You\'ll have the opportunity to work with experienced developers and contribute to real projects that impact millions of users.',
    requirements: [
      'Currently enrolled in Computer Science or related field',
      'Experience with JavaScript and React',
      'Strong problem-solving skills',
      'Good communication skills'
    ],
    responsibilities: [
      'Develop and maintain web applications',
      'Collaborate with cross-functional teams',
      'Write clean, maintainable code',
      'Participate in code reviews'
    ],
    benefits: [
      'Mentorship from senior engineers',
      'Flexible work hours',
      'Free lunch and snacks',
      'Networking opportunities'
    ],
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    applicationDeadline: '2024-05-15',
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
                  {internship.duration} weeks
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}
                </div>
                {internship.paid && (
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    {internship.compensation?.amount} {internship.compensation?.currency}/{internship.compensation?.type}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <span className="badge-primary text-lg px-4 py-2">{internship.category}</span>
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
          
          <div className="flex flex-wrap gap-2 mb-6">
            {internship.skills.map(skill => (
              <span key={skill} className="badge-secondary">
                {skill}
              </span>
            ))}
          </div>
          
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

            {/* Responsibilities */}
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

            {/* Benefits */}
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
                    {new Date(internship.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {new Date(internship.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{internship.duration} weeks</p>
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
