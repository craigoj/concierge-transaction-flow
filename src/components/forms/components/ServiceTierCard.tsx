
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Star, Crown, Shield, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ServiceTierFeature {
  name: string;
  included: boolean;
  description?: string;
  highlight?: boolean;
}

export interface ServiceTierData {
  id: string;
  name: string;
  description: string;
  price?: number;
  priceLabel?: string;
  features: ServiceTierFeature[];
  popular?: boolean;
  premium?: boolean;
  buttonText?: string;
  icon?: React.ReactNode;
}

interface ServiceTierCardProps {
  tier: ServiceTierData;
  isSelected?: boolean;
  onSelect: (tierId: string) => void;
  showComparison?: boolean;
  className?: string;
}

export const ServiceTierCard = ({
  tier,
  isSelected = false,
  onSelect,
  showComparison = true,
  className
}: ServiceTierCardProps) => {
  const getTierIcon = () => {
    if (tier.premium) return <Crown className="h-5 w-5" />;
    if (tier.popular) return <Star className="h-5 w-5" />;
    return <Shield className="h-5 w-5" />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <TooltipProvider>
      <Card className={cn(
        "relative transition-all duration-300 hover:shadow-brand-elevation",
        isSelected && "ring-2 ring-brand-charcoal shadow-brand-elevation",
        tier.popular && "border-brand-charcoal/40",
        tier.premium && "border-2 border-brand-taupe bg-gradient-to-br from-brand-cream to-white",
        className
      )}>
        {/* Popular Badge */}
        {tier.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-brand-charcoal text-brand-background px-4 py-1">
              Most Popular
            </Badge>
          </div>
        )}

        {/* Premium Badge */}
        {tier.premium && (
          <div className="absolute -top-3 right-4">
            <Badge variant="secondary" className="bg-brand-taupe text-brand-charcoal px-3 py-1 flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Premium
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-3">
            <div className={cn(
              "p-3 rounded-full",
              isSelected ? "bg-brand-charcoal text-brand-background" : "bg-brand-taupe/20 text-brand-charcoal"
            )}>
              {tier.icon || getTierIcon()}
            </div>
          </div>

          <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase">
            {tier.name}
          </CardTitle>

          <p className="text-brand-charcoal/70 font-brand-body text-sm leading-relaxed">
            {tier.description}
          </p>

          {/* Pricing */}
          {(tier.price || tier.priceLabel) && (
            <div className="mt-4">
              {tier.price ? (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-brand-charcoal">
                    {formatPrice(tier.price)}
                  </div>
                  {tier.priceLabel && (
                    <div className="text-sm text-brand-charcoal/60">
                      {tier.priceLabel}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xl font-brand-heading tracking-wide text-brand-charcoal uppercase">
                  {tier.priceLabel}
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features List */}
          {showComparison && (
            <div className="space-y-3">
              <h4 className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal border-b border-brand-taupe/30 pb-2">
                Features & Benefits
              </h4>
              
              <div className="space-y-2">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 rounded-full p-0.5",
                      feature.included 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-400"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-brand-body",
                        feature.included ? "text-brand-charcoal" : "text-brand-charcoal/40",
                        feature.highlight && "font-medium"
                      )}>
                        {feature.name}
                        
                        {feature.description && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="inline h-3 w-3 ml-1 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{feature.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selection Button */}
          <Button
            onClick={() => onSelect(tier.id)}
            className={cn(
              "w-full transition-all duration-300",
              isSelected 
                ? "bg-brand-charcoal text-brand-background hover:bg-brand-taupe-dark" 
                : "border-2 border-brand-charcoal bg-transparent text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-background"
            )}
            variant={isSelected ? "default" : "outline"}
          >
            {isSelected ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Selected
              </>
            ) : (
              tier.buttonText || `Select ${tier.name}`
            )}
          </Button>

          {/* Selection Confirmation */}
          {isSelected && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium text-center">
                ✓ {tier.name} service tier selected
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

// Service Tier Comparison Component
interface ServiceTierComparisonProps {
  tiers: ServiceTierData[];
  selectedTierId?: string;
  onSelect: (tierId: string) => void;
  className?: string;
}

export const ServiceTierComparison = ({
  tiers,
  selectedTierId,
  onSelect,
  className
}: ServiceTierComparisonProps) => {
  return (
    <div className={cn("grid gap-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase">
          Choose Your Service Tier
        </h2>
        <p className="text-brand-charcoal/70 font-brand-body max-w-2xl mx-auto">
          Select the service level that best matches your needs. You can upgrade or modify your selection at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <ServiceTierCard
            key={tier.id}
            tier={tier}
            isSelected={selectedTierId === tier.id}
            onSelect={onSelect}
            showComparison={true}
          />
        ))}
      </div>
    </div>
  );
};
