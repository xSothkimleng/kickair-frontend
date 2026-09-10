export interface Service {
  id: string;
  title: string;
  category: string;
  tint: string;
  tintBg: string;
  seller: string;
  pro: boolean;
  rating: number;
  reviews: number;
  price: number;
  days: number;
}

export const CATEGORIES = [
  "All", "Design", "Development", "Marketing", "Video & Motion", "Writing",
  "Business", "Translation", "Tutoring", "Photography", "Music & Audio",
];

export const SERVICES: Service[] = [
  { id: "1", title: "Design a memorable brand identity and logo system", category: "Design", tint: "var(--v2-accent)", tintBg: "var(--v2-accentTint)", seller: "Sokha Chan", pro: true, rating: 4.9, reviews: 128, price: 120, days: 3 },
  { id: "2", title: "Build a fast Next.js website with a CMS you can edit", category: "Development", tint: "var(--v2-secure)", tintBg: "var(--v2-secureTint)", seller: "Dara Pich", pro: true, rating: 5.0, reviews: 94, price: 340, days: 7 },
  { id: "3", title: "Run your Facebook and Instagram ads for a month", category: "Marketing", tint: "var(--v2-attention)", tintBg: "var(--v2-attentionTint)", seller: "Bopha Sok", pro: false, rating: 4.8, reviews: 210, price: 80, days: 30 },
  { id: "4", title: "Edit your footage into a sharp 60-second promo", category: "Video & Motion", tint: "var(--v2-danger)", tintBg: "var(--v2-dangerTint)", seller: "Rithy Nou", pro: false, rating: 4.9, reviews: 76, price: 150, days: 4 },
  { id: "5", title: "Translate documents between Khmer and English", category: "Translation", tint: "var(--v2-success)", tintBg: "var(--v2-successTint)", seller: "Chantrea Ly", pro: true, rating: 5.0, reviews: 302, price: 45, days: 2 },
  { id: "6", title: "Shoot clean product photography for your store", category: "Photography", tint: "var(--v2-accent)", tintBg: "var(--v2-accentTint)", seller: "Vuthy Meas", pro: false, rating: 4.7, reviews: 58, price: 200, days: 5 },
  { id: "7", title: "Write website copy that actually sounds like you", category: "Writing", tint: "var(--v2-secure)", tintBg: "var(--v2-secureTint)", seller: "Sreyna Kim", pro: false, rating: 4.8, reviews: 141, price: 90, days: 3 },
  { id: "8", title: "Set up your books and monthly bookkeeping", category: "Business", tint: "var(--v2-attention)", tintBg: "var(--v2-attentionTint)", seller: "Panha Tep", pro: true, rating: 4.9, reviews: 67, price: 260, days: 10 },
  { id: "9", title: "Teach conversational English, one hour a week", category: "Tutoring", tint: "var(--v2-success)", tintBg: "var(--v2-successTint)", seller: "Malis Oum", pro: false, rating: 5.0, reviews: 189, price: 25, days: 1 },
];

export const FILTERS = [
  { label: "Delivery time", options: ["Any", "24 hours", "3 days", "7 days"] },
  { label: "Budget", options: ["Any", "Under $50", "$50–$200", "$200+"] },
  { label: "Seller level", options: ["Any", "Kick Air Pro", "Verified"] },
];
