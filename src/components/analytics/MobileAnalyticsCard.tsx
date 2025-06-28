
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MobileAnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}

const MobileAnalyticsCard = ({ title, value, icon: Icon, className = "" }: MobileAnalyticsCardProps) => {
  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 truncate">
              {title}
            </p>
            <p className="text-xl font-bold text-foreground truncate">
              {value}
            </p>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileAnalyticsCard;
