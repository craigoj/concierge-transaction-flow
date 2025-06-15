
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Calendar, Plus, Home, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AgentStats {
  activeTransactions: number;
  closingThisWeek: number;
  tasksRequiringAttention: number;
}

const AgentDashboard = () => {
  const [stats, setStats] = useState<AgentStats>({
    activeTransactions: 0,
    closingThisWeek: 0,
    tasksRequiringAttention: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [agentName, setAgentName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get agent profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          setAgentName(`${profile.first_name || ""} ${profile.last_name || ""}`.trim());
        }

        // Get transactions for this agent
        const { data: transactions, error: transactionsError } = await supabase
          .from("transactions")
          .select("id, status, closing_date")
          .eq("agent_id", user.id);

        if (transactionsError) {
          throw transactionsError;
        }

        // Calculate stats
        const activeTransactions = transactions?.filter(t => 
          t.status === "active" || t.status === "intake"
        ).length || 0;

        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const closingThisWeek = transactions?.filter(t => 
          t.closing_date && 
          new Date(t.closing_date) <= weekFromNow &&
          new Date(t.closing_date) >= now
        ).length || 0;

        setStats({
          activeTransactions,
          closingThisWeek,
          tasksRequiringAttention: 0, // Will implement when tasks are agent-specific
        });
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const handleNewTransaction = () => {
    navigate("/transactions/new");
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide">
              Welcome back{agentName ? `, ${agentName}` : ""}
            </h1>
            <p className="text-brand-charcoal/60 font-brand-body mt-1">
              Your transaction coordination portal
            </p>
          </div>
          <Button
            onClick={handleNewTransaction}
            className="bg-brand-charcoal hover:bg-brand-charcoal/90 text-white rounded-xl font-brand-heading font-medium tracking-wide shadow-brand-subtle"
          >
            <Plus className="h-4 w-4 mr-2" />
            Submit New Transaction
          </Button>
        </div>
      </div>

      {/* At a Glance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-brand-taupe/20 shadow-brand-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-brand-body font-medium text-brand-charcoal/60">
              Active Transactions
            </CardTitle>
            <FileText className="h-5 w-5 text-brand-charcoal" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-brand-heading font-bold text-brand-charcoal">
              {isLoading ? "-" : stats.activeTransactions}
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-taupe/20 shadow-brand-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-brand-body font-medium text-brand-charcoal/60">
              Closing This Week
            </CardTitle>
            <Calendar className="h-5 w-5 text-brand-charcoal" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-brand-heading font-bold text-brand-charcoal">
              {isLoading ? "-" : stats.closingThisWeek}
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-taupe/20 shadow-brand-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-brand-body font-medium text-brand-charcoal/60">
              Tasks Requiring Attention
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-brand-charcoal" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-brand-heading font-bold text-brand-charcoal">
              {isLoading ? "-" : stats.tasksRequiringAttention}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Card for New Agents */}
      {!isLoading && stats.activeTransactions === 0 && (
        <Card className="border-brand-taupe/20 shadow-brand-elevation bg-gradient-to-br from-brand-cream to-white">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-brand-charcoal rounded-xl flex items-center justify-center mx-auto mb-6">
              <Home className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-brand-heading font-semibold text-brand-charcoal mb-4 tracking-brand-wide">
              Your portal is ready
            </h2>
            <p className="text-brand-charcoal/60 font-brand-body text-lg mb-6 max-w-md mx-auto">
              When you're ready to start your next transaction, we're here to make it seamless. Let's begin.
            </p>
            <Button
              onClick={handleNewTransaction}
              size="lg"
              className="bg-brand-charcoal hover:bg-brand-charcoal/90 text-white rounded-xl font-brand-heading font-medium tracking-wide shadow-brand-subtle px-8 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              Submit a New Transaction
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Transactions (will be implemented later) */}
      {!isLoading && stats.activeTransactions > 0 && (
        <Card className="border-brand-taupe/20 shadow-brand-subtle">
          <CardHeader>
            <CardTitle className="font-brand-heading text-brand-charcoal">
              Active Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-brand-taupe mx-auto mb-4" />
              <p className="text-brand-charcoal/60 font-brand-body">
                Transaction cards will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentDashboard;
