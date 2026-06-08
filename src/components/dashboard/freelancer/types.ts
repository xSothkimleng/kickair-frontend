export interface Service {
  id: number;
  title: string;
  category: string;
  status: string;
  orders?: number;
  pricing?: {
    basic: number;
    standard: number;
    premium: number;
  };
  lastEdited?: string;
}

export interface PricingTier {
  id?: number; // present when editing an existing tier — lets the backend upsert in place
  enabled: boolean;
  name: string;
  description: string;
  revisions: string;
  deliveryTime: string;
  price: string;
}

export interface CustomOrdersData {
  enabled: boolean;
  acceptHourlyRate: boolean;
  hourlyRate: string;
  minimumBudget: string;
  customInstructions: string;
}

export interface Requirement {
  question: string;
  type: string;
  required: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ServiceFormData {
  title: string;
  categoryId: number | null;
  // Set instead of categoryId when the user requests a brand-new category.
  requestedCategory: string | null;
  requestedParentId: number | null;
  searchTags: string[];
  description: string;
  location: string;
  pricing: {
    basic: PricingTier;
    standard: PricingTier;
    premium: PricingTier;
  };
  customOrders: CustomOrdersData;
  requirements: Requirement[];
  faqs: FAQ[];
  agreeToTerms: boolean;
}

export const CATEGORIES = [
  "Graphics & Design",
  "Web Development",
  "Mobile Development",
  "Digital Marketing",
  "Writing & Translation",
  "Video & Animation",
  "Music & Audio",
  "Business & Consulting",
];
