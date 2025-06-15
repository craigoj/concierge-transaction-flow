
import AppHeader from "@/components/AppHeader";
import EnhancedDashboardStats from "@/components/dashboard/EnhancedDashboardStats";
import ServiceTierCard from "@/components/ServiceTierCard";
import TransactionCard from "@/components/TransactionCard";
import EnhancedQuickActions from "@/components/dashboard/EnhancedQuickActions";
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines";
import Breadcrumb from "@/components/navigation/Breadcrumb";

const Index = () => {
  const serviceTiers = [
    {
      title: "Buyer Core",
      price: "246",
      description: "Foundational support for buyer transactions",
      features: [
        "Broker Paperwork Prep",
        "Contract Writing",
        "Timeline Management",
        "Email Communication",
        "Utility Transfer Guide"
      ],
      activeCount: 8
    },
    {
      title: "White-Glove Buyer",
      price: "395",
      description: "Priority showing coordination with custom closing gifts",
      features: [
        "Priority Showing Assistant Coordination",
        "Custom Closing Gift",
        "Welcome Home Gift",
        "Post Closing Touchpoints",
        "All Core Services"
      ],
      isPopular: true,
      activeCount: 12
    },
    {
      title: "White-Glove Listing",
      price: "695",
      description: "Full-service listing coordination and management",
      features: [
        "Listing Install Coordination",
        "For Sale Sign Install and Pickup",
        "Priority House Showings",
        "Custom Closing Gift",
        "Post Closing Touchpoints"
      ],
      activeCount: 4
    }
  ];

  const recentTransactions = [
    {
      id: "1",
      property: "123 Oceanview Drive",
      client: "Sarah Johnson",
      agent: "Mike Peterson",
      type: "buyer" as const,
      status: "under-contract" as const,
      tier: "White-Glove Buyer",
      closingDate: "June 25, 2025",
      location: "Virginia Beach, VA"
    },
    {
      id: "2",
      property: "456 Colonial Avenue",
      client: "Robert & Mary Chen",
      agent: "Lisa Rodriguez",
      type: "seller" as const,
      status: "closing" as const,
      tier: "White-Glove Listing",
      closingDate: "June 20, 2025",
      location: "Norfolk, VA"
    },
    {
      id: "3",
      property: "789 Maple Street",
      client: "David Thompson",
      agent: "Jennifer Walsh",
      type: "buyer" as const,
      status: "pending" as const,
      tier: "Buyer Elite",
      closingDate: "July 2, 2025",
      location: "Chesapeake, VA"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb />
        </div>

        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-semibold text-foreground mb-3 tracking-tight">
            Welcome back, Eileen
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Here's what's happening with your transactions today.
          </p>
        </div>

        {/* Enhanced Dashboard Stats */}
        <div className="mb-12">
          <EnhancedDashboardStats />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          {/* Left Column - Transactions and Service Tiers */}
          <div className="xl:col-span-3 space-y-12">
            {/* Service Tiers */}
            <section>
              <h3 className="text-2xl font-semibold text-foreground mb-8 tracking-tight">
                Service Tiers Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {serviceTiers.map((tier, index) => (
                  <ServiceTierCard key={index} {...tier} />
                ))}
              </div>
            </section>

            {/* Recent Transactions */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-semibold text-foreground tracking-tight">
                  Recent Transactions
                </h3>
                <button 
                  className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
                  onClick={() => window.location.href = '/transactions'}
                >
                  View All Transactions
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recentTransactions.map((transaction) => (
                  <TransactionCard key={transaction.id} {...transaction} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Quick Actions and Deadlines */}
          <div className="xl:col-span-1 space-y-8">
            <EnhancedQuickActions />
            <UpcomingDeadlines />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
