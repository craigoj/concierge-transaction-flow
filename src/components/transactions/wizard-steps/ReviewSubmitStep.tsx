import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  MapPin,
  User,
  Users,
  Settings,
  Calendar,
  DollarSign,
  AlertCircle,
  Home,
  Mail,
  Phone,
} from 'lucide-react';
import { WizardData } from '../TransactionCreationWizard';

interface ReviewSubmitStepProps {
  data: WizardData;
  onSubmit: () => void;
  loading: boolean;
}

export const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({ data, onSubmit, loading }) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPropertyType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatServiceTier = (tier: string) => {
    const tierLabels: { [key: string]: string } = {
      buyer_core: 'Core Buyer Service',
      buyer_elite: 'Elite Buyer Service',
      white_glove_buyer: 'White Glove Buyer Service',
      listing_core: 'Core Listing Service',
      listing_elite: 'Elite Listing Service',
      white_glove_listing: 'White Glove Listing Service',
    };
    return tierLabels[tier] || tier;
  };

  const formatFinancingType = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      cash: 'Cash Purchase',
      conventional: 'Conventional Loan',
      fha: 'FHA Loan',
      va: 'VA Loan',
      usda: 'USDA Loan',
      other: 'Other Financing',
    };
    return typeLabels[type] || type;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Validation check
  const isDataComplete =
    data.propertyDetails && data.clientInformation && data.transactionConfiguration;

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-primary" />
            <span>Transaction Summary</span>
          </CardTitle>
          <CardDescription>
            Review all information before creating the transaction. You can go back to make changes
            if needed.
          </CardDescription>
        </CardHeader>
      </Card>

      {!isDataComplete && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Incomplete Information</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Please complete all required steps before submitting.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Property Details Review */}
      {data.propertyDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Property Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Address</h4>
                <p className="text-sm text-muted-foreground">
                  {data.propertyDetails.address_street}
                  <br />
                  {data.propertyDetails.address_city}, {data.propertyDetails.address_state}{' '}
                  {data.propertyDetails.address_zip}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Property Type</h4>
                <Badge variant="outline">
                  <Home className="w-3 h-3 mr-1" />
                  {formatPropertyType(data.propertyDetails.property_type)}
                </Badge>
              </div>
            </div>

            {(data.propertyDetails.bedrooms ||
              data.propertyDetails.bathrooms ||
              data.propertyDetails.square_feet) && (
              <div>
                <h4 className="font-medium mb-2">Property Details</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {data.propertyDetails.bedrooms && (
                    <div>
                      <span className="text-muted-foreground">Bedrooms:</span>{' '}
                      {data.propertyDetails.bedrooms}
                    </div>
                  )}
                  {data.propertyDetails.bathrooms && (
                    <div>
                      <span className="text-muted-foreground">Bathrooms:</span>{' '}
                      {data.propertyDetails.bathrooms}
                    </div>
                  )}
                  {data.propertyDetails.square_feet && (
                    <div>
                      <span className="text-muted-foreground">Sq Ft:</span>{' '}
                      {data.propertyDetails.square_feet.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.propertyDetails.listing_price && (
                <div>
                  <h4 className="font-medium mb-2">Price</h4>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(data.propertyDetails.listing_price)}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <Badge variant="secondary">
                  {formatPropertyType(data.propertyDetails.property_status)}
                </Badge>
              </div>
            </div>

            {data.propertyDetails.mls_number && (
              <div>
                <h4 className="font-medium mb-2">MLS Number</h4>
                <p className="text-sm font-mono">{data.propertyDetails.mls_number}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client Information Review */}
      {data.clientInformation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Client Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Primary Client</h4>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">
                      {data.clientInformation.primary_client.first_name}{' '}
                      {data.clientInformation.primary_client.last_name}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {formatPropertyType(data.clientInformation.primary_client.role)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{data.clientInformation.primary_client.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{data.clientInformation.primary_client.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Prefers:{' '}
                    {formatPropertyType(
                      data.clientInformation.primary_client.communication_preference
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {data.clientInformation.secondary_clients &&
              data.clientInformation.secondary_clients.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>
                      Secondary Contacts ({data.clientInformation.secondary_clients.length})
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {data.clientInformation.secondary_clients.map((client, index) => (
                      <div key={index} className="bg-muted/30 p-3 rounded-lg text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {client.first_name} {client.last_name}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {formatPropertyType(client.role)}
                            </Badge>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            {client.email && <div>{client.email}</div>}
                            {client.phone && <div>{client.phone}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {data.clientInformation.special_requirements && (
              <div>
                <h4 className="font-medium mb-2">Special Requirements</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {data.clientInformation.special_requirements}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction Configuration Review */}
      {data.transactionConfiguration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Transaction Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Transaction Type</h4>
                <Badge variant="default">
                  {formatPropertyType(data.transactionConfiguration.transaction_type)}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Service Tier</h4>
                <Badge variant="secondary">
                  {formatServiceTier(data.transactionConfiguration.service_tier)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Financing</h4>
                <p className="text-sm">
                  {formatFinancingType(data.transactionConfiguration.financing_type)}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant={
                      data.transactionConfiguration.pre_approval_status ? 'default' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {data.transactionConfiguration.pre_approval_status
                      ? 'Pre-approved'
                      : 'No pre-approval'}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Priority Level</h4>
                <Badge
                  variant={
                    data.transactionConfiguration.priority_level === 'rush'
                      ? 'destructive'
                      : data.transactionConfiguration.priority_level === 'urgent'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {formatPropertyType(data.transactionConfiguration.priority_level)}
                </Badge>
              </div>
            </div>

            {data.transactionConfiguration.expected_closing_date && (
              <div>
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Expected Closing Date</span>
                </h4>
                <p className="text-sm font-medium">
                  {formatDate(data.transactionConfiguration.expected_closing_date)}
                </p>
              </div>
            )}

            {data.transactionConfiguration.lender_info && (
              <div>
                <h4 className="font-medium mb-2">Lender Information</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {data.transactionConfiguration.lender_info}
                </p>
              </div>
            )}

            {data.transactionConfiguration.notes && (
              <div>
                <h4 className="font-medium mb-2">Additional Notes</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {data.transactionConfiguration.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />

      {/* Final Actions */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Ready to Create Transaction</h3>
              <p className="text-sm text-green-600 mt-1">
                All information has been reviewed and is ready for submission.
              </p>
            </div>
            <Button
              onClick={onSubmit}
              disabled={loading || !isDataComplete}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating Transaction...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Create Transaction
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will create the transaction, property record, and client contacts in the system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
