// Course Recommendation Service
// Analyzes job requirements and suggests relevant courses

interface JobRequirement {
  skills: string[]
  technologies: string[]
  experience: string
  education: string
  description: string
}

interface CourseRecommendation {
  title: string
  platform: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  url: string
  relevance: number
  skills: string[]
  price: string
  rating: number
}

// Course database - in a real app, this would be fetched from an API
const COURSE_DATABASE: CourseRecommendation[] = [
  // Programming Languages
  {
    title: 'JavaScript Algorithms and Data Structures',
    platform: 'freeCodeCamp',
    duration: '40 hours',
    difficulty: 'Beginner',
    url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
    relevance: 0,
    skills: ['javascript', 'programming', 'web development'],
    price: 'Free',
    rating: 4.8
  },
  {
    title: 'Python for Data Science',
    platform: 'Coursera',
    duration: '35 hours',
    difficulty: 'Intermediate',
    url: 'https://www.coursera.org/learn/python-data-science',
    relevance: 0,
    skills: ['python', 'data science', 'machine learning'],
    price: '$49/month',
    rating: 4.7
  },
  {
    title: 'Java Programming',
    platform: 'Udemy',
    duration: '50 hours',
    difficulty: 'Beginner',
    url: 'https://udemy.com/course/java-programming-tutorial/',
    relevance: 0,
    skills: ['java', 'programming', 'object-oriented'],
    price: '$89.99',
    rating: 4.6
  },

  // Web Development
  {
    title: 'React Development',
    platform: 'Coursera',
    duration: '20 hours',
    difficulty: 'Intermediate',
    url: 'https://www.coursera.org/learn/react',
    relevance: 0,
    skills: ['react', 'javascript', 'frontend', 'web development'],
    price: '$49/month',
    rating: 4.7
  },
  {
    title: 'Node.js Backend Development',
    platform: 'Udemy',
    duration: '30 hours',
    difficulty: 'Intermediate',
    url: 'https://udemy.com/course/nodejs-backend-development/',
    relevance: 0,
    skills: ['nodejs', 'javascript', 'backend', 'api'],
    price: '$94.99',
    rating: 4.5
  },
  {
    title: 'Full Stack Web Development',
    platform: 'freeCodeCamp',
    duration: '300 hours',
    difficulty: 'Intermediate',
    url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    relevance: 0,
    skills: ['html', 'css', 'javascript', 'react', 'nodejs', 'mongodb'],
    price: 'Free',
    rating: 4.9
  },

  // Data Science & Analytics
  {
    title: 'Data Science with Python',
    platform: 'Coursera',
    duration: '60 hours',
    difficulty: 'Intermediate',
    url: 'https://coursera.org/learn/data-science-python',
    relevance: 0,
    skills: ['python', 'data science', 'pandas', 'numpy', 'matplotlib'],
    price: '$49/month',
    rating: 4.8
  },
  {
    title: 'Machine Learning Fundamentals',
    platform: 'Coursera',
    duration: '45 hours',
    difficulty: 'Advanced',
    url: 'https://coursera.org/learn/machine-learning',
    relevance: 0,
    skills: ['machine learning', 'python', 'scikit-learn', 'tensorflow'],
    price: '$49/month',
    rating: 4.9
  },
  {
    title: 'SQL for Data Analysis',
    platform: 'Udemy',
    duration: '25 hours',
    difficulty: 'Beginner',
    url: 'https://udemy.com/course/sql-for-data-analysis/',
    relevance: 0,
    skills: ['sql', 'database', 'data analysis'],
    price: '$79.99',
    rating: 4.6
  },

  // Design & UX
  {
    title: 'UI/UX Design Fundamentals',
    platform: 'Coursera',
    duration: '40 hours',
    difficulty: 'Beginner',
    url: 'https://coursera.org/learn/ui-ux-design',
    relevance: 0,
    skills: ['ui design', 'ux design', 'figma', 'user research'],
    price: '$49/month',
    rating: 4.7
  },
  {
    title: 'Adobe Creative Suite',
    platform: 'LinkedIn Learning',
    duration: '35 hours',
    difficulty: 'Intermediate',
    url: 'https://linkedin.com/learning/adobe-creative-suite',
    relevance: 0,
    skills: ['photoshop', 'illustrator', 'indesign', 'graphic design'],
    price: '$29.99/month',
    rating: 4.5
  },

  // Business & Marketing
  {
    title: 'Digital Marketing Fundamentals',
    platform: 'Google Digital Garage',
    duration: '20 hours',
    difficulty: 'Beginner',
    url: 'https://learndigital.withgoogle.com/digitalgarage',
    relevance: 0,
    skills: ['digital marketing', 'seo', 'social media', 'analytics'],
    price: 'Free',
    rating: 4.6
  },
  {
    title: 'Project Management',
    platform: 'Coursera',
    duration: '30 hours',
    difficulty: 'Intermediate',
    url: 'https://coursera.org/learn/project-management',
    relevance: 0,
    skills: ['project management', 'agile', 'scrum', 'leadership'],
    price: '$49/month',
    rating: 4.7
  },

  // Cloud & DevOps
  {
    title: 'AWS Cloud Practitioner',
    platform: 'AWS Training',
    duration: '25 hours',
    difficulty: 'Beginner',
    url: 'https://aws.amazon.com/training/',
    relevance: 0,
    skills: ['aws', 'cloud computing', 'devops'],
    price: 'Free',
    rating: 4.8
  },
  {
    title: 'Docker & Kubernetes',
    platform: 'Udemy',
    duration: '40 hours',
    difficulty: 'Intermediate',
    url: 'https://udemy.com/course/docker-kubernetes/',
    relevance: 0,
    skills: ['docker', 'kubernetes', 'containers', 'devops'],
    price: '$89.99',
    rating: 4.6
  }
]

