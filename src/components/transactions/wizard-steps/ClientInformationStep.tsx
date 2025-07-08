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
import { User, Users, Plus, Trash2, Mail, Phone, MessageSquare, Smartphone } from 'lucide-react';
import { ClientInformation } from '../TransactionCreationWizard';

interface ClientInformationStepProps {
  data?: ClientInformation;
  onChange: (data: ClientInformation) => void;
}

const communicationOptions = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'text', label: 'Text Message', icon: MessageSquare },
  { value: 'app', label: 'App Notification', icon: Smartphone },
];

const clientRoles = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'agent', label: 'Agent/Representative' },
];

export const ClientInformationStep: React.FC<ClientInformationStepProps> = ({ data, onChange }) => {
  const [formData, setFormData] = useState<ClientInformation>({
    primary_client: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'buyer',
      communication_preference: 'email',
    },
    secondary_clients: [],
    ...data,
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handlePrimaryClientChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      primary_client: {
        ...prev.primary_client,
        [field]: value,
      },
    }));
  };

  const handleSecondaryClientChange = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      secondary_clients: prev.secondary_clients.map((client, i) =>
        i === index ? { ...client, [field]: value } : client
      ),
    }));
  };

  const addSecondaryClient = () => {
    setFormData((prev) => ({
      ...prev,
      secondary_clients: [
        ...prev.secondary_clients,
        {
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          role: 'buyer',
          communication_preference: 'email',
        },
      ],
    }));
  };

  const removeSecondaryClient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      secondary_clients: prev.secondary_clients.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Primary Client */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Primary Client</span>
            <Badge variant="secondary">Required</Badge>
          </CardTitle>
          <CardDescription>Main contact person for this transaction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_first_name">First Name</Label>
              <Input
                id="primary_first_name"
                placeholder="John"
                value={formData.primary_client.first_name}
                onChange={(e) => handlePrimaryClientChange('first_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_last_name">Last Name</Label>
              <Input
                id="primary_last_name"
                placeholder="Smith"
                value={formData.primary_client.last_name}
                onChange={(e) => handlePrimaryClientChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_email">Email Address</Label>
              <Input
                id="primary_email"
                type="email"
                placeholder="john.smith@email.com"
                value={formData.primary_client.email}
                onChange={(e) => handlePrimaryClientChange('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_phone">Phone Number</Label>
              <Input
                id="primary_phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.primary_client.phone}
                onChange={(e) => handlePrimaryClientChange('phone', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_role">Client Role</Label>
              <Select
                value={formData.primary_client.role}
                onValueChange={(value) => handlePrimaryClientChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clientRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Communication Preference</Label>
              <div className="grid grid-cols-2 gap-2">
                {communicationOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`p-2 rounded-lg border-2 transition-all ${
                        formData.primary_client.communication_preference === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() =>
                        handlePrimaryClientChange('communication_preference', option.value)
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent
                          className={`w-4 h-4 ${
                            formData.primary_client.communication_preference === option.value
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Clients */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Secondary Contacts</span>
                <Badge variant="outline">Optional</Badge>
              </CardTitle>
              <CardDescription>
                Additional contacts involved in this transaction (spouse, co-buyer, etc.)
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSecondaryClient}
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.secondary_clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No secondary contacts added yet</p>
              <p className="text-sm">
                Click "Add Contact" to include additional people in this transaction
              </p>
            </div>
          ) : (
            formData.secondary_clients.map((client, index) => (
              <Card key={index} className="border-dashed">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm">Secondary Contact #{index + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSecondaryClient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        placeholder="Jane"
                        value={client.first_name}
                        onChange={(e) =>
                          handleSecondaryClientChange(index, 'first_name', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        placeholder="Smith"
                        value={client.last_name}
                        onChange={(e) =>
                          handleSecondaryClientChange(index, 'last_name', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email (Optional)</Label>
                      <Input
                        type="email"
                        placeholder="jane.smith@email.com"
                        value={client.email || ''}
                        onChange={(e) =>
                          handleSecondaryClientChange(index, 'email', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone (Optional)</Label>
                      <Input
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={client.phone || ''}
                        onChange={(e) =>
                          handleSecondaryClientChange(index, 'phone', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={client.role}
                        onValueChange={(value) => handleSecondaryClientChange(index, 'role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {clientRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Communication Preference</Label>
                      <Select
                        value={client.communication_preference}
                        onValueChange={(value) =>
                          handleSecondaryClientChange(index, 'communication_preference', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {communicationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Special Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Special Requirements</CardTitle>
          <CardDescription>
            Any special requirements, preferences, or notes about the clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter any special requirements, accessibility needs, communication preferences, or other important notes about the clients..."
            value={formData.special_requirements || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, special_requirements: e.target.value }))
            }
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );
};
