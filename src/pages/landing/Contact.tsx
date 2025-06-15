
import React, { useState } from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    brokerage: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-6">
            LET'S CONNECT
          </h1>
          <div className="w-32 h-px bg-brand-taupe mx-auto mb-8"></div>
          <p className="text-xl text-brand-charcoal/80 font-brand-body max-w-3xl mx-auto">
            Ready to experience white-glove transaction coordination? Let's discuss how we can 
            elevate your real estate practice together.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <Card className="card-brand">
            <CardHeader>
              <CardTitle className="text-3xl text-center">BOOK YOUR CONSULTATION</CardTitle>
              <CardDescription className="text-center text-lg">
                Schedule a complimentary consultation to explore how we can support your success.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-brand-body text-brand-charcoal">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-brand-body text-brand-charcoal">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-brand-body text-brand-charcoal">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brokerage" className="font-brand-body text-brand-charcoal">Brokerage</Label>
                    <Input
                      id="brokerage"
                      name="brokerage"
                      type="text"
                      value={formData.brokerage}
                      onChange={handleChange}
                      className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="font-brand-body text-brand-charcoal">
                    How can we help you achieve excellence?
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
                    placeholder="Tell us about your current challenges and goals..."
                  />
                </div>

                <Button type="submit" variant="brand" className="w-full text-lg py-6">
                  Schedule Your Consultation
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="card-brand">
              <CardHeader>
                <CardTitle className="text-2xl">GET IN TOUCH</CardTitle>
                <CardDescription className="text-lg">
                  We're here to answer your questions and discuss how we can support your success.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-xl flex items-center justify-center">
                    <Phone className="h-6 w-6 text-brand-charcoal" />
                  </div>
                  <div>
                    <h4 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-1">
                      PHONE
                    </h4>
                    <p className="font-brand-body text-brand-charcoal/80">(555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-xl flex items-center justify-center">
                    <Mail className="h-6 w-6 text-brand-charcoal" />
                  </div>
                  <div>
                    <h4 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-1">
                      EMAIL
                    </h4>
                    <p className="font-brand-body text-brand-charcoal/80">hello@theagentconcierge.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-brand-charcoal" />
                  </div>
                  <div>
                    <h4 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-1">
                      LOCATION
                    </h4>
                    <p className="font-brand-body text-brand-charcoal/80">
                      Serving Real Estate Professionals<br />
                      Nationwide
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-brand">
              <CardHeader>
                <CardTitle className="text-2xl">BUSINESS HOURS</CardTitle>
                <CardDescription className="text-lg">
                  When you can reach us for immediate support.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-brand-charcoal" />
                  </div>
                  <div className="space-y-2 font-brand-body text-brand-charcoal/80">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>8:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>9:00 AM - 3:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>By Appointment</span>
                    </div>
                    <div className="pt-4 border-t border-brand-taupe/20">
                      <p className="text-sm italic">
                        Emergency support available 24/7 for White-Glove clients
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-brand">
              <CardContent className="pt-8 text-center">
                <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
                  EXISTING CLIENT?
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 mb-6">
                  Access your personalized dashboard and transaction management portal.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/auth')}
                >
                  Agent Portal Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-brand-background py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-brand-charcoal font-brand-heading font-bold text-2xl tracking-brand-wide">AC</span>
          </div>
          <h3 className="text-2xl font-brand-heading font-semibold tracking-brand-wide mb-2">
            THE AGENT CONCIERGE
          </h3>
          <p className="text-brand-background/70 font-brand-body mb-6">
            REALTOR SUPPORT & SUCCESS CO.
          </p>
          <p className="text-brand-background/60 font-brand-body italic">
            "Excellence is Intentional."
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
