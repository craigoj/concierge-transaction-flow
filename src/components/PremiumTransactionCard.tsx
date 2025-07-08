
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Calendar, MapPin, User, Star } from "lucide-react";

interface PremiumTransactionCardProps {
  id: string;
  property: string;
  client: string;
  agent: string;
  type: 'buyer' | 'seller';
  status: 'intake' | 'active' | 'closed' | 'cancelled';
  tier: string;
  closingDate: string;
  location: string;
  price?: number;
  priority?: 'high' | 'medium' | 'low';
}

const PremiumTransactionCard = ({
  property,
  client,
  agent,
  type,
  status,
  tier,
  closingDate,
  location,
  price,
  priority = 'medium'
}: PremiumTransactionCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'intake': { bg: 'bg-amber-100', text: 'text-amber-800', label: 'INTAKE', pulse: 'bg-amber-400' },
      'active': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'COORDINATING', pulse: 'bg-blue-400' },
      'closed': { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'COMPLETED', pulse: 'bg-emerald-400' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'CANCELLED', pulse: 'bg-red-400' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.pulse} animate-pulse`}></div>
        <Badge className={`${config.bg} ${config.text} font-brand-heading tracking-wide text-xs`}>
          {config.label}
        </Badge>
      </div>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'buyer' 
      ? <Badge className="bg-violet-100 text-violet-800 font-brand-heading tracking-wide text-xs">BUYER SIDE</Badge>
      : <Badge className="bg-orange-100 text-orange-800 font-brand-heading tracking-wide text-xs">LISTING SIDE</Badge>;
  };

  const getPriorityIndicator = (priority: string) => {
    const colors = {
      'high': 'border-l-red-400 bg-red-50/30',
      'medium': 'border-l-amber-400 bg-amber-50/30',
      'low': 'border-l-green-400 bg-green-50/30'
    };
    return colors[priority as keyof typeof colors];
  };

  return (
    <Card className={`bg-white/90 backdrop-blur-sm border-brand-taupe/20 shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300 overflow-hidden border-l-4 ${getPriorityIndicator(priority)}`}>
      <div className="p-6">
        {/* Header with Property and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-5 w-5 text-brand-charcoal/60" />
              <h3 className="font-brand-heading tracking-wide text-brand-charcoal uppercase text-sm">
                {property}
              </h3>
              {tier.includes('Elite') && <Star className="h-4 w-4 text-amber-500 fill-current" />}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {getStatusBadge(status)}
              {getTypeBadge(type)}
            </div>
          </div>
          {price && (
            <div className="text-right">
              <div className="text-xl font-bold text-brand-charcoal">
                ${price.toLocaleString()}
              </div>
              <div className="text-xs font-brand-body text-brand-charcoal/60">
                transaction value
              </div>
            </div>
          )}
        </div>

        {/* Transaction Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-brand-charcoal/50" />
            <div>
              <div className="font-medium text-brand-charcoal">{client}</div>
              <div className="text-xs text-brand-charcoal/60">client</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-brand-charcoal/50" />
            <div>
              <div className="font-medium text-brand-charcoal">{agent}</div>
              <div className="text-xs text-brand-charcoal/60">listing agent</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-charcoal/50" />
            <div>
              <div className="font-medium text-brand-charcoal">{location}</div>
              <div className="text-xs text-brand-charcoal/60">market area</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-charcoal/50" />
            <div>
              <div className="font-medium text-brand-charcoal">{closingDate}</div>
              <div className="text-xs text-brand-charcoal/60">target close</div>
            </div>
          </div>
        </div>

        {/* Service Tier */}
        <div className="mb-4">
          <Badge variant="outline" className="font-brand-heading tracking-wide text-xs border-brand-taupe/50 text-brand-charcoal/70">
            {tier.toUpperCase()} COORDINATION
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide text-xs"
          >
            COORDINATE
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-brand-taupe text-brand-charcoal hover:bg-brand-taupe/20 font-brand-heading tracking-wide text-xs"
          >
            UPDATE
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PremiumTransactionCard;
