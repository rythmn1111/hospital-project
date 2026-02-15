export interface ItemCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Item {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  unit: string | null;
  price: number | null;
  is_active: boolean;
  created_at: string;
}
