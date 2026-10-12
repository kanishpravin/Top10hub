export type PricingType = 'free' | 'freemium' | 'paid';
export type ToolStatus = 'pending' | 'approved' | 'rejected' | 'dead';
export type UserRole = 'user' | 'admin';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  list_count?: number;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  url: string;
  description: string;
  logo_url: string;
  pricing: PricingType;
  source: 'gemini' | 'github' | 'hackernews' | 'producthunt' | 'user' | 'curated';
  score: number; // 0 - 100
  upvotes: number;
  last_checked: string;
  status: ToolStatus;
  category_id?: string;
  popularity?: number;
  created_at?: string;
}

export interface ListItem {
  list_id: string;
  tool_id: string;
  rank: number; // 1 - 10
  tool?: Tool;
}

export interface List {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  description: string;
  view_count: number;
  updated_at: string;
  category?: Category;
  items?: ListItem[];
  is_trending?: boolean;
  is_new?: boolean;
}

export interface ToolStaging {
  id: string;
  name: string;
  slug: string;
  url: string;
  description: string;
  logo_url: string;
  pricing: PricingType;
  source: string;
  score: number;
  category_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  submitter_email?: string;
  notes?: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface FetchLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  source?: string;
}
