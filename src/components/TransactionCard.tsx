import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User } from 'lucide-react';

interface TransactionCardProps {
  id: string;
  property: string;
  client: string;
  agent: string;
  type: 'buyer' | 'seller';
  status: 'pending' | 'under-contract' | 'closing' | 'completed' | 'active';
  tier: string;
  closingDate: string | null;
  location: string;
  price?: number | null;
  transaction?: unknown; // For backward compatibility with tests
  onClick?: (transaction?: unknown) => void;
  variant?: 'default' | 'mobile' | 'premium';
}

const TransactionCard = ({
  property,
  client,
  agent,
  type,
  status,
  tier,
  closingDate,
  location,
  price,
  transaction,
  onClick,
}: TransactionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under-contract':
        return 'bg-blue-100 text-blue-800';
      case 'closing':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'COORDINATING';
      case 'pending':
        return 'PENDING';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status.replace('-', ' ').toUpperCase();
    }
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) {
      return '$TBD';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | null): string => {
    if (!date) return 'Date TBD';
    return new Date(date).toLocaleDateString();
  };

  const handleClick = () => {
    if (onClick) {
      onClick(transaction);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && onClick) {
      onClick(transaction);
    }
  };

  // Extract price from transaction if not provided directly
  const displayPrice = price !== undefined ? price : transaction?.purchase_price;
  const displayClosingDate = closingDate || transaction?.closing_date;
  const displayStatus = status || transaction?.status || 'active';

  const getTypeColor = (type: string) => {
    return type === 'buyer' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800';
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `Transaction for ${property}` : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold text-foreground mb-2">
              {property}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(displayStatus)}>
                {getStatusText(displayStatus)}
              </Badge>
              <Badge className={getTypeColor(type)}>{type.toUpperCase()}</Badge>
              <Badge variant="outline" className="text-xs">
                {tier}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">{formatPrice(displayPrice)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">Client:</span>
            <span className="ml-1">{client || 'Client TBD'}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">Agent:</span>
            <span className="ml-1">{agent}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{location}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="font-medium">Closing:</span>
            <span className="ml-1">{formatDate(displayClosingDate)}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" className="flex-1">
            View Details
          </Button>
          <Button size="sm" variant="outline">
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
