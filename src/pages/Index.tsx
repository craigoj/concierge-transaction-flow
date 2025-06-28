import Breadcrumb from "@/components/navigation/Breadcrumb";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AppLayout from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Building, Users, Calendar, AlertCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Fetch transactions for the main pane
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients!clients_transaction_id_fkey(full_name, type),
          profiles!transactions_agent_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const activeTransactions = transactions?.filter(t => t.status === 'active') || [];

  const handleDashboardAction = (action: string) => {
    switch (action) {
      case 'new-transaction':
        navigate('/transactions');
        break;
      case 'schedule-inspection':
        navigate('/calendar/new');
        break;
      case 'lockbox-setup':
        // Handle lockbox setup
        break;
      case 'add-client':
        navigate('/clients/new');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // Priority Actions Sidebar Component
  const PriorityActionsSidebar = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Priority Actions */}
      <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
            <h3 className="text-lg md:text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase">
              Priority Actions
            </h3>
          </div>
          <div className="space-y-4 md:space-y-6">
            {[
              { action: "Schedule Inspection", property: "Oak Street", urgency: "high" },
              { action: "Title Review Due", property: "Pine Avenue", urgency: "medium" },
              { action: "Document Upload", property: "Maple Drive", urgency: "low" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-brand-background/50 hover:bg-brand-background/80 transition-colors border border-brand-taupe/20 hover:border-brand-taupe/40">
                <div className="min-w-0 flex-1">
                  <p className="font-brand-body text-brand-charcoal font-medium text-sm md:text-base">{item.action}</p>
                  <p className="text-xs md:text-sm text-brand-charcoal/60">{item.property}</p>
                </div>
                <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0 ml-3 ${
                  item.urgency === 'high' ? 'bg-red-400' :
                  item.urgency === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                } shadow-sm`}></div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Market Pulse */}
      <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
        <div className="p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase mb-6 md:mb-8">
            Market Pulse
          </h3>
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brand-charcoal mb-2">
                18
              </div>
              <div className="text-xs md:text-sm font-brand-heading tracking-wide text-brand-charcoal/60 uppercase">
                Days Avg Close
              </div>
            </div>
            <div className="flex justify-between items-center p-3 md:p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="font-brand-body text-brand-charcoal/70 text-sm md:text-base">This Month</span>
              <span className="font-bold text-emerald-600 text-sm md:text-base">↗ 2 days faster</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <Breadcrumb />
        </div>

        {/* Mobile Header with Menu Toggle */}
        {isMobile && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider">
              COORDINATION
            </h1>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="p-4">
                  <PriorityActionsSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        {/* Hero Section - Mobile Optimized */}
        {!isMobile && (
          <div className="mb-12 md:mb-16 text-center">
            <h1 className="text-4xl md:text-6xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-4 md:mb-6">
              COORDINATION
            </h1>
            <div className="w-24 md:w-32 h-px bg-brand-taupe mx-auto mb-6 md:mb-8"></div>
            <p className="text-lg md:text-xl font-brand-body text-brand-charcoal/80 max-w-2xl mx-auto leading-relaxed">
              Your premium transaction coordination workspace, designed for discerning real estate professionals.
            </p>
          </div>
        )}

        {/* Timeframe Selector - Mobile Optimized */}
        <div className="flex justify-center mb-8 md:mb-16">
          <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-brand-taupe/30 p-1 md:p-2 shadow-brand-subtle w-full max-w-sm md:max-w-none">
            {[
              { key: 'today', label: 'TODAY' },
              { key: 'week', label: 'THIS WEEK' },
              { key: 'month', label: 'THIS MONTH' }
            ].map((timeframe) => (
              <button
                key={timeframe.key}
                onClick={() => setSelectedTimeframe(timeframe.key)}
                className={`flex-1 md:flex-none md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-brand-heading tracking-brand-wide transition-all duration-300 ${
                  selectedTimeframe === timeframe.key
                    ? 'bg-brand-charcoal text-brand-background shadow-brand-elevation'
                    : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-brand-taupe/10'
                }`}
              >
                {isMobile ? timeframe.label.split(' ')[0] : timeframe.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats 
          variant="premium" 
          showQuickActions={true}
          onActionClick={handleDashboardAction}
          className="mb-8 md:mb-16"
        />

        {/* Main Dashboard Layout */}
        <div className={`grid gap-6 md:gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-4'}`}>
          
          {/* Primary Coordination Panel */}
          <div className={isMobile ? '' : 'xl:col-span-3'}>
            <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation overflow-hidden">
              <div className="p-6 md:p-10 border-b border-brand-taupe/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl md:text-3xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase mb-2 md:mb-3">
                      Active Coordination
                    </h3>
                    <p className="font-brand-body text-brand-charcoal/70 text-base md:text-lg">
                      {activeTransactions.length} transactions requiring your expertise
                    </p>
                  </div>
                  <Button 
                    className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-6 md:px-8 py-2 md:py-3 rounded-xl shadow-brand-subtle w-full md:w-auto"
                  >
                    VIEW ALL
                  </Button>
                </div>
              </div>
              
              <div className="p-6 md:p-10 max-h-80 md:max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-12 md:py-16">
                    <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-brand-taupe border-t-brand-charcoal rounded-full animate-spin mx-auto mb-4 md:mb-6"></div>
                    <p className="font-brand-body text-brand-charcoal/60 text-base md:text-lg">Loading coordination data...</p>
                  </div>
                ) : activeTransactions.length > 0 ? (
                  <div className="space-y-4 md:space-y-8">
                    {activeTransactions.slice(0, 4).map((transaction) => (
                      <div key={transaction.id} className="group border border-brand-taupe/30 rounded-xl md:rounded-2xl p-4 md:p-8 hover:border-brand-taupe hover:shadow-brand-subtle transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-0 mb-4 md:mb-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                              <Building className="h-5 w-5 md:h-6 md:w-6 text-brand-charcoal/60 flex-shrink-0" />
                              <h4 className="font-brand-heading tracking-wide text-brand-charcoal uppercase text-base md:text-lg truncate">
                                {transaction.property_address}
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 text-sm md:text-base">
                              <div className="flex items-center gap-2 md:gap-3">
                                <Users className="h-4 w-4 md:h-5 md:w-5 text-brand-charcoal/50 flex-shrink-0" />
                                <span className="font-brand-body text-brand-charcoal/70 truncate">
                                  {transaction.clients?.[0]?.full_name || 'Client TBD'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 md:gap-3">
                                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-brand-charcoal/50 flex-shrink-0" />
                                <span className="font-brand-body text-brand-charcoal/70">
                                  {transaction.closing_date ? new Date(transaction.closing_date).toLocaleDateString() : 'Date TBD'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left md:text-right flex-shrink-0">
                            <div className="text-xl md:text-2xl font-bold text-brand-charcoal mb-1 md:mb-2">
                              ${transaction.purchase_price?.toLocaleString() || 'TBD'}
                            </div>
                            <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-brand-heading tracking-wide bg-blue-100 text-blue-800">
                              COORDINATING
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 md:py-16">
                    <Building className="h-12 w-12 md:h-16 md:w-16 mx-auto text-brand-taupe mb-4 md:mb-6" />
                    <h4 className="font-brand-heading text-brand-charcoal uppercase tracking-wide mb-2 md:mb-3 text-lg md:text-xl">
                      No Active Coordination
                    </h4>
                    <p className="font-brand-body text-brand-charcoal/60 text-base md:text-lg">
                      All transactions are operating smoothly
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Desktop Only */}
          {!isMobile && (
            <div className="xl:col-span-1">
              <PriorityActionsSidebar />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
