
export type ServiceTierType = 
  | 'buyer_core' 
  | 'buyer_elite' 
  | 'white_glove_buyer'
  | 'listing_core' 
  | 'listing_elite' 
  | 'white_glove_listing';

export interface ServiceTierFeature {
  name: string;
  description: string;
  included: boolean;
}

export interface ServiceTier {
  id: ServiceTierType;
  name: string;
  description: string;
  price: number;
  type: 'buyer' | 'seller';
  level: 'core' | 'elite' | 'white_glove';
  features: ServiceTierFeature[];
  isPopular?: boolean;
}

export interface TransactionServiceDetails {
  id: string;
  transaction_id: string;
  selected_features: string[];
  base_service_fee: number;
  total_service_cost: number;
  add_ons: string[];
  created_at: string;
  updated_at: string;
}
