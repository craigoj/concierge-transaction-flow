
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, UserPlus, Phone, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ServiceTierBadge } from './ServiceTierBadge';
import { RiskLevelIndicator } from './RiskLevelIndicator';
import { ProgressPhaseIndicator } from './ProgressPhaseIndicator';
import { TransactionWithProgress, QuickAction } from '@/types/progress';
import { format } from 'date-fns';

interface TransactionProgressCardProps {
  transaction: TransactionWithProgress;
  onViewDetails: () => void;
  onQuickAction: (action: QuickAction) => void;
  className?: string;
}

export const TransactionProgressCard: React.FC<TransactionProgressCardProps> = ({
  transaction,
  onViewDetails,
  onQuickAction,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getServiceTierCardClass = (tier?: string | null) => {
    switch (tier) {
      case 'buyer_elite':
      case 'listing_elite':
        return 'card-elite border-violet-200 bg-gradient-to-br from-violet-50 to-white';
      case 'white_glove_buyer':
      case 'white_glove_listing':
        return 'card-white-glove border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-lg';
      default:
        return 'card-core border-emerald-200 bg-gradient-to-br from-emerald-50 to-white';
    }
  };

  const getClientDisplayName = () => {
    const primaryClient = transaction.clients?.[0];
    if (!primaryClient) return 'No client assigned';
    
    const otherClientsCount = (transaction.clients?.length || 1) - 1;
    return otherClientsCount > 0 
      ? `${primaryClient.full_name} +${otherClientsCount} more`
      : primaryClient.full_name;
  };

  const getDaysInCurrentPhase = () => {
    if (!transaction.created_at) return 0;
    const startDate = new Date(transaction.created_at);
    const now = new Date();
    return Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getNextMilestone = () => {
    // Since we don't have phase progress yet, return a placeholder
    return 'Contract Review';
  };

  const quickActions: QuickAction[] = [
    { id: 'contact', label: 'Contact Client', icon: 'Phone', action: 'contact_client' },
    { id: 'add_task', label: 'Add Task', icon: 'UserPlus', action: 'add_task' },
    { id: 'escalate', label: 'Escalate', icon: 'AlertTriangle', action: 'escalate' }
  ];

  return (
    <Card 
      className={`transaction-progress-card ${getServiceTierCardClass(transaction.service_tier)} transition-all duration-300 hover:shadow-md ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <ServiceTierBadge tier={transaction.service_tier} />
            <RiskLevelIndicator level="low" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {quickActions.map((action) => (
                <DropdownMenuItem 
                  key={action.id}
                  onClick={() => onQuickAction(action)}
                  className="flex items-center gap-2"
                >
                  {action.icon === 'Phone' && <Phone className="h-4 w-4" />}
                  {action.icon === 'UserPlus' && <UserPlus className="h-4 w-4" />}
                  {action.icon === 'AlertTriangle' && <AlertTriangle className="h-4 w-4" />}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Property Information */}
        <div className="property-info">
          <h3 className="font-semibold text-lg text-gray-900 truncate">
            {transaction.property_address}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {getClientDisplayName()}
          </p>
          {transaction.closing_date && (
            <p className="text-sm text-gray-500 mt-1">
              Est. Closing: {format(new Date(transaction.closing_date), 'MMM dd, yyyy')}
            </p>
          )}
        </div>

        {/* Progress Visualization */}
        <ProgressPhaseIndicator 
          phases={transaction.phaseProgress || []}
          currentPhase={undefined}
          serviceTier={transaction.service_tier}
          isInteractive={false}
        />

        {/* Performance Metrics - Show on Hover */}
        {isHovered && (
          <div className="hover-metrics bg-gray-50 rounded-lg p-3 space-y-2 animate-in fade-in-0 duration-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Days in Phase:</span>
              <span className="font-medium">{getDaysInCurrentPhase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Next Milestone:</span>
              <span className="font-medium truncate ml-2">{getNextMilestone()}</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions pt-2 border-t border-gray-100">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onViewDetails}
            className="w-full flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
