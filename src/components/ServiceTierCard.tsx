
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ServiceTierCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  activeCount: number;
}

const ServiceTierCard = ({ 
  title, 
  price, 
  description, 
  features, 
  isPopular = false,
  activeCount 
}: ServiceTierCardProps) => {
  return (
    <Card className={`relative ${isPopular ? 'ring-2 ring-primary' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <p className="text-2xl font-bold text-primary mt-1">${price}</p>
          </div>
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            {activeCount} Active
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
              {feature}
            </li>
          ))}
          {features.length > 3 && (
            <li className="text-sm text-muted-foreground">
              +{features.length - 3} more features
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ServiceTierCard;