// Skill mapping for better matching
const SKILL_SYNONYMS: Record<string, string[]> = {
  'javascript': ['js', 'ecmascript', 'nodejs', 'node.js'],
  'python': ['py', 'python3'],
  'react': ['reactjs', 'react.js'],
  'machine learning': ['ml', 'ai', 'artificial intelligence'],
  'data science': ['data analysis', 'analytics'],
  'web development': ['frontend', 'backend', 'full stack'],
  'ui/ux': ['ui', 'ux', 'user interface', 'user experience', 'design'],
  'project management': ['pm', 'agile', 'scrum'],
  'cloud': ['aws', 'azure', 'gcp', 'google cloud'],
  'database': ['sql', 'mysql', 'postgresql', 'mongodb']
}

export class CourseRecommendationService {
  // Extract skills and requirements from job description
  static extractJobRequirements(job: any): JobRequirement {
    const description = (job.description || '').toLowerCase()
    const title = (job.title || '').toLowerCase()
    const requirements = (job.requirements || []).join(' ').toLowerCase()
    
    const allText = `${title} ${description} ${requirements}`
    
    // Extract common skills
    const skills = this.extractSkills(allText)
    const technologies = this.extractTechnologies(allText)
    
    return {
      skills,
      technologies,
      experience: this.extractExperience(allText),
      education: this.extractEducation(allText),
      description: allText
    }
  }

  // Extract skills from text
  private static extractSkills(text: string): string[] {
    const skillKeywords = [
      'javascript', 'python', 'java', 'react', 'nodejs', 'sql', 'html', 'css',
      'machine learning', 'data science', 'ui/ux', 'design', 'marketing',
      'project management', 'leadership', 'communication', 'analytics',
      'cloud', 'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum'
    ]
    
    const foundSkills: string[] = []
    
    skillKeywords.forEach(skill => {
      if (text.includes(skill)) {
        foundSkills.push(skill)
      }
    })
    
    return [...new Set(foundSkills)]
  }

