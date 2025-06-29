
import React, { useState } from 'react';
import { Check, Crown, Star, Shield, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { ServiceTier, ServiceTierType } from '@/types/serviceTiers';
import { getServiceTiersByType } from '@/data/serviceTierConfig';
import { useServiceTierSelection } from '@/hooks/queries/useServiceTierSelection';
import { cn } from '@/lib/utils';

interface ServiceTierSelectorProps {
  transactionId: string;
  transactionType: 'buyer' | 'seller';
  currentTier?: ServiceTierType | null;
  onTierSelect?: (tier: ServiceTierType) => void;
}

const ServiceTierSelector = ({ 
  transactionId, 
  transactionType, 
  currentTier,
  onTierSelect 
}: ServiceTierSelectorProps) => {
  const [selectedTier, setSelectedTier] = useState<ServiceTierType | null>(currentTier || null);
  const { updateServiceTier, isUpdating } = useServiceTierSelection(transactionId);

  const tiers = getServiceTiersByType(transactionType);

  const getTierIcon = (level: string) => {
    switch (level) {
      case 'core':
        return <Shield className="h-5 w-5" />;
      case 'elite':
        return <Star className="h-5 w-5" />;
      case 'white_glove':
        return <Crown className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getTierColor = (level: string) => {
    switch (level) {
      case 'core':
        return 'border-blue-200 hover:border-blue-400';
      case 'elite':
        return 'border-purple-200 hover:border-purple-400';
      case 'white_glove':
        return 'border-amber-200 hover:border-amber-400';
      default:
        return 'border-gray-200 hover:border-gray-400';
    }
  };

  const handleTierSelection = (tier: ServiceTier) => {
    setSelectedTier(tier.id);
    onTierSelect?.(tier.id);
  };

  const handleConfirmSelection = () => {
    if (selectedTier) {
      updateServiceTier({ selectedTier });
    }
  };

  const getFeatureIcon = (included: boolean) => {
    return included ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-brand-heading font-semibold text-brand-charcoal tracking-wide uppercase mb-2">
          Choose Your Service Tier
        </h2>
        <p className="text-brand-charcoal/70 font-brand-body">
          Select the perfect service level for your {transactionType} transaction
        </p>
      </div>

      {/* Mobile: Stack cards vertically */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={cn(
              "relative cursor-pointer transition-all duration-300 hover:shadow-brand-elevation",
              getTierColor(tier.level),
              selectedTier === tier.id && "ring-2 ring-brand-charcoal shadow-brand-elevation",
              tier.isPopular && "scale-105 md:scale-110"
            )}
            onClick={() => handleTierSelection(tier)}
          >
            {tier.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-brand-charcoal text-brand-background px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <div className={cn(
                  "p-3 rounded-full",
                  tier.level === 'core' && "bg-blue-100 text-blue-600",
                  tier.level === 'elite' && "bg-purple-100 text-purple-600", 
                  tier.level === 'white_glove' && "bg-amber-100 text-amber-600"
                )}>
                  {getTierIcon(tier.level)}
                </div>
              </div>
              
              <CardTitle className="text-lg font-brand-heading tracking-wide">
                {tier.name}
              </CardTitle>
              
              <p className="text-sm text-brand-charcoal/70 font-brand-body leading-relaxed">
                {tier.description}
              </p>
              
              <div className="mt-4">
                <div className="text-3xl font-bold text-brand-charcoal">
                  ${tier.price.toLocaleString()}
                </div>
                <div className="text-sm text-brand-charcoal/60">
                  per transaction
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Show first 6 features with indicators */}
              {tier.features.slice(0, 6).map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getFeatureIcon(feature.included)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "text-sm font-medium",
                      feature.included ? "text-brand-charcoal" : "text-brand-charcoal/50"
                    )}>
                      {feature.name}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-brand-charcoal/40 ml-1 inline cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{feature.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
              
              {tier.features.length > 6 && (
                <div className="text-xs text-brand-charcoal/60 text-center pt-2">
                  +{tier.features.length - 6} more features
                </div>
              )}

              <div className="pt-4">
                <Button
                  className={cn(
                    "w-full font-brand-heading tracking-wide uppercase transition-all duration-300",
                    selectedTier === tier.id 
                      ? "bg-brand-charcoal text-brand-background hover:bg-brand-taupe-dark" 
                      : "bg-brand-taupe/20 text-brand-charcoal hover:bg-brand-taupe/40"
                  )}
                  variant={selectedTier === tier.id ? "default" : "outline"}
                >
                  {selectedTier === tier.id ? "Selected" : "Select Plan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation section */}
      {selectedTier && selectedTier !== currentTier && (
        <div className="flex justify-center pt-6">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div>
                <h3 className="font-brand-heading font-semibold text-brand-charcoal tracking-wide">
                  Confirm Service Tier Selection
                </h3>
                <p className="text-sm text-brand-charcoal/70 mt-1">
                  Update this transaction to{' '}
                  <span className="font-medium">
                    {tiers.find(t => t.id === selectedTier)?.name}
                  </span>
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedTier(currentTier || null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-brand-charcoal hover:bg-brand-taupe-dark font-brand-heading tracking-wide uppercase"
                  onClick={handleConfirmSelection}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Confirm"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ServiceTierSelector;
