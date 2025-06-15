
import Breadcrumb from "@/components/navigation/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Building, Calendar, Clock, DollarSign, TrendingUp, Users, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const isMobile = useIsMobile();

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
  const pendingTransactions = transactions?.filter(t => t.status === 'intake') || [];
  const closedThisMonth = transactions?.filter(t => 
    t.status === 'closed' && 
    new Date(t.closing_date || '').getMonth() === new Date().getMonth()
  ) || [];

  const totalVolume = closedThisMonth.reduce((sum, t) => sum + (t.purchase_price || 0), 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <Breadcrumb />
      </div>

      {/* Hero Section with Better Spacing */}
      <div className="mb-16 text-center">
        <h1 className="text-6xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-6">
          COORDINATION
        </h1>
        <div className="w-32 h-px bg-brand-taupe mx-auto mb-8"></div>
        <p className="text-xl font-brand-body text-brand-charcoal/80 max-w-2xl mx-auto leading-relaxed">
          Your premium transaction coordination workspace, designed for discerning real estate professionals.
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center mb-16">
        <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-2xl border border-brand-taupe/30 p-2 shadow-brand-subtle">
          {[
            { key: 'today', label: 'TODAY' },
            { key: 'week', label: 'THIS WEEK' },
            { key: 'month', label: 'THIS MONTH' }
          ].map((timeframe) => (
            <button
              key={timeframe.key}
              onClick={() => setSelectedTimeframe(timeframe.key)}
              className={`px-8 py-3 rounded-xl text-sm font-brand-heading tracking-brand-wide transition-all duration-300 ${
                selectedTimeframe === timeframe.key
                  ? 'bg-brand-charcoal text-brand-background shadow-brand-elevation'
                  : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-brand-taupe/10'
              }`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      {/* Premium Stats Grid with Better Spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          {
            icon: Zap,
            label: "ACTIVE COORDINATION",
            value: activeTransactions.length,
            subtitle: "transactions in progress",
            color: "text-blue-600",
            bgColor: "bg-blue-50"
          },
          {
            icon: Clock,
            label: "PENDING INTAKE",
            value: pendingTransactions.length,
            subtitle: "awaiting coordination",
            color: "text-amber-600",
            bgColor: "bg-amber-50"
          },
          {
            icon: TrendingUp,
            label: "MONTHLY CLOSINGS",
            value: closedThisMonth.length,
            subtitle: "successful completions",
            color: "text-emerald-600",
            bgColor: "bg-emerald-50"
          },
          {
            icon: DollarSign,
            label: "VOLUME COORDINATED",
            value: `$${(totalVolume / 1000000).toFixed(1)}M`,
            subtitle: "this month",
            color: "text-violet-600",
            bgColor: "bg-violet-50"
          }
        ].map((stat, index) => (
          <div key={index} className="group">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20 shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-500 p-8 h-full">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-7 w-7" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-brand-heading tracking-brand-wide text-brand-charcoal/60 uppercase">
                  {stat.label}
                </p>
                <p className="text-4xl font-bold text-brand-charcoal">
                  {stat.value}
                </p>
                <p className="text-sm font-brand-body text-brand-charcoal/70">
                  {stat.subtitle}
                </p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Main Dashboard Layout with Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Primary Coordination Panel - Takes 3 columns */}
        <div className="xl:col-span-3">
          <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation overflow-hidden">
            <div className="p-10 border-b border-brand-taupe/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase mb-3">
                    Active Coordination
                  </h3>
                  <p className="font-brand-body text-brand-charcoal/70 text-lg">
                    {activeTransactions.length} transactions requiring your expertise
                  </p>
                </div>
                <Button 
                  className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-3 rounded-xl shadow-brand-subtle"
                >
                  VIEW ALL
                </Button>
              </div>
            </div>
            
            <div className="p-10 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="w-10 h-10 border-2 border-brand-taupe border-t-brand-charcoal rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="font-brand-body text-brand-charcoal/60 text-lg">Loading coordination data...</p>
                </div>
              ) : activeTransactions.length > 0 ? (
                <div className="space-y-8">
                  {activeTransactions.slice(0, 4).map((transaction) => (
                    <div key={transaction.id} className="group border border-brand-taupe/30 rounded-2xl p-8 hover:border-brand-taupe hover:shadow-brand-subtle transition-all duration-300">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <Building className="h-6 w-6 text-brand-charcoal/60" />
                            <h4 className="font-brand-heading tracking-wide text-brand-charcoal uppercase text-lg">
                              {transaction.property_address}
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-6 text-base">
                            <div className="flex items-center gap-3">
                              <Users className="h-5 w-5 text-brand-charcoal/50" />
                              <span className="font-brand-body text-brand-charcoal/70">
                                {transaction.clients?.[0]?.full_name || 'Client TBD'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-brand-charcoal/50" />
                              <span className="font-brand-body text-brand-charcoal/70">
                                {transaction.closing_date ? new Date(transaction.closing_date).toLocaleDateString() : 'Date TBD'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-brand-charcoal mb-2">
                            ${transaction.purchase_price?.toLocaleString() || 'TBD'}
                          </div>
                          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-brand-heading tracking-wide bg-blue-100 text-blue-800">
                            COORDINATING
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Building className="h-16 w-16 mx-auto text-brand-taupe mb-6" />
                  <h4 className="font-brand-heading text-brand-charcoal uppercase tracking-wide mb-3 text-xl">
                    No Active Coordination
                  </h4>
                  <p className="font-brand-body text-brand-charcoal/60 text-lg">
                    All transactions are operating smoothly
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Combined Priority Actions + Market Pulse */}
        <div className="xl:col-span-1 space-y-8">
          
          {/* Priority Actions - More Prominent */}
          <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <h3 className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase">
                  Priority Actions
                </h3>
              </div>
              <div className="space-y-6">
                {[
                  { action: "Schedule Inspection", property: "Oak Street", urgency: "high" },
                  { action: "Title Review Due", property: "Pine Avenue", urgency: "medium" },
                  { action: "Document Upload", property: "Maple Drive", urgency: "low" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-brand-background/50 hover:bg-brand-background/80 transition-colors border border-brand-taupe/20 hover:border-brand-taupe/40">
                    <div>
                      <p className="font-brand-body text-brand-charcoal font-medium">{item.action}</p>
                      <p className="text-sm text-brand-charcoal/60">{item.property}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${
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
            <div className="p-8">
              <h3 className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase mb-8">
                Market Pulse
              </h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-brand-charcoal mb-2">
                    18
                  </div>
                  <div className="text-sm font-brand-heading tracking-wide text-brand-charcoal/60 uppercase">
                    Days Avg Close
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="font-brand-body text-brand-charcoal/70">This Month</span>
                  <span className="font-bold text-emerald-600">↗ 2 days faster</span>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Index;
