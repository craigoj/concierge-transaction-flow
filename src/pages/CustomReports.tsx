
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CustomReportBuilder from '@/components/reporting/CustomReportBuilder';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const CustomReports = () => {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 min-h-screen bg-gradient-to-br from-brand-cream via-brand-background to-brand-taupe/20">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        
        <CustomReportBuilder />
      </div>
    </AppLayout>
  );
};

export default CustomReports;
