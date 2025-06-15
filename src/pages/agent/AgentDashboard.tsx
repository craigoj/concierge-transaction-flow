
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import PremiumDashboardMetrics from "@/components/agent/PremiumDashboardMetrics";
import PremiumTransactionCard from "@/components/agent/PremiumTransactionCard";
import WelcomeCard from "@/components/agent/WelcomeCard";
import { SecureAgentDataProvider, useAgentData } from "@/components/agent/SecureAgentDataProvider";

type Transaction = Tables<'transactions'> & {
  clients: Tables<'clients'>[];
  tasks: Tables<'tasks'>[];
};

interface AgentStats {
  activeTransactions: number;
  closingThisWeek: number;
  actionRequired: number;
}

const AgentDashboardContent = () => {
  const [stats, setStats] = useState<AgentStats>({
    activeTransactions: 0,
    closingThisWeek: 0,
    actionRequired: 0,
  });
  const [agentName, setAgentName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { transactions, isLoading } = useAgentData();

  useEffect(() => {
    const fetchAgentProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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
      } catch (error: any) {
        console.error("Error fetching agent profile:", error);
      }
    };

    fetchAgentProfile();
  }, []);

  useEffect(() => {
    if (transactions.length === 0) {
      setStats({
        activeTransactions: 0,
        closingThisWeek: 0,
        actionRequired: 0,
      });
      return;
    }

    const activeTransactions = transactions.filter(t => 
      t.status === "active" || t.status === "intake"
    ).length;

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const closingThisWeek = transactions.filter(t => 
      t.closing_date && 
      new Date(t.closing_date) <= weekFromNow &&
      new Date(t.closing_date) >= now
    ).length;

    const actionRequired = transactions.reduce((count, transaction) => {
      const actionTasks = transaction.tasks?.filter(task => 
        task.requires_agent_action && !task.is_completed
      ).length || 0;
      return count + actionTasks;
    }, 0);

    setStats({
      activeTransactions,
      closingThisWeek,
      actionRequired,
    });
  }, [transactions]);

  const handleNewTransaction = () => {
    navigate("/transactions/new");
  };

  const handleTransactionClick = (transactionId: string) => {
    navigate(`/agent/transaction/${transactionId}`);
  };

  const activeTransactions = transactions.filter(t => 
    t.status === "active" || t.status === "intake"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream/30 to-brand-background">
      <div className="container mx-auto px-6 md:px-8 py-12 max-w-7xl">
        {/* Welcome Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-brand-heading font-light text-brand-charcoal tracking-brand-wider mb-4">
            Welcome back{agentName ? `, ${agentName}` : ""}
          </h1>
          <p className="text-brand-charcoal/70 font-brand-body text-lg md:text-xl leading-relaxed">
            Your secure transaction coordination portal
          </p>
        </motion.div>

        {/* Premium Metrics */}
        <PremiumDashboardMetrics 
          activeTransactions={stats.activeTransactions}
          closingThisWeek={stats.closingThisWeek}
          actionRequired={stats.actionRequired}
          isLoading={isLoading}
        />

        {/* Main Content */}
        {!isLoading && activeTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <WelcomeCard onNewTransaction={handleNewTransaction} />
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-brand-heading font-semibold text-brand-charcoal tracking-wide">
                Your Active Transactions
              </h2>
              <div className="hidden md:flex items-center gap-2 text-brand-taupe">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-brand-heading uppercase tracking-wide">Live Updates</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {activeTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <PremiumTransactionCard
                    transaction={transaction}
                    onClick={() => handleTransactionClick(transaction.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const AgentDashboard = () => {
  return (
    <SecureAgentDataProvider>
      <AgentDashboardContent />
    </SecureAgentDataProvider>
  );
};

export default AgentDashboard;
