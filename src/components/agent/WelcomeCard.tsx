
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Home } from 'lucide-react';

interface WelcomeCardProps {
  onNewTransaction: () => void;
}

const WelcomeCard = ({ onNewTransaction }: WelcomeCardProps) => {
  return (
    <Card className="border-brand-taupe/20 shadow-brand-elevation bg-gradient-to-br from-brand-cream via-white to-brand-cream/50">
      <CardContent className="p-12 text-center">
        <div className="w-20 h-20 bg-brand-charcoal rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Home className="h-10 w-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-brand-heading font-semibold text-brand-charcoal mb-6 tracking-brand-wide">
          Your portal is ready
        </h2>
        
        <p className="text-brand-charcoal/70 font-brand-serif text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Let's make your next transaction exceptional. When you're ready to begin, we're here to coordinate every detail with precision and care.
        </p>
        
        <div className="w-20 h-px bg-brand-taupe mx-auto mb-8"></div>
        
        <Button
          onClick={onNewTransaction}
          size="lg"
          className="bg-brand-charcoal hover:bg-brand-charcoal/90 text-white rounded-xl font-brand-heading font-medium tracking-wide shadow-brand-subtle px-10 py-4 text-lg"
        >
          <Plus className="h-6 w-6 mr-3" />
          Submit New Transaction
        </Button>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
