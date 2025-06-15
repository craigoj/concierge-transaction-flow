
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import AgentDashboardMetrics from "@/components/agent/AgentDashboardMetrics";
import LuxuryTransactionCard from "@/components/agent/LuxuryTransactionCard";
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

    // Calculate stats from the secure transaction data
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

    // Count tasks that require agent action
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
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-brand-heading font-light text-brand-charcoal tracking-brand-wide mb-2">
          Welcome back{agentName ? `, ${agentName}` : ""}
        </h1>
        <p className="text-brand-charcoal/60 font-brand-serif text-lg">
          Your secure transaction coordination portal
        </p>
      </div>

      {/* At a Glance Metrics */}
      <AgentDashboardMetrics 
        activeTransactions={stats.activeTransactions}
        closingThisWeek={stats.closingThisWeek}
        actionRequired={stats.actionRequired}
        isLoading={isLoading}
      />

      {/* Main Content */}
      {!isLoading && activeTransactions.length === 0 ? (
        <WelcomeCard onNewTransaction={handleNewTransaction} />
      ) : (
        <div className="space-y-8">
          <h2 className="text-2xl font-brand-heading font-semibold text-brand-charcoal tracking-wide">
            Your Active Transactions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTransactions.map((transaction) => (
              <LuxuryTransactionCard
                key={transaction.id}
                transaction={transaction}
                onClick={() => handleTransactionClick(transaction.id)}
              />
            ))}
          </div>
        </div>
      )}
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
