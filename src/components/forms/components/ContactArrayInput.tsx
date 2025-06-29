import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Phone, Mail, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContactData {
  id?: string;
  value: string;
  type: 'phone' | 'email';
  isValid?: boolean;
}

interface ContactArrayInputProps {
  label: string;
  contacts: ContactData[];
  onChange: (contacts: ContactData[]) => void;
  allowedTypes?: ('phone' | 'email')[];
  maxContacts?: number;
  required?: boolean;
  error?: string;
  className?: string;
}

export const ContactArrayInput = ({
  label,
  contacts,
  onChange,
  allowedTypes = ['phone', 'email'],
  maxContacts = 5,
  required = false,
  error,
  className
}: ContactArrayInputProps) => {
  const [newContact, setNewContact] = useState({ value: '', type: 'phone' as 'phone' | 'email' });

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters for validation
    const cleaned = phone.replace(/\D/g, '');
    // US phone numbers should have 10 digits
    return cleaned.length >= 10;
  };

  const formatPhone = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    return cleaned;
  };

  const validateContact = (contact: ContactData): boolean => {
    if (contact.type === 'email') {
      return validateEmail(contact.value);
    } else {
      return validatePhone(contact.value);
    }
  };

  const addContact = () => {
    if (!newContact.value.trim()) return;
    
    const contactToAdd: ContactData = {
      id: `temp-${Date.now()}`,
      value: newContact.type === 'phone' ? formatPhone(newContact.value) : newContact.value.trim(),
      type: newContact.type,
      isValid: newContact.type === 'email' ? validateEmail(newContact.value) : validatePhone(newContact.value)
    };
    
    // Check for duplicates
    const isDuplicate = contacts.some(contact => 
      contact.value.toLowerCase() === contactToAdd.value.toLowerCase() && 
      contact.type === contactToAdd.type
    );
    
    if (!isDuplicate) {
      onChange([...contacts, contactToAdd]);
      setNewContact({ value: '', type: 'phone' });
    }
  };

  const removeContact = (index: number) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    onChange(updatedContacts);
  };

  const updateContact = (index: number, value: string) => {
    const updatedContacts = contacts.map((contact, i) => {
      if (i === index) {
        const formattedValue = contact.type === 'phone' ? formatPhone(value) : value;
        return {
          ...contact,
          value: formattedValue,
          isValid: contact.type === 'email' ? validateEmail(formattedValue) : validatePhone(formattedValue)
        };
      }
      return contact;
    });
    onChange(updatedContacts);
  };

  const getContactIcon = (type: 'phone' | 'email') => {
    return type === 'phone' ? <Phone className="h-3 w-3" /> : <Mail className="h-3 w-3" />;
  };

  const getContactTypeLabel = (type: 'phone' | 'email') => {
    return type === 'phone' ? 'Phone' : 'Email';
  };

  const hasError = !!error;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {contacts.length > 0 && (
          <Badge variant="secondary">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Existing Contacts */}
      <div className="space-y-2">
        {contacts.map((contact, index) => (
          <div key={contact.id || index} className="flex items-center gap-2 p-3 bg-brand-cream/30 rounded-lg border border-brand-taupe/20">
            <div className="flex items-center gap-2 flex-1">
              <div className={cn(
                "p-2 rounded-full",
                contact.isValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {getContactIcon(contact.type)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getContactTypeLabel(contact.type)}
                  </Badge>
                  {contact.isValid ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <X className="h-3 w-3 text-red-600" />
                  )}
                </div>
                
                <Input
                  type={contact.type === 'email' ? 'email' : 'tel'}
                  value={contact.value}
                  onChange={(e) => updateContact(index, e.target.value)}
                  className={cn(
                    "h-8 text-sm",
                    contact.isValid ? "border-green-300" : "border-red-300"
                  )}
                  placeholder={contact.type === 'email' ? 'email@example.com' : '(555) 123-4567'}
                />
              </div>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeContact(index)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 w-8 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add New Contact */}
      {contacts.length < maxContacts && (
        <div className="p-4 border-2 border-dashed border-brand-taupe/30 rounded-lg bg-brand-taupe/5">
          <div className="space-y-3">
            <h4 className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Contact
            </h4>
            
            <div className="flex gap-2">
              {allowedTypes.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={newContact.type === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewContact({ ...newContact, type })}
                  className="flex items-center gap-1"
                >
                  {getContactIcon(type)}
                  {getContactTypeLabel(type)}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                type={newContact.type === 'email' ? 'email' : 'tel'}
                value={newContact.value}
                onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
                placeholder={
                  newContact.type === 'email' 
                    ? 'Enter email address' 
                    : 'Enter phone number'
                }
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addContact();
                  }
                }}
                className="flex-1"
              />
              
              <Button
                type="button"
                onClick={addContact}
                disabled={!newContact.value.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Helper Text */}
      <p className="text-xs text-brand-charcoal/60">
        {allowedTypes.includes('phone') && allowedTypes.includes('email') && 
          "Add phone numbers and email addresses. Phone numbers will be automatically formatted."
        }
        {allowedTypes.includes('phone') && !allowedTypes.includes('email') && 
          "Add phone numbers. Numbers will be automatically formatted as (XXX) XXX-XXXX."
        }
        {!allowedTypes.includes('phone') && allowedTypes.includes('email') && 
          "Add email addresses for contact."
        }
        {contacts.length >= maxContacts && (
          <span className="text-orange-600"> Maximum {maxContacts} contacts allowed.</span>
        )}
      </p>
    </div>
  );
};
