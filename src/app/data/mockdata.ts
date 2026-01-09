import { additionalFreelancers } from "./additionalFreelancers";

export interface PricingTier {
  name: "Basic" | "Standard" | "Premium";
  price: number;
  deliveryDays: number;
  revisions: number;
  features: string[];
  isPopular?: boolean;
}

export interface Freelancer {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviewCount: number;
  bio: string;
  profileImage: string;
  category: string;
  tiers: PricingTier[];
  title: string;
  skills: string[];
  region?: string;
  languages?: string[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "design",
    name: "Design",
    description: "Visual identity and brand design",
    icon: "Palette",
  },
  {
    id: "development",
    name: "Development",
    description: "Web and mobile applications",
    icon: "Code",
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Growth and digital marketing",
    icon: "TrendingUp",
  },
  {
    id: "video",
    name: "Video & Motion",
    description: "Video editing and animation",
    icon: "Video",
  },
  {
    id: "writing",
    name: "Writing",
    description: "Content and copywriting",
    icon: "PenTool",
  },
  {
    id: "business",
    name: "Business & Consulting",
    description: "Strategy and business advice",
    icon: "Briefcase",
  },
  {
    id: "translation",
    name: "Translation & Languages",
    description: "Document and content translation",
    icon: "Languages",
  },
  {
    id: "tutoring",
    name: "Tutoring & Education",
    description: "Teaching and training services",
    icon: "GraduationCap",
  },
  {
    id: "photography",
    name: "Photography",
    description: "Professional photography services",
    icon: "Camera",
  },
  {
    id: "music",
    name: "Music & Audio",
    description: "Music production and audio editing",
    icon: "Music",
  },
  {
    id: "admin",
    name: "Admin & Support",
    description: "Virtual assistance and data entry",
    icon: "FileText",
  },
  {
    id: "construction",
    name: "Construction & Trades",
    description: "Building and repair services",
    icon: "Hammer",
  },
];

