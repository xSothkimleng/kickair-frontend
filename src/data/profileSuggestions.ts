// Curated seed suggestions for the freelancer profile editor (education + certifications).
// Merged at runtime with the community values returned from GET /api/profile-suggestions,
// so the typeahead is useful from day one and grows as freelancers add entries.

export const SEED_SCHOOLS = [
  "Royal University of Phnom Penh",
  "Institute of Technology of Cambodia",
  "Royal University of Law and Economics",
  "National University of Management",
  "American University of Phnom Penh",
  "Paragon International University",
  "University of Cambodia",
  "Norton University",
  "Pannasastra University of Cambodia",
  "Build Bright University",
  "Royal University of Fine Arts",
  "Limkokwing University of Creative Technology",
  "CamEd Business School",
  "Cambodia Academy of Digital Technology",
];

export const SEED_DEGREES = [
  "Bachelor of Computer Science",
  "Bachelor of Information Technology",
  "Bachelor of Software Engineering",
  "Bachelor of Business Administration",
  "Bachelor of Marketing",
  "Bachelor of Finance and Banking",
  "Bachelor of Accounting",
  "Bachelor of Graphic Design",
  "Bachelor of Arts in English",
  "Bachelor of Media and Communication",
  "Master of Business Administration",
  "Master of Information Technology",
  "Associate Degree in Web Development",
  "High School Diploma",
];

export const SEED_CERT_ISSUERS = [
  "Google",
  "Coursera",
  "Udemy",
  "Amazon Web Services (AWS)",
  "Microsoft",
  "Meta",
  "LinkedIn Learning",
  "Adobe",
  "HubSpot Academy",
  "Cisco",
  "IBM",
  "freeCodeCamp",
  "edX",
  "DataCamp",
];

export const SEED_CERT_NAMES = [
  "Google UX Design Professional Certificate",
  "Google Data Analytics Professional Certificate",
  "Google Digital Marketing & E-commerce",
  "Meta Front-End Developer",
  "Meta Social Media Marketing",
  "AWS Certified Cloud Practitioner",
  "Microsoft Office Specialist",
  "Adobe Certified Professional",
  "HubSpot Content Marketing",
  "HubSpot Inbound Marketing",
  "Cisco CCNA",
  "freeCodeCamp Responsive Web Design",
];

export interface ProfileSuggestions {
  schools: string[];
  degrees: string[];
  cert_names: string[];
  cert_issuers: string[];
}

/** Merge seed + community values into a de-duplicated, sorted option list. */
export function mergeSuggestions(seed: string[], community: string[]): string[] {
  return Array.from(new Set([...seed, ...community])).sort((a, b) => a.localeCompare(b));
}
