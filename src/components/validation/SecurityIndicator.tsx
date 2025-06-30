
import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Lock, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SecurityStatus {
  isSecure: boolean;
  isOnline: boolean;
  hasValidSession: boolean;
  rateLimitStatus: 'ok' | 'warning' | 'blocked';
  lastValidation: Date | null;
}

interface SecurityIndicatorProps {
  status: SecurityStatus;
  className?: string;
}

export const SecurityIndicator = ({ status, className }: SecurityIndicatorProps) => {
  const getSecurityLevel = () => {
    if (!status.isOnline) return 'offline';
    if (status.rateLimitStatus === 'blocked') return 'blocked';
    if (!status.hasValidSession) return 'insecure';
    if (status.rateLimitStatus === 'warning') return 'warning';
    return 'secure';
  };

  const securityLevel = getSecurityLevel();

  const getSecurityIcon = () => {
    switch (securityLevel) {
      case 'secure':
        return <ShieldCheck className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <ShieldAlert className="h-4 w-4 text-yellow-600" />;
      case 'insecure':
      case 'blocked':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSecurityMessage = () => {
    switch (securityLevel) {
      case 'secure':
        return 'Connection secure • Validation active';
      case 'warning':
        return 'Rate limit warning • Slow down requests';
      case 'blocked':
        return 'Rate limit exceeded • Please wait';
      case 'insecure':
        return 'Session expired • Please refresh';
      case 'offline':
        return 'Offline • Limited validation';
      default:
        return 'Checking security...';
    }
  };

  const getSecurityColor = () => {
    switch (securityLevel) {
      case 'secure':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'insecure':
      case 'blocked':
        return 'text-red-600';
      case 'offline':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className={cn('border-l-4', 
      securityLevel === 'secure' && 'border-l-green-500',
      securityLevel === 'warning' && 'border-l-yellow-500',
      securityLevel === 'insecure' && 'border-l-red-500',
      securityLevel === 'blocked' && 'border-l-red-500',
      securityLevel === 'offline' && 'border-l-gray-500',
      className
    )}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSecurityIcon()}
            <span className={cn('text-sm font-medium', getSecurityColor())}>
              {getSecurityMessage()}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {status.isOnline ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
            
            <Lock className="h-3 w-3 text-gray-500" />
            
            <Badge variant="outline" className="text-xs">
              RLS Active
            </Badge>
          </div>
        </div>
        
        {status.lastValidation && (
          <div className="mt-2 text-xs text-gray-500">
            Last validated: {status.lastValidation.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
