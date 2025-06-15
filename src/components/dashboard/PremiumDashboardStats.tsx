
import { Card } from "@/components/ui/card";
import { Building2, Calendar, Clock, DollarSign, TrendingUp, Users, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PremiumDashboardStats = () => {
  const { data: transactions } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const stats = [
    {
      title: "COORDINATION EXCELLENCE",
      value: transactions?.filter(t => t.status === 'active').length || 0,
      subtitle: "active transactions",
      icon: Zap,
      color: "text-blue-600",
      gradient: "from-blue-50 to-blue-100"
    },
    {
      title: "PORTFOLIO VELOCITY",
      value: "24",
      subtitle: "avg days to close",
      icon: Clock,
      color: "text-emerald-600",
      gradient: "from-emerald-50 to-emerald-100"
    },
    {
      title: "MONTHLY VOLUME",
      value: "$2.4M",
      subtitle: "coordinated value",
      icon: DollarSign,
      color: "text-violet-600",
      gradient: "from-violet-50 to-violet-100"
    },
    {
      title: "CLIENT SATISFACTION",
      value: "98%",
      subtitle: "coordination rating",
      icon: TrendingUp,
      color: "text-amber-600",
      gradient: "from-amber-50 to-amber-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="group relative overflow-hidden">
          <Card className="bg-white/80 backdrop-blur-sm border-brand-taupe/20 shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-500 p-6 h-full relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              </div>
              
              <div className="space-y-3">
                <p className="text-xs font-brand-heading tracking-brand-wide text-brand-charcoal/60 uppercase">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-brand-charcoal group-hover:text-brand-charcoal transition-colors">
                  {stat.value}
                </p>
                <p className="text-sm font-brand-body text-brand-charcoal/70">
                  {stat.subtitle}
                </p>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-brand-taupe/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default PremiumDashboardStats;
