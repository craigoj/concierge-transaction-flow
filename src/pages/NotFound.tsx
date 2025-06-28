
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream to-brand-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-brand-elevation">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-brand-taupe/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-bold text-brand-charcoal">404</span>
          </div>
          
          <h1 className="text-2xl font-brand-heading font-bold text-brand-charcoal mb-3 tracking-brand-wide">
            PAGE NOT FOUND
          </h1>
          
          <p className="text-brand-charcoal/70 font-brand-body mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full gap-2 font-brand-heading tracking-wide"
            >
              <Home className="h-4 w-4" />
              Return to Dashboard
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full gap-2 font-brand-heading tracking-wide"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-brand-taupe/20">
            <p className="text-xs text-brand-charcoal/50 font-brand-body">
              Route: {location.pathname}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
