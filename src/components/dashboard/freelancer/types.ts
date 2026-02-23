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

export const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    height: 44,
    borderRadius: 3,
    bgcolor: "white",
    fontSize: 13,
    "& fieldset": {
      borderColor: "rgba(0, 0, 0, 0.1)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0, 0, 0, 0.2)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(0, 0, 0, 0.2)",
      borderWidth: 1,
    },
  },
};

export const smallTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    height: 36,
    borderRadius: 2,
    bgcolor: "white",
    fontSize: 12,
    "& fieldset": {
      borderColor: "rgba(0, 0, 0, 0.1)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0, 0, 0, 0.2)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(0, 0, 0, 0.2)",
      borderWidth: 1,
    },
  },
};

export const textareaSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    bgcolor: "white",
    fontSize: 13,
    "& fieldset": {
      borderColor: "rgba(0, 0, 0, 0.1)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0, 0, 0, 0.2)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(0, 0, 0, 0.2)",
      borderWidth: 1,
    },
  },
};

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
