
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Shield, Zap } from 'lucide-react';
import { RiskLevel } from '@/types/progress';

interface RiskLevelIndicatorProps {
  level: RiskLevel;
  className?: string;
}

export const RiskLevelIndicator: React.FC<RiskLevelIndicatorProps> = ({ level, className = '' }) => {
  const getRiskConfig = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'critical':
        return {
          label: 'Critical',
          className: 'bg-red-100 text-red-800 border-red-300',
          icon: <Zap className="h-3 w-3" />
        };
      case 'high':
        return {
          label: 'High Risk',
          className: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: <AlertTriangle className="h-3 w-3" />
        };
      case 'medium':
        return {
          label: 'Medium Risk',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <AlertCircle className="h-3 w-3" />
        };
      default:
        return {
          label: 'Low Risk',
          className: 'bg-green-100 text-green-800 border-green-300',
          icon: <Shield className="h-3 w-3" />
        };
    }
  };

  const config = getRiskConfig(level);

  return (
    <Badge className={`${config.className} ${className} flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};
