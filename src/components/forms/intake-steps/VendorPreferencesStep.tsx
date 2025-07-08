import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Minus, Star, Building, Phone, Mail, MapPin, FileText, CheckCircle2, Home, DollarSign, Camera, Layout } from 'lucide-react';

interface Vendor {
  type: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

interface VendorPreferencesData {
  titleCompany?: Vendor;
  homeInspector?: Vendor;
  termiteInspector?: Vendor;
  lender?: Vendor;
  photographer?: Vendor;
  stagingCompany?: Vendor;
  otherVendors?: Vendor[];
}

interface VendorPreferencesStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: (data: VendorPreferencesData) => void;
  initialData?: VendorPreferencesData;
}

const VendorPreferencesStep: React.FC<VendorPreferencesStepProps> = ({ 
  onNext, 
  onPrevious, 
  onSubmit, 
  initialData 
}) => {
  const [titleCompany, setTitleCompany] = useState<Vendor>(initialData?.titleCompany || {
    type: 'Title Company',
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [homeInspector, setHomeInspector] = useState<Vendor>(initialData?.homeInspector || {
    type: 'Home Inspector',
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [termiteInspector, setTermiteInspector] = useState<Vendor>(initialData?.termiteInspector || {
    type: 'Termite Inspector',
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [lender, setLender] = useState<Vendor>(initialData?.lender || {
    type: 'Lender',
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [photographer, setPhotographer] = useState<Vendor>(initialData?.photographer || {
    type: 'Photographer',
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [stagingCompany, setStagingCompany] = useState<Vendor>(initialData?.stagingCompany || {
    type: 'Staging Company',
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [otherVendors, setOtherVendors] = useState<Vendor[]>(initialData?.otherVendors || []);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAddOtherVendor = () => {
    setOtherVendors([
      ...otherVendors,
      {
        type: '',
        name: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      },
    ]);
  };

  const handleRemoveOtherVendor = (index: number) => {
    const newVendors = [...otherVendors];
    newVendors.splice(index, 1);
    setOtherVendors(newVendors);
  };

  const handleOtherVendorChange = (index: number, field: keyof Vendor, value: string) => {
    const newVendors = [...otherVendors];
    newVendors[index][field] = value;
    setOtherVendors(newVendors);
  };

  const handleSubmit = () => {
    const data = {
      titleCompany,
      homeInspector,
      termiteInspector,
      lender,
      photographer,
      stagingCompany,
      otherVendors,
    };
    onSubmit(data);
    onNext();
  };

  return (
    <Card className="card-brand border-0 shadow-brand-glass">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Vendor Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="title-company">
            <AccordionTrigger>
              <Building className="mr-2 h-4 w-4" />
              Title Company
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titleCompanyName">Name</Label>
                  <Input
                    type="text"
                    id="titleCompanyName"
                    value={titleCompany.name}
                    onChange={(e) => setTitleCompany({ ...titleCompany, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleCompanyContactName">Contact Name</Label>
                  <Input
                    type="text"
                    id="titleCompanyContactName"
                    value={titleCompany.contactName}
                    onChange={(e) => setTitleCompany({ ...titleCompany, contactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleCompanyPhone">Phone</Label>
                  <Input
                    type="tel"
                    id="titleCompanyPhone"
                    value={titleCompany.phone}
                    onChange={(e) => setTitleCompany({ ...titleCompany, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleCompanyEmail">Email</Label>
                  <Input
                    type="email"
                    id="titleCompanyEmail"
                    value={titleCompany.email}
                    onChange={(e) => setTitleCompany({ ...titleCompany, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleCompanyAddress">Address</Label>
                  <Input
                    type="text"
                    id="titleCompanyAddress"
                    value={titleCompany.address}
                    onChange={(e) => setTitleCompany({ ...titleCompany, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleCompanyNotes">Notes</Label>
                  <Textarea
                    id="titleCompanyNotes"
                    value={titleCompany.notes}
                    onChange={(e) => setTitleCompany({ ...titleCompany, notes: e.target.value })}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="home-inspector">
            <AccordionTrigger>
              <Home className="mr-2 h-4 w-4" />
              Home Inspector
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeInspectorName">Name</Label>
                  <Input
                    type="text"
                    id="homeInspectorName"
                    value={homeInspector.name}
                    onChange={(e) => setHomeInspector({ ...homeInspector, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeInspectorContactName">Contact Name</Label>
                  <Input
                    type="text"
                    id="homeInspectorContactName"
                    value={homeInspector.contactName}
                    onChange={(e) => setHomeInspector({ ...homeInspector, contactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeInspectorPhone">Phone</Label>
                  <Input
                    type="tel"
                    id="homeInspectorPhone"
                    value={homeInspector.phone}
                    onChange={(e) => setHomeInspector({ ...homeInspector, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeInspectorEmail">Email</Label>
                  <Input
                    type="email"
                    id="homeInspectorEmail"
                    value={homeInspector.email}
                    onChange={(e) => setHomeInspector({ ...homeInspector, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeInspectorAddress">Address</Label>
                  <Input
                    type="text"
                    id="homeInspectorAddress"
                    value={homeInspector.address}
                    onChange={(e) => setHomeInspector({ ...homeInspector, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeInspectorNotes">Notes</Label>
                  <Textarea
                    id="homeInspectorNotes"
                    value={homeInspector.notes}
                    onChange={(e) => setHomeInspector({ ...homeInspector, notes: e.target.value })}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="termite-inspector">
            <AccordionTrigger>
              <FileText className="mr-2 h-4 w-4" />
              Termite Inspector
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="termiteInspectorName">Name</Label>
                  <Input
                    type="text"
                    id="termiteInspectorName"
                    value={termiteInspector.name}
                    onChange={(e) => setTermiteInspector({ ...termiteInspector, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termiteInspectorContactName">Contact Name</Label>
                  <Input
                    type="text"
                    id="termiteInspectorContactName"
                    value={termiteInspector.contactName}
                    onChange={(e) => setTermiteInspector({ ...termiteInspector, contactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termiteInspectorPhone">Phone</Label>
                  <Input
                    type="tel"
                    id="termiteInspectorPhone"
                    value={termiteInspector.phone}
                    onChange={(e) => setTermiteInspector({ ...termiteInspector, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termiteInspectorEmail">Email</Label>
                  <Input
                    type="email"
                    id="termiteInspectorEmail"
                    value={termiteInspector.email}
                    onChange={(e) => setTermiteInspector({ ...termiteInspector, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termiteInspectorAddress">Address</Label>
                  <Input
                    type="text"
                    id="termiteInspectorAddress"
                    value={termiteInspector.address}
                    onChange={(e) => setTermiteInspector({ ...termiteInspector, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termiteInspectorNotes">Notes</Label>
                  <Textarea
                    id="termiteInspectorNotes"
                    value={termiteInspector.notes}
                    onChange={(e) => setTermiteInspector({ ...termiteInspector, notes: e.target.value })}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="lender">
            <AccordionTrigger>
              <DollarSign className="mr-2 h-4 w-4" />
              Lender
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lenderName">Name</Label>
                  <Input
                    type="text"
                    id="lenderName"
                    value={lender.name}
                    onChange={(e) => setLender({ ...lender, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lenderContactName">Contact Name</Label>
                  <Input
                    type="text"
                    id="lenderContactName"
                    value={lender.contactName}
                    onChange={(e) => setLender({ ...lender, contactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lenderPhone">Phone</Label>
                  <Input
                    type="tel"
                    id="lenderPhone"
                    value={lender.phone}
                    onChange={(e) => setLender({ ...lender, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lenderEmail">Email</Label>
                  <Input
                    type="email"
                    id="lenderEmail"
                    value={lender.email}
                    onChange={(e) => setLender({ ...lender, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lenderAddress">Address</Label>
                  <Input
                    type="text"
                    id="lenderAddress"
                    value={lender.address}
                    onChange={(e) => setLender({ ...lender, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lenderNotes">Notes</Label>
                  <Textarea
                    id="lenderNotes"
                    value={lender.notes}
                    onChange={(e) => setLender({ ...lender, notes: e.target.value })}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="photographer">
            <AccordionTrigger>
              <Camera className="mr-2 h-4 w-4" />
              Photographer
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="photographerName">Name</Label>
                  <Input
                    type="text"
                    id="photographerName"
                    value={photographer.name}
                    onChange={(e) => setPhotographer({ ...photographer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photographerContactName">Contact Name</Label>
                  <Input
                    type="text"
                    id="photographerContactName"
                    value={photographer.contactName}
                    onChange={(e) => setPhotographer({ ...photographer, contactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photographerPhone">Phone</Label>
                  <Input
                    type="tel"
                    id="photographerPhone"
                    value={photographer.phone}
                    onChange={(e) => setPhotographer({ ...photographer, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photographerEmail">Email</Label>
                  <Input
                    type="email"
                    id="photographerEmail"
                    value={photographer.email}
                    onChange={(e) => setPhotographer({ ...photographer, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photographerAddress">Address</Label>
                  <Input
                    type="text"
                    id="photographerAddress"
                    value={photographer.address}
                    onChange={(e) => setPhotographer({ ...photographer, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photographerNotes">Notes</Label>
                  <Textarea
                    id="photographerNotes"
                    value={photographer.notes}
                    onChange={(e) => setPhotographer({ ...photographer, notes: e.target.value })}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="staging-company">
            <AccordionTrigger>
              <Layout className="mr-2 h-4 w-4" />
              Staging Company
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stagingCompanyName">Name</Label>
                  <Input
                    type="text"
                    id="stagingCompanyName"
                    value={stagingCompany.name}
                    onChange={(e) => setStagingCompany({ ...stagingCompany, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stagingCompanyContactName">Contact Name</Label>
                  <Input
                    type="text"
                    id="stagingCompanyContactName"
                    value={stagingCompany.contactName}
                    onChange={(e) => setStagingCompany({ ...stagingCompany, contactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stagingCompanyPhone">Phone</Label>
                  <Input
                    type="tel"
                    id="stagingCompanyPhone"
                    value={stagingCompany.phone}
                    onChange={(e) => setStagingCompany({ ...stagingCompany, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stagingCompanyEmail">Email</Label>
                  <Input
                    type="email"
                    id="stagingCompanyEmail"
                    value={stagingCompany.email}
                    onChange={(e) => setStagingCompany({ ...stagingCompany, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stagingCompanyAddress">Address</Label>
                  <Input
                    type="text"
                    id="stagingCompanyAddress"
                    value={stagingCompany.address}
                    onChange={(e) => setStagingCompany({ ...stagingCompany, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stagingCompanyNotes">Notes</Label>
                  <Textarea
                    id="stagingCompanyNotes"
                    value={stagingCompany.notes}
                    onChange={(e) => setStagingCompany({ ...stagingCompany, notes: e.target.value })}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Other Vendors</h4>
            <Button type="button" variant="outline" size="sm" onClick={handleAddOtherVendor}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </div>
          {otherVendors.map((vendor, index) => (
            <Card key={index} className="mb-4">
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`otherVendorType-${index}`}>Type</Label>
                    <Input
                      type="text"
                      id={`otherVendorType-${index}`}
                      value={vendor.type}
                      onChange={(e) => handleOtherVendorChange(index, 'type', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`otherVendorName-${index}`}>Name</Label>
                    <Input
                      type="text"
                      id={`otherVendorName-${index}`}
                      value={vendor.name}
                      onChange={(e) => handleOtherVendorChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`otherVendorContactName-${index}`}>Contact Name</Label>
                    <Input
                      type="text"
                      id={`otherVendorContactName-${index}`}
                      value={vendor.contactName}
                      onChange={(e) => handleOtherVendorChange(index, 'contactName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`otherVendorPhone-${index}`}>Phone</Label>
                    <Input
                      type="tel"
                      id={`otherVendorPhone-${index}`}
                      value={vendor.phone}
                      onChange={(e) => handleOtherVendorChange(index, 'phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`otherVendorEmail-${index}`}>Email</Label>
                    <Input
                      type="email"
                      id={`otherVendorEmail-${index}`}
                      value={vendor.email}
                      onChange={(e) => handleOtherVendorChange(index, 'email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`otherVendorAddress-${index}`}>Address</Label>
                    <Input
                      type="text"
                      id={`otherVendorAddress-${index}`}
                      value={vendor.address}
                      onChange={(e) => handleOtherVendorChange(index, 'address', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`otherVendorNotes-${index}`}>Notes</Label>
                    <Textarea
                      id={`otherVendorNotes-${index}`}
                      value={vendor.notes}
                      onChange={(e) => handleOtherVendorChange(index, 'notes', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveOtherVendor(index)}
                    className="mt-4"
                  >
                    <Minus className="mr-2 h-4 w-4" />
                    Remove Vendor
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={onPrevious}>
            Previous
          </Button>
          <Button onClick={handleSubmit}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorPreferencesStep;
