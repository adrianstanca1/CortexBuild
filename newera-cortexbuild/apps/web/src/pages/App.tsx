import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { AuthPage } from './AuthPage';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from './DashboardPage';
import { ProjectsPage } from './ProjectsPage';
import { RfisPage } from './RfisPage';
import { AutomationStudioPage } from './AutomationStudioPage';
import { FinancePage } from './FinancePage';

const Loader = () => (
  <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
    <p>Loading workspace…</p>
  </div>
);

const ProtectedApp = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/rfis" element={<RfisPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/automation" element={<AutomationStudioPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <AuthPage />;

  return <ProtectedApp />;
};

export default App;
