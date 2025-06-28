
import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-brand-cream">
      <main className="container mx-auto">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