export const freelancers: Freelancer[] = [
  {
    id: "1",
    name: "Sopheak Chan",
    role: "Brand Designer",
    title: "Brand Designer",
    rating: 5.0,
    reviewCount: 127,
    bio: "Crafting memorable brands with clarity and precision.",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    category: "design",
    skills: ["Branding", "Logo Design", "Brand Identity", "Adobe Illustrator"],
    region: "Phnom Penh",
    languages: ["Khmer", "English"],
    tiers: [
      {
        name: "Basic",
        price: 50,
        deliveryDays: 3,
        revisions: 2,
        features: ["Logo design", "Source files", "2 revisions"],
      },
      {
        name: "Standard",
        price: 120,
        deliveryDays: 5,
        revisions: 4,
        features: ["Logo + brand guide", "Social media kit", "4 revisions", "Priority support"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 250,
        deliveryDays: 7,
        revisions: -1,
        features: ["Full brand identity", "All file formats", "Unlimited revisions", "24/7 priority support"],
      },
    ],
  },
  {
    id: "2",
    name: "Dara Sok",
    role: "Full-Stack Developer",
    title: "Full-Stack Developer",
    rating: 4.9,
    reviewCount: 94,
    bio: "Building scalable web applications with modern tech.",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    category: "development",
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    region: "Siem Reap",
    languages: ["Khmer", "English", "French"],
    tiers: [
      {
        name: "Basic",
        price: 100,
        deliveryDays: 5,
        revisions: 1,
        features: ["Landing page", "Responsive design", "1 revision"],
      },
      {
        name: "Standard",
        price: 300,
        deliveryDays: 10,
        revisions: 3,
        features: ["Multi-page website", "CMS integration", "3 revisions", "SEO optimization"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 800,
        deliveryDays: 20,
        revisions: -1,
        features: ["Full web application", "Database setup", "Unlimited revisions", "Ongoing support"],
      },
    ],
  },
  {
    id: "3",
    name: "Mealea Pich",
    role: "Content Strategist",
    title: "Content Strategist",
    rating: 5.0,
    reviewCount: 156,
    bio: "Strategic storytelling that connects and converts.",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    category: "marketing",
    skills: ["Content Strategy", "SEO", "Copywriting", "Social Media"],
    region: "Phnom Penh",
    languages: ["Khmer", "English"],
    tiers: [
      {
        name: "Basic",
        price: 75,
        deliveryDays: 3,
        revisions: 2,
        features: ["Content audit", "1 strategy document", "2 revisions"],
      },
      {
        name: "Standard",
        price: 180,
        deliveryDays: 7,
        revisions: 3,
        features: ["Full content strategy", "Editorial calendar", "SEO keywords", "3 revisions"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 400,
        deliveryDays: 14,
        revisions: -1,
        features: ["Complete marketing plan", "Competitor analysis", "Monthly consulting", "Unlimited revisions"],
      },
    ],
  },
  {
    id: "4",
    name: "Vibol Ly",
    role: "Video Editor",
    title: "Video Editor",
    rating: 4.8,
    reviewCount: 83,
    bio: "Transforming raw footage into compelling stories.",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    category: "video",
    skills: ["Video Editing", "Adobe Premiere", "Color Grading", "Motion Graphics"],
    region: "Battambang",
    languages: ["Khmer", "English"],
    tiers: [
      {
        name: "Basic",
        price: 80,
        deliveryDays: 3,
        revisions: 2,
        features: ["1-2 minute video", "Basic editing", "2 revisions"],
      },
      {
        name: "Standard",
        price: 200,
        deliveryDays: 5,
        revisions: 3,
        features: ["3-5 minute video", "Color grading", "Sound design", "3 revisions"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 500,
        deliveryDays: 10,
        revisions: -1,
        features: ["10+ minute video", "Motion graphics", "Full post-production", "Unlimited revisions"],
      },
    ],
  },
  ...additionalFreelancers,
];

// Additional filter data
export const regions = [
  "Phnom Penh",
  "Siem Reap",
  "Battambang",
  "Sihanoukville",
  "Kampong Cham",
  "Kampot",
  "Kep",
  "Prey Veng",
  "Remote",
];

export const languages = [
  "Khmer",
  "English",
  "French",
  "Chinese",
  "Japanese",
  "Thai",
  "Vietnamese",
  "Korean",
  "Spanish",
  "German",
];

export const budgetRanges = [
  { id: "budget-1", label: "Under $50", min: 0, max: 50 },
  { id: "budget-2", label: "$50 - $100", min: 50, max: 100 },
  { id: "budget-3", label: "$100 - $250", min: 100, max: 250 },
  { id: "budget-4", label: "$250 - $500", min: 250, max: 500 },
  { id: "budget-5", label: "$500+", min: 500, max: 999999 },
];

// Job postings data
export interface JobPosting {
  id: string;
  title: string;
  company: string;
  category: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Freelance";
  budget: number;
  description: string;
  requirements: string[];
  postedDate: string;
}

export const jobPostings: JobPosting[] = [
  {
    id: "job-1",
    title: "Senior UI/UX Designer",
    company: "TechCo Cambodia",
    category: "design",
    location: "Phnom Penh",
    type: "Full-time",
    budget: 800,
    description: "We are looking for an experienced UI/UX designer to join our growing team.",
    requirements: ["5+ years experience", "Figma proficiency", "Portfolio required"],
    postedDate: "2024-12-20",
  },
  {
    id: "job-2",
    title: "React Developer",
    company: "StartupXYZ",
    category: "development",
    location: "Remote",
    type: "Contract",
    budget: 1200,
    description: "Build modern web applications using React and TypeScript.",
    requirements: ["React expertise", "TypeScript", "3+ years experience"],
    postedDate: "2024-12-21",
  },
  {
    id: "job-3",
    title: "Content Writer",
    company: "Digital Agency",
    category: "writing",
    location: "Siem Reap",
    type: "Part-time",
    budget: 400,
    description: "Create engaging content for our clients across various industries.",
    requirements: ["Excellent English", "SEO knowledge", "Portfolio of work"],
    postedDate: "2024-12-22",
  },
  {
    id: "job-4",
    title: "Video Production Specialist",
    company: "Media House KH",
    category: "video",
    location: "Phnom Penh",
    type: "Full-time",
    budget: 600,
    description: "Produce high-quality video content for social media and marketing campaigns.",
    requirements: ["Adobe Premiere", "After Effects", "Camera operation"],
    postedDate: "2024-12-23",
  },
];
