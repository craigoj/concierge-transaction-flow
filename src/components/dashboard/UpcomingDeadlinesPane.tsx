import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const UpcomingDeadlinesPane = () => {
  // Fetch transactions with upcoming deadlines
  const { data: upcomingDeadlines, isLoading } = useQuery({
    queryKey: ['upcoming-deadlines'],
    queryFn: async () => {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients!clients_transaction_id_fkey(full_name),
          tasks!tasks_transaction_id_fkey(title, due_date, priority, is_completed)
        `)
        .gte('closing_date', today.toISOString().split('T')[0])
        .lte('closing_date', nextWeek.toISOString().split('T')[0])
        .order('closing_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `${diffDays} days`;
  };

  const getDateColor = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "text-red-600";
    if (diffDays <= 2) return "text-orange-600";
    return "text-green-600";
  };

  // Sample milestone dates that would typically be tracked
  const getMilestones = (transaction: any) => {
    const milestones = [];
    
    if (transaction.closing_date) {
      const closingDate = new Date(transaction.closing_date);
      
      // Add sample milestones based on closing date
      const earnestMoneyDue = new Date(closingDate);
      earnestMoneyDue.setDate(closingDate.getDate() - 14);
      
      const inspectionPeriod = new Date(closingDate);
      inspectionPeriod.setDate(closingDate.getDate() - 10);
      
      const appraisalDue = new Date(closingDate);
      appraisalDue.setDate(closingDate.getDate() - 7);
      
      milestones.push(
        { type: "Earnest Money Due", date: earnestMoneyDue.toISOString().split('T')[0], priority: "high" },
        { type: "Inspection Period", date: inspectionPeriod.toISOString().split('T')[0], priority: "medium" },
        { type: "Appraisal Due", date: appraisalDue.toISOString().split('T')[0], priority: "medium" },
        { type: "Closing Date", date: transaction.closing_date, priority: "high" }
      );
    }
    
    return milestones.filter(milestone => {
      const milestoneDate = new Date(milestone.date);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return milestoneDate >= today && milestoneDate <= nextWeek;
    });
  };

  return (
    <Card className="bg-white border-border/50 shadow-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Transaction Dates
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Next 7 days
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 h-full overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading deadlines...</div>
        ) : (
          <div className="space-y-4">
            {/* Yesterday */}
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                YESTERDAY | FRI
              </h4>
              <div className="text-xs text-muted-foreground mb-3">
                Sample overdue items would appear here
              </div>
            </div>

            {/* Today */}
            <div>
              <h4 className="text-sm font-semibold text-orange-600 mb-2">
                TODAY | SAT
              </h4>
              {upcomingDeadlines?.map((transaction) => {
                const todayMilestones = getMilestones(transaction).filter(milestone => {
                  const milestoneDate = new Date(milestone.date).toDateString();
                  const today = new Date().toDateString();
                  return milestoneDate === today;
                });
                
                return todayMilestones.map((milestone, idx) => (
                  <div key={`${transaction.id}-${idx}`} className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-sm font-medium text-foreground mb-1">
                      {transaction.property_address}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        ✓ {milestone.type}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {milestone.priority}
                      </Badge>
                    </div>
                  </div>
                ));
              })}
            </div>

            {/* Tomorrow */}
            <div>
              <h4 className="text-sm font-semibold text-blue-600 mb-2">
                TOMORROW | SUN
              </h4>
              {upcomingDeadlines?.map((transaction) => {
                const tomorrowMilestones = getMilestones(transaction).filter(milestone => {
                  const milestoneDate = new Date(milestone.date);
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  return milestoneDate.toDateString() === tomorrow.toDateString();
                });
                
                return tomorrowMilestones.map((milestone, idx) => (
                  <div key={`${transaction.id}-${idx}`} className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-foreground mb-1">
                      {transaction.property_address}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        □ {milestone.type}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {milestone.priority}
                      </Badge>
                    </div>
                  </div>
                ));
              })}
            </div>

            {/* Rest of the week */}
            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((transaction) => {
                const futureMilestones = getMilestones(transaction).filter(milestone => {
                  const milestoneDate = new Date(milestone.date);
                  const today = new Date();
                  const tomorrow = new Date();
                  tomorrow.setDate(today.getDate() + 1);
                  return milestoneDate > tomorrow;
                });
                
                return futureMilestones.map((milestone, idx) => (
                  <div key={`${transaction.id}-future-${idx}`} className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-sm font-medium text-foreground mb-1">
                      {transaction.property_address}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        □ {milestone.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${getDateColor(milestone.date)}`}>
                          {formatDate(milestone.date)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {milestone.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ));
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No upcoming deadlines this week
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlinesPane;
