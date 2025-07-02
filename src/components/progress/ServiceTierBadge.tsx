
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Sparkles } from 'lucide-react';

interface ServiceTierBadgeProps {
  tier?: string | null;
  className?: string;
}

export const ServiceTierBadge: React.FC<ServiceTierBadgeProps> = ({ tier, className = '' }) => {
  const getServiceTierConfig = (serviceTier?: string | null) => {
    switch (serviceTier) {
      case 'buyer_elite':
      case 'listing_elite':
        return {
          label: 'Elite',
          className: 'bg-violet-100 text-violet-800 border-violet-300',
          icon: <Star className="h-3 w-3" />
        };
      case 'white_glove_buyer':
      case 'white_glove_listing':
        return {
          label: 'White Glove',
          className: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <Crown className="h-3 w-3" />
        };
      default:
        return {
          label: 'Core',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <Sparkles className="h-3 w-3" />
        };
    }
  };

  const config = getServiceTierConfig(tier);

  return (
    <Badge className={`${config.className} ${className} flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};
