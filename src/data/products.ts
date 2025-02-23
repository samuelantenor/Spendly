// This file now serves as types only, data comes from Supabase
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

export interface Category {
  id: string;
  name: string;
}