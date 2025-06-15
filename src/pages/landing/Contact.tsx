
import React, { useState } from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Calendar,
  Star,
  CheckCircle,
  ArrowRight,
  Building2,
  Users,
  Zap
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    transactionVolume: '',
    serviceInterest: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Direct Line",
      value: "(555) 123-4567",
      description: "Speak directly with our coordination team"
    },
    {
      icon: Mail,
      title: "Email Concierge",
      value: "hello@agentconcierge.com", 
      description: "Detailed inquiries and consultation requests"
    },
    {
      icon: MapPin,
      title: "Service Area",
      value: "Nationwide Coverage",
      description: "Premium coordination across all major markets"
    },
    {
      icon: Clock,
      title: "Response Time",
      value: "Within 2 Hours",
      description: "Elite support when you need it most"
    }
  ];

  const consultationBenefits = [
    "Personalized service tier recommendations",
    "Workflow optimization analysis", 
    "Custom pricing based on your volume",
    "Implementation timeline planning"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-brand-taupe/30 mb-8">
              <Calendar className="h-5 w-5 text-brand-charcoal mr-3" />
              <span className="text-brand-charcoal font-brand-heading tracking-wide uppercase">Begin Your Journey</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-6">
              SCHEDULE YOUR
              <br />
              <span className="text-brand-taupe-dark">CONSULTATION</span>
            </h1>
            
            <div className="w-32 h-1 bg-gradient-to-r from-brand-taupe to-brand-taupe-dark mx-auto mb-8"></div>
            
            <p className="text-xl font-brand-body text-brand-charcoal/80 leading-relaxed max-w-3xl mx-auto">
              Discover how elite transaction coordination can transform your practice. 
              Every conversation begins with understanding your unique needs and aspirations.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Contact Form - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/30 shadow-brand-elevation">
                <CardContent className="p-10">
                  <div className="mb-8">
                    <h2 className="text-3xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
                      CONSULTATION REQUEST
                    </h2>
                    <p className="font-brand-body text-brand-charcoal/70">
                      Share your details below and we'll craft a personalized coordination solution for your practice.
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-brand-charcoal font-brand-heading tracking-wide uppercase text-sm">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="border-brand-taupe/50 focus:border-brand-taupe bg-white/80 h-12"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-brand-charcoal font-brand-heading tracking-wide uppercase text-sm">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="border-brand-taupe/50 focus:border-brand-taupe bg-white/80 h-12"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-brand-charcoal font-brand-heading tracking-wide uppercase text-sm">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="border-brand-taupe/50 focus:border-brand-taupe bg-white/80 h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-brand-charcoal font-brand-heading tracking-wide uppercase text-sm">
                          Brokerage/Company
                        </Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          className="border-brand-taupe/50 focus:border-brand-taupe bg-white/80 h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="transactionVolume" className="text-brand-charcoal font-brand-heading tracking-wide uppercase text-sm">
                        Annual Transaction Volume
                      </Label>
                      <select
                        id="transactionVolume"
                        value={formData.transactionVolume}
                        onChange={(e) => setFormData(prev => ({ ...prev, transactionVolume: e.target.value }))}
                        className="w-full border border-brand-taupe/50 focus:border-brand-taupe bg-white/80 h-12 rounded-md px-4 font-brand-body"
                      >
                        <option value="">Select volume range</option>
                        <option value="1-10">1-10 transactions</option>
                        <option value="11-25">11-25 transactions</option>
                        <option value="26-50">26-50 transactions</option>
                        <option value="51-100">51-100 transactions</option>
                        <option value="100+">100+ transactions</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="serviceInterest" className="text-brand-charcoal font-brand-heading tracking-wide uppercase text-sm">
                        Service Interest
                      </Label>
                      <select
                        id="serviceInterest"
                        value={formData.serviceInterest}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceInterest: e.target.value }))}
                        className="w-full border border-brand-taupe/50 focus:border-brand-taupe bg-white/80 h-12 rounded-md px-4 font-brand-body"
                      >
                        <option value="">Select service tier</option>
                        <option value="essential">Essential Coordination</option>
                        <option value="premium">Premium Coordination</option>
                        <option value="elite">Elite Concierge</option>
                        <option value="consultation">Need Consultation</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-brand-charcoal font-brand-heading tracking-wide uppercase text-sm">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="border-brand-taupe/50 focus:border-brand-taupe bg-white/80 min-h-32"
                        placeholder="Tell us about your current challenges and what you'd like to achieve..."
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide text-lg py-4 group"
                    >
                      Schedule My Consultation
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Contact Info & Benefits Sidebar */}
            <div className="space-y-8">
              
              {/* Contact Methods */}
              <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/30 shadow-brand-elevation">
                <CardContent className="p-8">
                  <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-6 uppercase">
                    Connect Directly
                  </h3>
                  
                  <div className="space-y-6">
                    {contactMethods.map((method, index) => (
                      <div key={index} className="flex items-start gap-4 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <method.icon className="h-6 w-6 text-brand-charcoal" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-brand-heading text-brand-charcoal tracking-wide text-sm uppercase mb-1">
                            {method.title}
                          </h4>
                          <p className="font-bold text-brand-charcoal mb-1">{method.value}</p>
                          <p className="text-sm font-brand-body text-brand-charcoal/70">{method.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Consultation Benefits */}
              <Card className="bg-gradient-to-br from-brand-charcoal to-brand-taupe-dark text-brand-background shadow-brand-elevation">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Star className="h-6 w-6 text-brand-taupe" />
                    <h3 className="text-xl font-brand-heading font-semibold tracking-brand-wide uppercase">
                      Consultation Includes
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {consultationBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-brand-taupe mt-0.5 flex-shrink-0" />
                        <span className="font-brand-body text-brand-background/90 leading-relaxed">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-brand-background/20">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-brand-background mb-2">30 Min</div>
                      <div className="text-sm font-brand-heading tracking-wide text-brand-background/80 uppercase">Complimentary Session</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Success Stories Preview */}
              <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/30 shadow-brand-elevation">
                <CardContent className="p-8">
                  <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-6 uppercase">
                    Success Stories
                  </h3>
                  
                  <div className="space-y-6">
                    {[
                      { metric: "47%", description: "Average increase in transaction velocity" },
                      { metric: "98%", description: "Client satisfaction rate maintained" },
                      { metric: "15hrs", description: "Weekly time savings per agent" }
                    ].map((stat, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe/20 to-brand-taupe-dark/20 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-lg font-bold text-brand-charcoal">{stat.metric}</div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-brand-body text-brand-charcoal/80 text-sm leading-relaxed">
                            {stat.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
