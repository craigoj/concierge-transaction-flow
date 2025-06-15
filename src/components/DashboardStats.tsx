
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Calendar, DollarSign } from "lucide-react";

const DashboardStats = () => {
  const stats = [
    {
      title: "Active Transactions",
      value: "24",
      change: "+12%",
      changeType: "positive" as const,
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "Total Clients",
      value: "89",
      change: "+8%",
      changeType: "positive" as const,
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Monthly Revenue",
      value: "$12,450",
      change: "+23%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "text-primary"
    },
    {
      title: "Completion Rate",
      value: "96%",
      change: "+2%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "text-emerald-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
