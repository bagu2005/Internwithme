import React, { useState, useEffect } from 'react'
import { X, CheckCircle, Clock, AlertCircle, BookOpen, ExternalLink } from 'lucide-react'
import { toast } from 'react-hot-toast'
import CourseRecommendationService from '../services/courseRecommendationService'

interface ApplicationPlannerProps {
  job: any
  isOpen: boolean
  onClose: () => void
  onApply: (job: any) => void
}

interface ApplicationStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  estimatedTime: string
  resources?: string[]
}

interface CourseRecommendation {
  title: string
  platform: string
  duration: string
  difficulty: string
  url: string
  relevance: number
}

export default function ApplicationPlanner({ job, isOpen, onClose, onApply }: ApplicationPlannerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<ApplicationStep[]>([
    {
      id: 'research',
      title: 'Research Company & Role',
      description: 'Learn about the company culture, values, and specific role requirements',
      status: 'pending',
      estimatedTime: '30 minutes',
      resources: ['Company website', 'LinkedIn', 'Glassdoor reviews']
    },
    {
      id: 'resume',
      title: 'Tailor Resume',
      description: 'Customize your resume to match the job requirements and keywords',
      status: 'pending',
      estimatedTime: '45 minutes',
      resources: ['Job description analysis', 'Resume templates']
    },
    {
      id: 'cover-letter',
      title: 'Write Cover Letter',
      description: 'Create a compelling cover letter that highlights relevant experience',
      status: 'pending',
      estimatedTime: '1 hour',
      resources: ['Cover letter templates', 'Company research notes']
    },
    {
      id: 'apply',
      title: 'Submit Application',
      description: 'Apply through the official company website or job portal',
      status: 'pending',
      estimatedTime: '15 minutes',
      resources: ['Application form', 'Required documents']
    },
    {
      id: 'follow-up',
      title: 'Follow Up',
      description: 'Send a follow-up email after 1-2 weeks if no response',
      status: 'pending',
      estimatedTime: '10 minutes',
      resources: ['Follow-up email template']
    }
  ])

  const [courseRecommendations, setCourseRecommendations] = useState<CourseRecommendation[]>([])

  // Load course recommendations when component opens
  useEffect(() => {
    if (isOpen && job) {
      const recommendations = CourseRecommendationService.getRecommendations(job, 6)
      setCourseRecommendations(recommendations)
    }
  }, [isOpen, job])

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const markStepComplete = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'completed' as const }
        : step
    ))
    toast.success('Step marked as completed!')
  }

  const markStepIncomplete = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'pending' as const }
        : step
    ))
    toast.success('Step marked as incomplete!')
  }

  const startStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'in-progress' as const }
        : step
    ))
  }

  const handleApply = () => {
    onApply(job)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Application Planner</h2>
            <p className="text-gray-600 mt-1">{job.title} at {job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Overview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Progress</h3>
            <div className="bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
                }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {steps.filter(s => s.status === 'completed').length} of {steps.length} steps completed
            </p>
          </div>

          {/* Application Steps */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Steps</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStepIcon(step.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{step.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStepStatusColor(step.status)}`}>
                            {step.status.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                        <p className="text-xs text-gray-500">Estimated time: {step.estimatedTime}</p>
                        {step.resources && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Resources:</p>
                            <div className="flex flex-wrap gap-1">
                              {step.resources.map((resource, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {resource}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {step.status === 'pending' && (
                        <button
                          onClick={() => startStep(step.id)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {step.status === 'in-progress' && (
                        <button
                          onClick={() => markStepComplete(step.id)}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {step.status === 'completed' && (
                        <button
                          onClick={() => markStepIncomplete(step.id)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          Undo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Recommendations */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Courses</h3>
            <p className="text-gray-600 text-sm mb-4">
              Based on the job requirements, here are courses that can help you prepare:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseRecommendations.map((course, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {course.relevance}% match
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Platform:</strong> {course.platform}</p>
                    <p><strong>Duration:</strong> {course.duration}</p>
                    <p><strong>Difficulty:</strong> {course.difficulty}</p>
                  </div>
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    View Course
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const url = job.sourceUrl || 
                    (job.company.includes('Google') ? 'https://careers.google.com/jobs/results/?location=Singapore&q=intern' :
                     job.company.includes('Microsoft') ? 'https://careers.microsoft.com/us/en/search-results?keywords=intern&location=singapore' :
                     job.company.includes('Amazon') ? 'https://www.amazon.jobs/en/search?base_query=intern&loc_query=singapore' :
                     job.company.includes('Grab') ? 'https://grab.careers/jobs/' :
                     job.company.includes('Shopee') ? 'https://careers.shopee.sg/jobs/' :
                     job.company.includes('DBS') ? 'https://www.dbs.com/careers/default.page' :
                     job.company.includes('Remote') ? 'https://remote.co/remote-jobs/' :
                     `https://www.indeed.com/viewjob?jk=${job.id}&q=${encodeURIComponent(job.title)}&l=singapore`)
                  window.open(url, '_blank')
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Original Job
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark as Applied
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
