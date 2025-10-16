import { useState } from 'react'
import { Filter, X, DollarSign, Building2, MapPin, Calendar, Users, Briefcase } from 'lucide-react'

interface FilterState {
  salaryRange: [number, number]
  companySize: string
  workArrangement: string
  applicationDeadline: string
  experienceLevel: string
  industry: string
  skills: string[]
  location: string
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClose: () => void
  isOpen: boolean
}

const salaryRanges = [
  { label: 'Any', value: [0, 10000] },
  { label: 'S$2,000 - S$3,000', value: [2000, 3000] },
  { label: 'S$3,000 - S$4,000', value: [3000, 4000] },
  { label: 'S$4,000 - S$5,000', value: [4000, 5000] },
  { label: 'S$5,000+', value: [5000, 10000] }
]

const companySizes = [
  { label: 'Any', value: '' },
  { label: 'Startup (1-50)', value: 'startup' },
  { label: 'Small (51-200)', value: 'small' },
  { label: 'Medium (201-1000)', value: 'medium' },
  { label: 'Large (1000+)', value: 'large' }
]

const workArrangements = [
  { label: 'Any', value: '' },
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'On-site', value: 'onsite' }
]

const experienceLevels = [
  { label: 'Any', value: '' },
  { label: 'Entry Level', value: 'entry' },
  { label: 'Mid Level', value: 'mid' },
  { label: 'Senior Level', value: 'senior' }
]

const industries = [
  { label: 'Any', value: '' },
  { label: 'Technology', value: 'technology' },
  { label: 'Finance', value: 'finance' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Education', value: 'education' },
  { label: 'Government', value: 'government' },
  { label: 'Media', value: 'media' },
  { label: 'Consulting', value: 'consulting' },
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'Gaming', value: 'gaming' }
]

const popularSkills = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'SQL',
  'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Marketing',
  'Project Management', 'Sales', 'Customer Service', 'Content Writing'
]

export default function AdvancedFilters({ filters, onFiltersChange, onClose, isOpen }: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSkillToggle = (skill: string) => {
    const newSkills = localFilters.skills.includes(skill)
      ? localFilters.skills.filter(s => s !== skill)
      : [...localFilters.skills, skill]
    handleFilterChange('skills', newSkills)
  }

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      salaryRange: [0, 10000],
      companySize: '',
      workArrangement: '',
      applicationDeadline: '',
      experienceLevel: '',
      industry: '',
      skills: [],
      location: ''
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(localFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== '' && JSON.stringify(value) !== JSON.stringify([0, 10000])
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Advanced Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters Content */}
        <div className="p-6 space-y-8">
          {/* Salary Range */}
          <div>
            <div className="flex items-center mb-3">
              <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Salary Range</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {salaryRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handleFilterChange('salaryRange', range.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    localFilters.salaryRange[0] === range.value[0] && localFilters.salaryRange[1] === range.value[1]
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Company Size */}
          <div>
            <div className="flex items-center mb-3">
              <Building2 className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Company Size</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {companySizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleFilterChange('companySize', size.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    localFilters.companySize === size.value
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Work Arrangement */}
          <div>
            <div className="flex items-center mb-3">
              <MapPin className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Work Arrangement</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {workArrangements.map((arrangement) => (
                <button
                  key={arrangement.value}
                  onClick={() => handleFilterChange('workArrangement', arrangement.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    localFilters.workArrangement === arrangement.value
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {arrangement.label}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <div className="flex items-center mb-3">
              <Briefcase className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Experience Level</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleFilterChange('experienceLevel', level.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    localFilters.experienceLevel === level.value
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Industry */}
          <div>
            <div className="flex items-center mb-3">
              <Building2 className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Industry</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {industries.map((industry) => (
                <button
                  key={industry.value}
                  onClick={() => handleFilterChange('industry', industry.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    localFilters.industry === industry.value
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {industry.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center mb-3">
              <Users className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Required Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    localFilters.skills.includes(skill)
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Application Deadline */}
          <div>
            <div className="flex items-center mb-3">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Application Deadline</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'Any', value: '' },
                { label: 'This Week', value: 'week' },
                { label: 'This Month', value: 'month' },
                { label: 'Next 3 Months', value: 'quarter' }
              ].map((deadline) => (
                <button
                  key={deadline.value}
                  onClick={() => handleFilterChange('applicationDeadline', deadline.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    localFilters.applicationDeadline === deadline.value
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {deadline.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center mb-3">
              <MapPin className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Location</h3>
            </div>
            <input
              type="text"
              placeholder="Enter city or country..."
              value={localFilters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={clearAllFilters}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Clear All Filters
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-outline"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
