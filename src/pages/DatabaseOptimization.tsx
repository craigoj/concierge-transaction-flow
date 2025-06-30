
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DatabaseOptimizationPanel from '@/components/settings/DatabaseOptimizationPanel';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const DatabaseOptimization = () => {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 min-h-screen bg-gradient-to-br from-brand-cream via-brand-background to-brand-taupe/20">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-charcoal mb-2">Database Optimization</h1>
          <p className="text-brand-charcoal/60">Monitor performance and manage database optimizations</p>
        </div>

        <DatabaseOptimizationPanel />
      </div>
    </AppLayout>
  );
};

export default DatabaseOptimization;
