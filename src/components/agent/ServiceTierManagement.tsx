
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Crown, 
  Star, 
  Zap, 
  CheckCircle2, 
  TrendingUp,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceTierType, ServiceTierMetrics } from '@/types/agent';

interface ServiceTierManagementProps {
  transactionId: string;
}

const ServiceTierManagement = ({ transactionId }: ServiceTierManagementProps) => {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<ServiceTierType | ''>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, transaction_service_details(*)')
        .eq('id', transactionId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: tierMetrics } = useQuery({
    queryKey: ['tier-metrics', transaction?.service_tier],
    queryFn: async (): Promise<ServiceTierMetrics | null> => {
      if (!transaction?.service_tier) return null;
      
      // Mock data - in real app, this would come from analytics
      return {
        completionRate: 95,
        avgClosingTime: 28,
        clientSatisfaction: 4.8,
        upgradeRecommendation: transaction.service_tier === 'buyer_core' ? 'buyer_elite' as ServiceTierType : undefined
      };
    },
    enabled: !!transaction?.service_tier
  });

  const upgradeTierMutation = useMutation({
    mutationFn: async (newTier: ServiceTierType) => {
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({ service_tier: newTier })
        .eq('id', transactionId);
      
      if (transactionError) throw transactionError;

      // Update service details
      const { error: detailsError } = await supabase
        .from('transaction_service_details')
        .upsert({
          transaction_id: transactionId,
          selected_features: getTierFeatures(newTier),
          base_service_fee: getTierPricing(newTier),
          total_service_cost: getTierPricing(newTier)
        });
        
      if (detailsError) throw detailsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
      setUpgradeDialogOpen(false);
      toast({
        title: "Service Tier Updated",
        description: "Transaction service tier has been successfully upgraded.",
      });
    },
  });

  const getTierFeatures = (tier: ServiceTierType): string[] => {
    const features: Record<ServiceTierType, string[]> = {
      buyer_core: ['Basic coordination', 'Document management', 'Email updates'],
      buyer_elite: ['Premium coordination', 'Advanced marketing', 'Priority support', 'Custom materials'],
      white_glove_buyer: ['Dedicated concierge', 'VIP treatment', 'Personal assistant', 'Luxury amenities'],
      listing_core: ['Basic listing', 'MLS syndication', 'Photo coordination'],
      listing_elite: ['Professional photos', 'Marketing materials', 'Social media promotion'],
      white_glove_listing: ['Luxury marketing', 'Staging coordination', 'Private showings', 'Concierge services']
    };
    return features[tier] || [];
  };

  const getTierPricing = (tier: ServiceTierType): number => {
    const pricing: Record<ServiceTierType, number> = {
      buyer_core: 500,
      buyer_elite: 1000,
      white_glove_buyer: 2500,
      listing_core: 750,
      listing_elite: 1500,
      white_glove_listing: 3000
    };
    return pricing[tier] || 0;
  };

  const getTierIcon = (tier: ServiceTierType) => {
    if (tier?.includes('white_glove')) return Crown;
    if (tier?.includes('elite')) return Star;
    return Zap;
  };

  const getTierColor = (tier: ServiceTierType) => {
    if (tier?.includes('white_glove')) return 'from-purple-500 to-pink-500';
    if (tier?.includes('elite')) return 'from-blue-500 to-cyan-500';
    return 'from-green-500 to-emerald-500';
  };

  const currentTier = transaction?.service_tier as ServiceTierType;
  const TierIcon = currentTier ? getTierIcon(currentTier) : Zap;

  return (
    <div className="space-y-6">
      {/* Current Service Tier Overview */}
      <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TierIcon className="h-5 w-5 text-purple-600" />
            Current Service Tier
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentTier ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg bg-gradient-to-r ${getTierColor(currentTier)} text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold capitalize">
                      {currentTier.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-white/80">
                      Premium real estate service experience
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${getTierPricing(currentTier).toLocaleString()}
                    </div>
                    <div className="text-sm text-white/80">Service Fee</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-brand-charcoal">Included Features:</h4>
                  <div className="space-y-1">
                    {getTierFeatures(currentTier).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {tierMetrics && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-brand-charcoal">Performance Metrics:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        {tierMetrics.completionRate}% completion rate
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        {tierMetrics.avgClosingTime} days avg closing
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        {tierMetrics.clientSatisfaction}/5 satisfaction
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {tierMetrics?.upgradeRecommendation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-amber-800">Upgrade Recommendation</span>
                  </div>
                  <p className="text-sm text-amber-700 mb-3">
                    Based on your transaction complexity, consider upgrading to {' '}
                    <strong>{tierMetrics.upgradeRecommendation.replace(/_/g, ' ')}</strong> for enhanced service.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedTier(tierMetrics.upgradeRecommendation!);
                      setUpgradeDialogOpen(true);
                    }}
                  >
                    View Upgrade Options
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Zap className="h-12 w-12 text-brand-taupe/40 mx-auto mb-3" />
              <p className="text-brand-charcoal/60 mb-4">No service tier selected</p>
              <Button onClick={() => setUpgradeDialogOpen(true)}>
                Select Service Tier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Tier Actions */}
      <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
        <CardHeader>
          <CardTitle>Tier Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Crown className="h-4 w-4 mr-2" />
                  {currentTier ? 'Upgrade/Change Tier' : 'Select Tier'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Service Tier Selection</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={selectedTier} onValueChange={(value: ServiceTierType) => setSelectedTier(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a service tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer_core">Buyer Core Service</SelectItem>
                      <SelectItem value="buyer_elite">Buyer Elite Service</SelectItem>
                      <SelectItem value="white_glove_buyer">White Glove Buyer Service</SelectItem>
                      <SelectItem value="listing_core">Listing Core Service</SelectItem>
                      <SelectItem value="listing_elite">Listing Elite Service</SelectItem>
                      <SelectItem value="white_glove_listing">White Glove Listing Service</SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedTier && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3"
                    >
                      <div className={`p-4 rounded-lg bg-gradient-to-r ${getTierColor(selectedTier)} text-white`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold capitalize">
                            {selectedTier.replace(/_/g, ' ')}
                          </h4>
                          <div className="text-xl font-bold">
                            ${getTierPricing(selectedTier).toLocaleString()}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {getTierFeatures(selectedTier).map((feature, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => upgradeTierMutation.mutate(selectedTier)}
                          disabled={upgradeTierMutation.isPending}
                        >
                          {currentTier ? 'Update' : 'Select'} Service Tier
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {currentTier && (
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                View Billing Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceTierManagement;
