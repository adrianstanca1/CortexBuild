/**
 * Dashboard Page
 * Main dashboard page
 */

import React from 'react';
import { EnhancedDashboard } from '../components/dashboard/EnhancedDashboard';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <EnhancedDashboard />
    </DashboardLayout>
  );
};

export default DashboardPage;
