
import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Star } from 'lucide-react';

const Services = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-6">
            SERVICE OFFERINGS
          </h1>
          <div className="w-32 h-px bg-brand-taupe mx-auto mb-8"></div>
          <p className="text-xl text-brand-charcoal/80 font-brand-body max-w-3xl mx-auto">
            Comprehensive transaction coordination and support services tailored to your business needs.
          </p>
        </div>
      </section>

      {/* Service Tiers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Buyer Core */}
            <Card className="card-brand">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl mb-4">BUYER CORE</CardTitle>
                <div className="text-4xl font-brand-heading font-bold text-brand-charcoal mb-2">$400</div>
                <CardDescription className="text-lg">Per transaction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-brand-taupe-dark mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-brand-body text-brand-charcoal font-medium">Contract Management</span>
                    <p className="text-sm text-brand-charcoal/70 font-brand-body">Professional contract review and management</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-brand-taupe-dark mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-brand-body text-brand-charcoal font-medium">Timeline Coordination</span>
                    <p className="text-sm text-brand-charcoal/70 font-brand-body">Detailed timeline creation and tracking</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-brand-taupe-dark mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-brand-body text-brand-charcoal font-medium">Deadline Management</span>
                    <p className="text-sm text-brand-charcoal/70 font-brand-body">Critical date tracking and reminders</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-brand-taupe-dark mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-brand-body text-brand-charcoal font-medium">Document Organization</span>
                    <p className="text-sm text-brand-charcoal/70 font-brand-body">Systematic file management</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-8" onClick={() => navigate('/contact')}>
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Buyer Elite */}
            <Card className="card-brand border-brand-taupe/50 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-brand-taupe-dark text-brand-background px-6 py-2 rounded-full">
                  <span className="font-brand-heading text-sm tracking-brand-wide uppercase">Most Popular</span>
                </div>
              </div>
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-3xl mb-4">BUYER ELITE</CardTitle>
                <div className="text-4xl font-brand-heading font-bold text-brand-charcoal mb-2">$600</div>
                <CardDescription className="text-lg">Per transaction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-brand-taupe-dark">
                  <Star className="h-5 w-5" />
                  <span className="font-brand-body font-medium">Everything in Buyer Core, plus:</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-brand-taupe-dark mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-brand-body text-brand-charcoal font-medium">Client Communication</span>
                    <p className="text-sm text-brand-charcoal/70 font-brand-body">Professional client updates and correspondence</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-brand-taupe-dark mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-brand-body text-brand-charcoal font-medium">Vendor Coordination</span>
                    <p className="text-sm text-brand-charcoal/70 font-brand-body">Inspection and service provider scheduling</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-brand-taupe-dark mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-brand-body text-brand-charcoal font-medium">Priority Support</span>
                    <p className="text-sm text-brand-charcoal/70 font-brand-body">Expedited response times</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-brand-taupe-dark mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-brand-body text-brand-charcoal font-medium">Progress Reports</span>
                    <p className="text-sm text-brand-charcoal/70 font-brand-body">Weekly transaction status updates</p>
                  </div>
                </div>
                <Button variant="brand" className="w-full mt-8" onClick={() => navigate('/contact')}>
                  Choose Elite
                </Button>
              </CardContent>
            </Card>

            {/* White-Glove */}
            <Card className="card-brand">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl mb-4">WHITE-GLOVE</CardTitle>
                <div className="text-4xl font-brand-heading font-bold text-brand-charcoal mb-2">$800</div>
                <CardDescription className="text-lg">Per transaction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-brand-taupe-dark">
                  <Star className="h-5 w-5" />
                  <span className="font-brand-body font-medium">Everything in Buyer Elite, plus:</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-brand-taupe-dark mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-brand-body text-brand-charcoal font-medium">Full Transaction Management</span>
                    <p className="text-sm text-brand-charcoal/70 font-brand-body">Complete hands-off experience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-brand-taupe-dark mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-brand-body text-brand-charcoal font-medium">Dedicated Coordinator</span>
                    <p className="text-sm text-brand-charcoal/70 font-brand-body">Single point of contact throughout</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-brand-taupe-dark mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-brand-body text-brand-charcoal font-medium">Closing Coordination</span>
                    <p className="text-sm text-brand-charcoal/70 font-brand-body">Complete closing management</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-brand-taupe-dark mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-brand-body text-brand-charcoal font-medium">24/7 Support</span>
                    <p className="text-sm text-brand-charcoal/70 font-brand-body">Always available when you need us</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-8" onClick={() => navigate('/contact')}>
                  Ultimate Service
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* On-Demand Services */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-6">
              ON-DEMAND SERVICES
            </h2>
            <p className="text-lg text-brand-charcoal/70 font-brand-body max-w-2xl mx-auto">
              Individual services available as needed for specific support requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-brand text-center">
              <CardHeader>
                <CardTitle className="text-xl">CONTRACT REVIEW</CardTitle>
                <div className="text-2xl font-brand-heading font-bold text-brand-charcoal">$75</div>
              </CardHeader>
              <CardContent>
                <p className="font-brand-body text-brand-charcoal/70 text-sm">Professional contract analysis and recommendations</p>
              </CardContent>
            </Card>

            <Card className="card-brand text-center">
              <CardHeader>
                <CardTitle className="text-xl">TIMELINE CREATION</CardTitle>
                <div className="text-2xl font-brand-heading font-bold text-brand-charcoal">$50</div>
              </CardHeader>
              <CardContent>
                <p className="font-brand-body text-brand-charcoal/70 text-sm">Detailed transaction timeline with key milestones</p>
              </CardContent>
            </Card>

            <Card className="card-brand text-center">
              <CardHeader>
                <CardTitle className="text-xl">COMMUNICATION DRAFT</CardTitle>
                <div className="text-2xl font-brand-heading font-bold text-brand-charcoal">$25</div>
              </CardHeader>
              <CardContent>
                <p className="font-brand-body text-brand-charcoal/70 text-sm">Professional client and vendor correspondence</p>
              </CardContent>
            </Card>

            <Card className="card-brand text-center">
              <CardHeader>
                <CardTitle className="text-xl">DOCUMENT PREP</CardTitle>
                <div className="text-2xl font-brand-heading font-bold text-brand-charcoal">$35</div>
              </CardHeader>
              <CardContent>
                <p className="font-brand-body text-brand-charcoal/70 text-sm">Form completion and document preparation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-6">
            READY TO GET STARTED?
          </h2>
          <p className="text-xl text-brand-charcoal/80 font-brand-body mb-8 max-w-2xl mx-auto">
            Choose the service level that best fits your needs, or contact us for a custom solution.
          </p>
          <Button 
            variant="brand" 
            size="lg"
            onClick={() => navigate('/contact')}
            className="text-xl px-12 py-6"
          >
            Schedule Consultation
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Services;
