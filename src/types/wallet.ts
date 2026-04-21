export interface Wallet {
  id: number;
  user_id: number;
  available_balance: string;
  available_balance_raw: string;
  pending_balance: string;
  pending_balance_raw: string;
  total_earnings: string;
  total_earnings_raw: string;
  total_spent: string;
  total_spent_raw: string;
  total_balance: string;
  total_balance_raw: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionMetadata {
  service_title?: string;
  pricing_option_title?: string;
  source?: string;
  [key: string]: string | undefined;
}

export interface TransactionOrder {
  id: number;
  pricing_option_id: number;
  client_profile_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  pricing_option?: {
    id: number;
    service_id: number;
    title: string;
    description: string;
    price: string;
    price_raw: string;
    revisions: number | null;
    delivery_time: number | null;
    created_at: string;
    updated_at: string;
    service?: {
      id: number;
      freelancer_profile_id: number;
      category_id: number;
      title: string;
      description: string | null;
      search_tags: string | null;
      location: string;
      orders_count: number;
      faqs: unknown[];
      created_at: string;
      updated_at: string;
      freelancer_profile?: {
        id: number;
        user_id: number;
        education: string;
        certification: string;
        created_at: string;
        updated_at: string;
      };
    };
  };
  service?: {
    id: number;
    freelancer_profile_id: number;
    category_id: number;
    title: string;
    description: string | null;
    search_tags: string | null;
    location: string;
    orders_count: number;
    faqs: unknown[];
    created_at: string;
    updated_at: string;
    freelancer_profile?: {
      id: number;
      user_id: number;
      education: string;
      certification: string;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface Transaction {
  id: number;
  wallet_id: number;
  order_id: number | null;
  type: "payment" | "deposit" | "withdrawal" | "refund" | "escrow" | "earning";
  amount: string;
  amount_raw: string;
  balance_after: string;
  balance_after_raw: string;
  status: "completed" | "pending" | "failed";
  description: string;
  metadata: TransactionMetadata;
  created_at: string;
  updated_at: string;
  order: TransactionOrder | null;
}