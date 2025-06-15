
import AppHeader from "@/components/AppHeader";
import EnhancedDashboardStats from "@/components/dashboard/EnhancedDashboardStats";
import TransactionCard from "@/components/TransactionCard";
import Breadcrumb from "@/components/navigation/Breadcrumb";
import DailyFocusPane from "@/components/dashboard/DailyFocusPane";
import UpcomingDeadlinesPane from "@/components/dashboard/UpcomingDeadlinesPane";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = transaction.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.clients?.[0]?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-6">
          <Breadcrumb />
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-foreground mb-3 tracking-tight">
            Mission Control
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Your transaction coordination dashboard for today.
          </p>
        </div>

        {/* Enhanced Dashboard Stats */}
        <div className="mb-8">
          <EnhancedDashboardStats />
        </div>

        {/* Three-Pane Layout inspired by AFrame */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-400px)]">
          {/* Main Pane - Transactions List (Center) */}
          <div className="col-span-8 bg-white rounded-lg border border-border/50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">
                  Transactions ({filteredTransactions?.length || 0})
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="intake">Intake</option>
                    <option value="under_contract">Under Contract</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto h-full">
              {isLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : filteredTransactions && filteredTransactions.length > 0 ? (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="border border-border/30 rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base mb-1">{transaction.property_address}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Client: {transaction.clients?.[0]?.full_name || 'N/A'}</span>
                            <span>Agent: {transaction.profiles ? `${transaction.profiles.first_name} ${transaction.profiles.last_name}` : 'N/A'}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'under_contract' ? 'bg-blue-100 text-blue-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              transaction.status === 'closed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">${transaction.purchase_price?.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.closing_date ? new Date(transaction.closing_date).toLocaleDateString() : 'No closing date'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No transactions found</div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Upcoming Deadlines */}
          <div className="col-span-4">
            <UpcomingDeadlinesPane />
          </div>
        </div>

        {/* Bottom Pane - Daily Focus Tasks */}
        <div className="mt-6">
          <DailyFocusPane />
        </div>
      </main>
    </div>
  );
};

export default Index;
