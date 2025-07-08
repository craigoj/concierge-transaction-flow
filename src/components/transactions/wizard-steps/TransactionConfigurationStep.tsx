import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import {
  Settings,
  Crown,
  Star,
  Shield,
  Calendar as CalendarIcon,
  DollarSign,
  Clock,
  AlertTriangle,
  User,
} from 'lucide-react';
import { TransactionConfiguration } from '../TransactionCreationWizard';
import { useAuth } from '@/contexts/AuthContext';

interface TransactionConfigurationStepProps {
  data?: TransactionConfiguration;
  onChange: (data: TransactionConfiguration) => void;
  transactionType?: string;
}

const serviceTiers = [
  {
    value: 'buyer_core',
    label: 'Core Buyer Service',
    description: 'Essential coordination and document management',
    features: ['Basic coordination', 'Document management', 'Email communication'],
    icon: Shield,
    color: 'bg-blue-500',
  },
  {
    value: 'buyer_elite',
    label: 'Elite Buyer Service',
    description: 'Enhanced service with premium support',
    features: ['All Core features', 'Welcome guides', 'Premium support', 'Priority handling'],
    icon: Star,
    color: 'bg-purple-500',
  },
  {
    value: 'white_glove_buyer',
    label: 'White Glove Buyer',
    description: 'Luxury concierge service with celebration',
    features: ['All Elite features', 'Concierge service', 'Celebration package', '24/7 support'],
    icon: Crown,
    color: 'bg-gold-500',
  },
  {
    value: 'listing_core',
    label: 'Core Listing Service',
    description: 'Essential listing coordination and MLS',
    features: ['Basic coordination', 'Document management', 'MLS listing'],
    icon: Shield,
    color: 'bg-green-500',
  },
  {
    value: 'listing_elite',
    label: 'Elite Listing Service',
    description: 'Enhanced listing with photography and marketing',
    features: ['All Core features', 'Professional photography', 'Social media marketing'],
    icon: Star,
    color: 'bg-teal-500',
  },
  {
    value: 'white_glove_listing',
    label: 'White Glove Listing',
    description: 'Luxury listing service with staging',
    features: [
      'All Elite features',
      'Professional staging',
      'Lockbox management',
      'Concierge service',
    ],
    icon: Crown,
    color: 'bg-amber-500',
  },
];

const financingTypes = [
  { value: 'cash', label: 'Cash Purchase', description: 'No financing required' },
  {
    value: 'conventional',
    label: 'Conventional Loan',
    description: 'Traditional mortgage financing',
  },
  { value: 'fha', label: 'FHA Loan', description: 'Federal Housing Administration loan' },
  { value: 'va', label: 'VA Loan', description: 'Veterans Affairs loan' },
  { value: 'usda', label: 'USDA Loan', description: 'Rural development loan' },
  { value: 'other', label: 'Other', description: 'Alternative financing method' },
];

const priorityLevels = [
  {
    value: 'standard',
    label: 'Standard',
    description: 'Normal processing timeline',
    color: 'bg-gray-500',
  },
  {
    value: 'urgent',
    label: 'Urgent',
    description: 'Expedited processing needed',
    color: 'bg-orange-500',
  },
  {
    value: 'rush',
    label: 'Rush',
    description: 'Immediate attention required',
    color: 'bg-red-500',
  },
];

export const TransactionConfigurationStep: React.FC<TransactionConfigurationStepProps> = ({
  data,
  onChange,
  transactionType = 'buyer',
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<TransactionConfiguration>({
    transaction_type: transactionType as any,
    service_tier: 'buyer_core',
    agent_id: user?.id || '',
    financing_type: 'conventional',
    pre_approval_status: false,
    priority_level: 'standard',
    ...data,
  });

  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleChange = (field: keyof TransactionConfiguration, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      handleChange('expected_closing_date', format(date, 'yyyy-MM-dd'));
      setShowCalendar(false);
    }
  };

  // Filter service tiers based on transaction type
  const filteredServiceTiers = serviceTiers.filter((tier) => {
    if (formData.transaction_type === 'buyer' || formData.transaction_type === 'dual') {
      return tier.value.includes('buyer');
    } else {
      return tier.value.includes('listing');
    }
  });

  const selectedTier = serviceTiers.find((tier) => tier.value === formData.service_tier);

  return (
    <div className="space-y-6">
      {/* Transaction Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Transaction Type</span>
          </CardTitle>
          <CardDescription>Select the type of transaction you're creating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'listing', label: 'Listing', description: 'Representing the seller' },
              {
                value: 'buyer',
                label: 'Buyer Representation',
                description: 'Representing the buyer',
              },
              { value: 'dual', label: 'Dual Agency', description: 'Representing both parties' },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.transaction_type === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => handleChange('transaction_type', type.value)}
              >
                <div className="space-y-2">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Tier Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span>Service Tier Selection</span>
          </CardTitle>
          <CardDescription>Choose the level of service for this transaction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredServiceTiers.map((tier) => {
              const IconComponent = tier.icon;
              return (
                <button
                  key={tier.value}
                  type="button"
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.service_tier === tier.value
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => handleChange('service_tier', tier.value)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                      <IconComponent className="w-4 h-4" />
                      <span className="font-medium text-sm">{tier.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{tier.description}</p>
                    <ul className="text-xs space-y-1">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <div className="w-1 h-1 rounded-full bg-current opacity-50" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedTier && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Selected: {selectedTier.label}</h4>
              <p className="text-sm text-muted-foreground mb-3">{selectedTier.description}</p>
              <div className="grid grid-cols-2 gap-2">
                {selectedTier.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Agent Assignment</span>
          </CardTitle>
          <CardDescription>Assign the primary agent for this transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="agent_id">Primary Agent</Label>
            <Input
              id="agent_id"
              value={formData.agent_id}
              onChange={(e) => handleChange('agent_id', e.target.value)}
              placeholder="Agent ID"
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Currently assigned to: {user?.email} (You)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Transaction Timeline</span>
          </CardTitle>
          <CardDescription>Set important dates and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Expected Closing Date</Label>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expected_closing_date
                    ? format(new Date(formData.expected_closing_date), 'PPP')
                    : 'Select closing date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    formData.expected_closing_date
                      ? new Date(formData.expected_closing_date)
                      : undefined
                  }
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Financing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Financing Information</span>
          </CardTitle>
          <CardDescription>Specify financing details and lender information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Financing Type</Label>
            <Select
              value={formData.financing_type}
              onValueChange={(value) => handleChange('financing_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {financingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pre_approval"
              checked={formData.pre_approval_status}
              onCheckedChange={(checked) => handleChange('pre_approval_status', checked)}
            />
            <Label htmlFor="pre_approval">Client has pre-approval letter</Label>
          </div>

          {formData.pre_approval_status && (
            <div className="space-y-2">
              <Label htmlFor="lender_info">Lender Information</Label>
              <Textarea
                id="lender_info"
                placeholder="Enter lender name, contact information, and any relevant details..."
                value={formData.lender_info || ''}
                onChange={(e) => handleChange('lender_info', e.target.value)}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Priority Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Priority Level</span>
          </CardTitle>
          <CardDescription>Set the urgency level for this transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {priorityLevels.map((priority) => (
              <button
                key={priority.value}
                type="button"
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.priority_level === priority.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => handleChange('priority_level', priority.value)}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                    <span className="font-medium">{priority.label}</span>
                    {priority.value === 'rush' && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{priority.description}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>
            Any special instructions or important information about this transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter any special instructions, client preferences, unique circumstances, or other important details..."
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
};
