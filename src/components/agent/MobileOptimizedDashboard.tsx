
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home,
  Calendar,
  CheckSquare,
  MessageCircle,
  Bell,
  Menu,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileOptimizedDashboardProps {
  transactions?: any[];
  tasks?: any[];
  notifications?: any[];
}

const MobileOptimizedDashboard = ({ 
  transactions = [], 
  tasks = [], 
  notifications = [] 
}: MobileOptimizedDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  const activeTransactions = transactions.filter(t => t.status === 'active');
  const urgentTasks = tasks.filter(t => !t.is_completed && t.priority === 'high');
  const todayTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    const today = new Date().toDateString();
    return new Date(t.due_date).toDateString() === today;
  });

  const quickActions = [
    { icon: Phone, label: 'Call Client', action: () => {}, color: 'bg-green-500' },
    { icon: Mail, label: 'Send Email', action: () => {}, color: 'bg-blue-500' },
    { icon: Calendar, label: 'Schedule', action: () => {}, color: 'bg-purple-500' },
    { icon: CheckSquare, label: 'Add Task', action: () => {}, color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-brand-background to-brand-taupe/20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-brand-taupe/20">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-brand-heading font-bold text-brand-charcoal">
              Dashboard
            </h1>
            <p className="text-sm text-brand-charcoal/60">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          {/* Quick Actions Menu */}
          <Sheet open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="bg-brand-charcoal text-white">
                <Menu className="h-4 w-4 mr-1" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Quick Actions</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.action}
                    className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center gap-2 transition-all`}
                  >
                    <action.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <CardContent className="p-4 text-center">
              <Home className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-brand-charcoal">
                {activeTransactions.length}
              </div>
              <div className="text-xs text-brand-charcoal/60">Active</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <CardContent className="p-4 text-center">
              <CheckSquare className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-brand-charcoal">
                {todayTasks.length}
              </div>
              <div className="text-xs text-brand-charcoal/60">Due Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Alerts */}
        {urgentTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    {urgentTasks.length} Urgent Task{urgentTasks.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-1">
                  {urgentTasks.slice(0, 2).map((task) => (
                    <div key={task.id} className="text-xs text-red-700">
                      • {task.title}
                    </div>
                  ))}
                  {urgentTasks.length > 2 && (
                    <div className="text-xs text-red-600">
                      +{urgentTasks.length - 2} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80">
            <TabsTrigger value="overview" className="text-xs">
              <Home className="h-4 w-4 mr-1" />
              Home
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs">
              <CheckSquare className="h-4 w-4 mr-1" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs">
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-xs">
              <MessageCircle className="h-4 w-4 mr-1" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Recent Transactions */}
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeTransactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="border-l-4 border-blue-500 pl-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-brand-charcoal">
                          {transaction.property_address}
                        </p>
                        <p className="text-xs text-brand-charcoal/60">
                          {transaction.city}, {transaction.state}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="text-xs">
                            {transaction.status}
                          </Badge>
                          {transaction.service_tier && (
                            <Badge variant="outline" className="text-xs">
                              {transaction.service_tier.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {transaction.purchase_price && (
                          <p className="text-sm font-semibold text-green-600">
                            ${transaction.purchase_price.toLocaleString()}
                          </p>
                        )}
                        {transaction.closing_date && (
                          <p className="text-xs text-brand-charcoal/60">
                            Closes: {new Date(transaction.closing_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeTransactions.length === 0 && (
                  <div className="text-center py-4">
                    <Home className="h-8 w-8 text-brand-taupe/40 mx-auto mb-2" />
                    <p className="text-sm text-brand-charcoal/60">No active transactions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 mt-4">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Today's Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-2 border border-brand-taupe/20 rounded">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      task.priority === 'high' ? 'bg-red-500' : 
                      task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brand-charcoal">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-brand-charcoal/60 mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-brand-charcoal/60">
                            <Clock className="h-3 w-3" />
                            Due today
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {todayTasks.length === 0 && (
                  <div className="text-center py-4">
                    <CheckSquare className="h-8 w-8 text-brand-taupe/40 mx-auto mb-2" />
                    <p className="text-sm text-brand-charcoal/60">No tasks due today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-brand-taupe/40 mx-auto mb-3" />
                  <p className="text-sm text-brand-charcoal/60">Calendar integration coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4 mt-4">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <MessageCircle className="h-12 w-12 text-brand-taupe/40 mx-auto mb-3" />
                  <p className="text-sm text-brand-charcoal/60">Message center coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg" 
          className="rounded-full w-14 h-14 bg-brand-charcoal text-white shadow-lg"
          onClick={() => setQuickActionsOpen(true)}
        >
          <TrendingUp className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default MobileOptimizedDashboard;
