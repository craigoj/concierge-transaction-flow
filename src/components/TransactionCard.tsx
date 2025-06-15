
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User } from "lucide-react";

interface TransactionCardProps {
  id: string;
  property: string;
  client: string;
  agent: string;
  type: 'buyer' | 'seller';
  status: 'pending' | 'under-contract' | 'closing' | 'completed';
  tier: string;
  closingDate: string;
  location: string;
}

const TransactionCard = ({
  id,
  property,
  client,
  agent,
  type,
  status,
  tier,
  closingDate,
  location
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'buyer' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold text-foreground mb-2">
              {property}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(status)}>
                {status.replace('-', ' ').toUpperCase()}
              </Badge>
              <Badge className={getTypeColor(type)}>
                {type.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {tier}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">Client:</span>
            <span className="ml-1">{client}</span>
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
            <span className="ml-1">{closingDate}</span>
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
