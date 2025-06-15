
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, AlertCircle, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const DailyFocusPane = () => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Fetch tasks due today or overdue
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['daily-tasks'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          transactions(property_address, clients!clients_transaction_id_fkey(full_name))
        `)
        .lte('due_date', today)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Toggle task completion
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-tasks'] });
    }
  });

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.transactions?.property_address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompletion = showCompleted || !task.is_completed;
    return matchesSearch && matchesCompletion;
  });

  const overdueTasks = filteredTasks?.filter(task => {
    const today = new Date().toDateString();
    const taskDate = new Date(task.due_date).toDateString();
    return taskDate < today && !task.is_completed;
  });

  const todayTasks = filteredTasks?.filter(task => {
    const today = new Date().toDateString();
    const taskDate = new Date(task.due_date).toDateString();
    return taskDate === today;
  });

  return (
    <Card className="bg-white border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Daily Focus
            {overdueTasks && overdueTasks.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {overdueTasks.length} Overdue
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              checked={showCompleted}
              onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
            />
            Show Completed
          </label>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
        ) : (
          <div className="space-y-4">
            {/* Overdue Tasks */}
            {overdueTasks && overdueTasks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Overdue ({overdueTasks.length})
                </h4>
                <div className="space-y-2 mb-6">
                  {overdueTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Checkbox 
                        checked={task.is_completed}
                        onCheckedChange={(checked) => 
                          toggleTaskMutation.mutate({ taskId: task.id, completed: checked as boolean })
                        }
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {task.transactions?.property_address} • Due: {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Tasks */}
            {todayTasks && todayTasks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3">
                  Today ({todayTasks.length})
                </h4>
                <div className="space-y-2">
                  {todayTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Checkbox 
                        checked={task.is_completed}
                        onCheckedChange={(checked) => 
                          toggleTaskMutation.mutate({ taskId: task.id, completed: checked as boolean })
                        }
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {task.transactions?.property_address}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!filteredTasks || filteredTasks.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found for today. Great job staying on top of things! 🎉
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyFocusPane;
