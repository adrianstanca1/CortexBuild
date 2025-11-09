import React from 'react';
import { User } from '../../../types';
import { DeveloperDashboardScreen } from '../developer/DeveloperDashboardScreen';

interface DeveloperDashboardProps {
  currentUser: User;
  navigateTo: (screen: any, params?: any) => void;
}

/**
 * Developer Dashboard - Entry point for developer role
 * Delegates to the comprehensive DeveloperDashboardScreen
 */
const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ currentUser, navigateTo }) => {
  return <DeveloperDashboardScreen currentUser={currentUser} navigateTo={navigateTo} />;
};

export default DeveloperDashboard;