  // Extract technologies from text
  private static extractTechnologies(text: string): string[] {
    const techKeywords = [
      'react', 'angular', 'vue', 'nodejs', 'express', 'mongodb', 'mysql',
      'postgresql', 'redis', 'docker', 'kubernetes', 'aws', 'azure',
      'gcp', 'jenkins', 'git', 'github', 'gitlab', 'jira', 'confluence'
    ]
    
    const foundTech: string[] = []
    
    techKeywords.forEach(tech => {
      if (text.includes(tech)) {
        foundTech.push(tech)
      }
    })
    
    return [...new Set(foundTech)]
  }

  // Extract experience level
  private static extractExperience(text: string): string {
    if (text.includes('senior') || text.includes('lead') || text.includes('5+ years')) {
      return 'senior'
    } else if (text.includes('junior') || text.includes('entry') || text.includes('0-2 years')) {
      return 'junior'
    } else if (text.includes('mid') || text.includes('2-5 years')) {
      return 'mid'
    }
    return 'any'
  }

  // Extract education requirements
  private static extractEducation(text: string): string {
    if (text.includes('phd') || text.includes('doctorate')) {
      return 'phd'
    } else if (text.includes('master') || text.includes('mba')) {
      return 'master'
    } else if (text.includes('bachelor') || text.includes('degree')) {
      return 'bachelor'
    }
    return 'any'
  }

  // Calculate relevance score for a course
  private static calculateRelevance(course: CourseRecommendation, requirements: JobRequirement): number {
    let score = 0
    const maxScore = 100
    
    // Check skill matches
    requirements.skills.forEach(jobSkill => {
      course.skills.forEach(courseSkill => {
        if (courseSkill.toLowerCase().includes(jobSkill.toLowerCase()) || 
            jobSkill.toLowerCase().includes(courseSkill.toLowerCase())) {
          score += 20
        }
      })
    })
    
    // Check technology matches
    requirements.technologies.forEach(tech => {
      if (course.skills.some(skill => skill.toLowerCase().includes(tech.toLowerCase()))) {
        score += 15
      }
    })
    
    // Check for synonyms
    requirements.skills.forEach(jobSkill => {
      const synonyms = SKILL_SYNONYMS[jobSkill] || []
      synonyms.forEach(synonym => {
        if (course.skills.some(skill => skill.toLowerCase().includes(synonym.toLowerCase()))) {
          score += 10
        }
      })
    })
    
    // Bonus for free courses
    if (course.price === 'Free') {
      score += 5
    }
    
    // Bonus for high ratings
    if (course.rating >= 4.7) {
      score += 5
    }
    
    return Math.min(score, maxScore)
  }

  // Get course recommendations for a job
  static getRecommendations(job: any, limit: number = 6): CourseRecommendation[] {
    const requirements = this.extractJobRequirements(job)
    
    // Calculate relevance for all courses
    const coursesWithRelevance = COURSE_DATABASE.map(course => ({
      ...course,
      relevance: this.calculateRelevance(course, requirements)
    }))
    
    // Filter out courses with 0 relevance and sort by relevance
    const relevantCourses = coursesWithRelevance
      .filter(course => course.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit)
    
    return relevantCourses
  }

  // Get skill gap analysis
  static getSkillGapAnalysis(job: any, userSkills: string[] = []): {
    missingSkills: string[]
    recommendedCourses: CourseRecommendation[]
  } {
    const requirements = this.extractJobRequirements(job)
    const jobSkills = [...requirements.skills, ...requirements.technologies]
    
    // Find missing skills
    const missingSkills = jobSkills.filter(skill => 
      !userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    )
    
    // Get recommendations for missing skills
    const recommendedCourses = this.getRecommendations(job, 4)
    
    return {
      missingSkills: [...new Set(missingSkills)],
      recommendedCourses
    }
  }
}

export default CourseRecommendationService
