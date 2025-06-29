
import { ServiceTier } from '@/types/serviceTiers';

export const SERVICE_TIER_CONFIG: ServiceTier[] = [
  // Buyer Tiers
  {
    id: 'buyer_core',
    name: 'Core Buyer Service',
    description: 'Essential services for a smooth buying experience',
    price: 2500,
    type: 'buyer',
    level: 'core',
    features: [
      { name: 'Basic transaction coordination', description: 'Professional oversight of your transaction', included: true },
      { name: 'Document management', description: 'Secure storage and organization', included: true },
      { name: 'Email communication', description: 'Regular updates and notifications', included: true },
      { name: 'Timeline tracking', description: 'Monitor important milestones', included: true },
      { name: 'Premium marketing materials', description: 'Enhanced promotional content', included: false },
      { name: 'Professional photography coordination', description: 'High-quality property photos', included: false },
      { name: 'Branded social media posts', description: 'Custom social media content', included: false },
      { name: 'Custom welcome guides', description: 'Personalized buyer guides', included: false },
      { name: 'Dedicated concierge service', description: '24/7 personal assistance', included: false },
      { name: 'Lockbox management', description: 'Professional lockbox coordination', included: false },
      { name: 'Welcome home celebrations', description: 'Special home closing events', included: false },
      { name: 'Handwritten follow-up cards', description: 'Personal touch communications', included: false },
      { name: 'Priority support', description: 'First-class customer service', included: false }
    ]
  },
  {
    id: 'buyer_elite',
    name: 'Elite Buyer Service',
    description: 'Premium services with enhanced marketing and support',
    price: 4500,
    type: 'buyer',
    level: 'elite',
    isPopular: true,
    features: [
      { name: 'Basic transaction coordination', description: 'Professional oversight of your transaction', included: true },
      { name: 'Document management', description: 'Secure storage and organization', included: true },
      { name: 'Email communication', description: 'Regular updates and notifications', included: true },
      { name: 'Timeline tracking', description: 'Monitor important milestones', included: true },
      { name: 'Premium marketing materials', description: 'Enhanced promotional content', included: true },
      { name: 'Professional photography coordination', description: 'High-quality property photos', included: true },
      { name: 'Branded social media posts', description: 'Custom social media content', included: true },
      { name: 'Custom welcome guides', description: 'Personalized buyer guides', included: true },
      { name: 'Dedicated concierge service', description: '24/7 personal assistance', included: false },
      { name: 'Lockbox management', description: 'Professional lockbox coordination', included: false },
      { name: 'Welcome home celebrations', description: 'Special home closing events', included: false },
      { name: 'Handwritten follow-up cards', description: 'Personal touch communications', included: false },
      { name: 'Priority support', description: 'First-class customer service', included: false }
    ]
  },
  {
    id: 'white_glove_buyer',
    name: 'White Glove Buyer Service',
    description: 'Ultimate luxury experience with full-service concierge',
    price: 7500,
    type: 'buyer',
    level: 'white_glove',
    features: [
      { name: 'Basic transaction coordination', description: 'Professional oversight of your transaction', included: true },
      { name: 'Document management', description: 'Secure storage and organization', included: true },
      { name: 'Email communication', description: 'Regular updates and notifications', included: true },
      { name: 'Timeline tracking', description: 'Monitor important milestones', included: true },
      { name: 'Premium marketing materials', description: 'Enhanced promotional content', included: true },
      { name: 'Professional photography coordination', description: 'High-quality property photos', included: true },
      { name: 'Branded social media posts', description: 'Custom social media content', included: true },
      { name: 'Custom welcome guides', description: 'Personalized buyer guides', included: true },
      { name: 'Dedicated concierge service', description: '24/7 personal assistance', included: true },
      { name: 'Lockbox management', description: 'Professional lockbox coordination', included: true },
      { name: 'Welcome home celebrations', description: 'Special home closing events', included: true },
      { name: 'Handwritten follow-up cards', description: 'Personal touch communications', included: true },
      { name: 'Priority support', description: 'First-class customer service', included: true }
    ]
  },
  // Seller Tiers
  {
    id: 'listing_core',
    name: 'Core Listing Service',
    description: 'Essential services for effective property listing',
    price: 3000,
    type: 'seller',
    level: 'core',
    features: [
      { name: 'Basic transaction coordination', description: 'Professional oversight of your transaction', included: true },
      { name: 'Document management', description: 'Secure storage and organization', included: true },
      { name: 'Email communication', description: 'Regular updates and notifications', included: true },
      { name: 'Timeline tracking', description: 'Monitor important milestones', included: true },
      { name: 'Premium marketing materials', description: 'Enhanced promotional content', included: false },
      { name: 'Professional photography coordination', description: 'High-quality property photos', included: false },
      { name: 'Branded social media posts', description: 'Custom social media content', included: false },
      { name: 'Custom welcome guides', description: 'Personalized seller guides', included: false },
      { name: 'Dedicated concierge service', description: '24/7 personal assistance', included: false },
      { name: 'Lockbox management', description: 'Professional lockbox coordination', included: false },
      { name: 'Welcome home celebrations', description: 'Special closing events', included: false },
      { name: 'Handwritten follow-up cards', description: 'Personal touch communications', included: false },
      { name: 'Priority support', description: 'First-class customer service', included: false }
    ]
  },
  {
    id: 'listing_elite',
    name: 'Elite Listing Service',
    description: 'Premium listing services with enhanced marketing',
    price: 5500,
    type: 'seller',
    level: 'elite',
    isPopular: true,
    features: [
      { name: 'Basic transaction coordination', description: 'Professional oversight of your transaction', included: true },
      { name: 'Document management', description: 'Secure storage and organization', included: true },
      { name: 'Email communication', description: 'Regular updates and notifications', included: true },
      { name: 'Timeline tracking', description: 'Monitor important milestones', included: true },
      { name: 'Premium marketing materials', description: 'Enhanced promotional content', included: true },
      { name: 'Professional photography coordination', description: 'High-quality property photos', included: true },
      { name: 'Branded social media posts', description: 'Custom social media content', included: true },
      { name: 'Custom welcome guides', description: 'Personalized seller guides', included: true },
      { name: 'Dedicated concierge service', description: '24/7 personal assistance', included: false },
      { name: 'Lockbox management', description: 'Professional lockbox coordination', included: false },
      { name: 'Welcome home celebrations', description: 'Special closing events', included: false },
      { name: 'Handwritten follow-up cards', description: 'Personal touch communications', included: false },
      { name: 'Priority support', description: 'First-class customer service', included: false }
    ]
  },
  {
    id: 'white_glove_listing',
    name: 'White Glove Listing Service',
    description: 'Ultimate luxury listing experience with full concierge',
    price: 8500,
    type: 'seller',
    level: 'white_glove',
    features: [
      { name: 'Basic transaction coordination', description: 'Professional oversight of your transaction', included: true },
      { name: 'Document management', description: 'Secure storage and organization', included: true },
      { name: 'Email communication', description: 'Regular updates and notifications', included: true },
      { name: 'Timeline tracking', description: 'Monitor important milestones', included: true },
      { name: 'Premium marketing materials', description: 'Enhanced promotional content', included: true },
      { name: 'Professional photography coordination', description: 'High-quality property photos', included: true },
      { name: 'Branded social media posts', description: 'Custom social media content', included: true },
      { name: 'Custom welcome guides', description: 'Personalized seller guides', included: true },
      { name: 'Dedicated concierge service', description: '24/7 personal assistance', included: true },
      { name: 'Lockbox management', description: 'Professional lockbox coordination', included: true },
      { name: 'Welcome home celebrations', description: 'Special closing events', included: true },
      { name: 'Handwritten follow-up cards', description: 'Personal touch communications', included: true },
      { name: 'Priority support', description: 'First-class customer service', included: true }
    ]
  }
];

export const getServiceTierById = (id: string) => {
  return SERVICE_TIER_CONFIG.find(tier => tier.id === id);
};

export const getServiceTiersByType = (type: 'buyer' | 'seller') => {
  return SERVICE_TIER_CONFIG.filter(tier => tier.type === type);
};

export const getTierPricing = (tierId: string): number => {
  const tier = getServiceTierById(tierId);
  return tier?.price || 0;
};

export const getFeaturesByTier = (tierId: string): string[] => {
  const tier = getServiceTierById(tierId);
  return tier?.features.filter(f => f.included).map(f => f.name) || [];
};

export const calculateTotalCost = (tierId: string, addOns: string[] = []): number => {
  const baseCost = getTierPricing(tierId);
  // Add-on costs could be implemented here based on specific add-on pricing
  return baseCost;
};
