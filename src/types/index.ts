export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  is_flash_deal?: boolean;
  flash_deal_end?: string | null;
  discount_percentage?: number | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  earned_at?: string;
}

export interface UserStats {
  points: number;
  total_spent: number;
  total_saved: number;
  current_streak: number;
  longest_streak: number;
  last_purchase_date: string | null;
}

export interface User {
  id: string;
  email: string;
  stats?: UserStats;
  achievements?: Achievement[];
}