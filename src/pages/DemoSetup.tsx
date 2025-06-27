
import { HamptonRoadsMockDataGenerator } from "@/components/HamptonRoadsMockDataGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Anchor, Users, FileText, MessageCircle, Bell, Settings, MapPin, Building } from "lucide-react";

const DemoSetup = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-brand-charcoal mb-4 flex items-center justify-center gap-3">
            <Anchor className="h-10 w-10 text-blue-600" />
            Hampton Roads Demo Data Setup
          </h1>
          <p className="text-brand-charcoal/70 text-xl max-w-3xl mx-auto">
            Generate comprehensive mock data showcasing your premium real estate transaction coordination platform 
            with authentic Hampton Roads market expertise, military relocations, and waterfront property specialization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Premium Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">
                White Glove waterfront estates ($1.8M-$3.5M), Elite properties ($600K-$1.5M), 
                and Core military-friendly homes across Norfolk, Virginia Beach, and Hampton Roads.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Hampton Roads Professionals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800">
                Local coordinators and agents with military relocation expertise, waterfront specializations, 
                and deep Hampton Roads market knowledge at premier brokerages.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                Military & Local Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-800">
                Navy, Army, Air Force families with PCS orders, local professionals from EVMS/Sentara, 
                shipyard workers, and retirees choosing Hampton Roads lifestyle.
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-orange-600" />
                Local Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800">
                Authentic communication threads covering flood zones, hurricane prep, military timelines, 
                base proximity, and waterfront property considerations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Specialized Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-800">
                VA loan documents, flood zone certificates, hurricane preparedness forms, 
                marina access agreements, and military PCS addendums.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Smart Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-800">
                Military PCS timelines, waterfront property checklists, hurricane season preparations, 
                and service-tier specific automation rules.
              </p>
            </CardContent>
          </Card>
        </div>

        <HamptonRoadsMockDataGenerator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                <Anchor className="h-5 w-5" />
                Hampton Roads Market Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-1">Waterfront Specialization:</h4>
                  <p>Marina access, dock rights, bulkhead maintenance, flood zones (AE, VE, X), hurricane preparedness</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Military Expertise:</h4>
                  <p>PCS timelines, VA loans, base proximity, deployments, military spouse employment, school districts</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Local Knowledge:</h4>
                  <p>Ghent Historic District, Larchmont, Great Neck, Shore Drive, Oceana noise zones, tunnel traffic</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">
                Service Tier Differentiation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-green-800">
                <div>
                  <h4 className="font-medium mb-1">White Glove ($1.8M+):</h4>
                  <p>Luxury waterfront estates, professional marine photography, premium staging, concierge services</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Elite ($600K-$1.5M):</h4>
                  <p>Enhanced marketing, priority scheduling, detailed market analysis, premium communication</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Core ($250K-$550K):</h4>
                  <p>Military-focused services, efficient timelines, VA loan expertise, base proximity analysis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">
              🏛️ Why Hampton Roads Real Estate is Unique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700">
              <div>
                <h4 className="font-medium mb-2 text-slate-900">Military Impact:</h4>
                <ul className="space-y-1">
                  <li>• Largest naval base in the world</li>
                  <li>• 40% of buyers use VA loans</li>
                  <li>• PCS cycles drive seasonal demand</li>
                  <li>• Deployment schedules affect timelines</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-slate-900">Coastal Considerations:</h4>
                <ul className="space-y-1">
                  <li>• Hurricane season June-November</li>
                  <li>• Flood zones require special insurance</li>
                  <li>• Waterfront premiums 15-30%</li>
                  <li>• Salt air affects maintenance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-slate-900">Local Market Dynamics:</h4>
                <ul className="space-y-1">
                  <li>• Bridge/tunnel traffic patterns</li>
                  <li>• Historic district regulations</li>
                  <li>• Shipyard employment stability</li>
                  <li>• Military medical facility access</li>
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
