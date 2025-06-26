
import { MockDataGenerator } from "@/components/MockDataGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Users, FileText, MessageCircle, Bell, Settings } from "lucide-react";

const DemoSetup = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-charcoal mb-4">
            Demo Data Setup
          </h1>
          <p className="text-brand-charcoal/70 text-lg">
            Generate comprehensive mock data to showcase your real estate transaction coordination platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                15-20 realistic transactions across White Glove, Elite, and Core service tiers with proper pricing and locations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detailed client profiles with contact information, preferences, and realistic backgrounds for each transaction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Realistic document records including contracts, inspections, financial docs, and marketing materials.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-orange-500" />
                Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive communication logs with emails, calls, and messages between agents and clients.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Realistic notifications and alerts for tasks, deadlines, and important transaction milestones.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automated workflow templates and tasks tailored to each service tier and transaction type.
              </p>
            </CardContent>
          </Card>
        </div>

        <MockDataGenerator />

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">
              What Makes This Demo Data Special?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Realistic Scenarios:</h4>
                <ul className="space-y-1">
                  <li>• Luxury Beverly Hills estates</li>
                  <li>• First-time buyer journeys</li>
                  <li>• Corporate relocations</li>
                  <li>• Investment properties</li>
                  <li>• Dual agency transactions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Professional Details:</h4>
                <ul className="space-y-1">
                  <li>• Market-accurate pricing</li>
                  <li>• Realistic timelines</li>
                  <li>• Service tier differentiation</li>
                  <li>• Geographic diversity</li>
                  <li>• Authentic client personas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoSetup;
