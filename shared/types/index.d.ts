export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'intern' | 'company' | 'admin';
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface InternProfile extends User {
    role: 'intern';
    university?: string;
    major?: string;
    graduationYear?: number;
    skills: string[];
    interests: string[];
    experience?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
}
export interface CompanyProfile extends User {
    role: 'company';
    companyName: string;
    description: string;
    website?: string;
    industry: string;
    size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    location: string;
    logoUrl?: string;
    linkedinUrl?: string;
    verified: boolean;
}
export interface Internship {
    id: string;
    companyId: string;
    title: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    duration: number;
    startDate: Date;
    endDate: Date;
    location: string;
    remote: boolean;
    paid: boolean;
    compensation?: {
        amount: number;
        currency: string;
        type: 'hourly' | 'monthly' | 'stipend';
    };
    category: string;
    skills: string[];
    applicationDeadline: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    company?: CompanyProfile;
}
export interface Application {
    id: string;
    internId: string;
    internshipId: string;
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
    coverLetter?: string;
    resumeUrl?: string;
    appliedAt: Date;
    reviewedAt?: Date;
    notes?: string;
    intern?: InternProfile;
    internship?: Internship;
}
export interface Review {
    id: string;
    internId: string;
    companyId: string;
    internshipId?: string;
    rating: number;
    title: string;
    content: string;
    pros: string[];
    cons: string[];
    wouldRecommend: boolean;
    createdAt: Date;
    intern?: InternProfile;
    company?: CompanyProfile;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface InternshipFilters {
    search?: string;
    location?: string;
    category?: string;
    paid?: boolean;
    remote?: boolean;
    duration?: {
        min?: number;
        max?: number;
    };
    skills?: string[];
    companySize?: string[];
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'startDate' | 'compensation' | 'title';
    sortOrder?: 'asc' | 'desc';
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'intern' | 'company';
}
export interface AuthResponse {
    user: User;
    token: string;
}
export interface InternshipFormData {
    title: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    duration: number;
    startDate: string;
    endDate: string;
    location: string;
    remote: boolean;
    paid: boolean;
    compensation?: {
        amount: number;
        currency: string;
        type: 'hourly' | 'monthly' | 'stipend';
    };
    category: string;
    skills: string[];
    applicationDeadline: string;
}
export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    features: string[];
    limits: Record<string, number>;
}
export interface Subscription {
    plan: SubscriptionPlan;
    status: string;
    current_period_end: string | null;
}
export interface FeatureUsage {
    used: number;
    limit: number;
    remaining: number;
}
//# sourceMappingURL=index.d.ts.map