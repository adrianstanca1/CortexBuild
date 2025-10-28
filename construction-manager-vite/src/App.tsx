import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import ProjectManagerDashboard from './pages/dashboard/project-manager/ProjectManagerDashboard';
import ForemanDashboard from './pages/dashboard/foreman/ForemanDashboard';
import WorkerDashboard from './pages/dashboard/worker/WorkerDashboard';
import ClientDashboard from './pages/dashboard/client/ClientDashboard';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/project-manager"
          element={
            <ProtectedRoute requiredRoles={['project_manager']}>
              <ProjectManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/foreman"
          element={
            <ProtectedRoute requiredRoles={['foreman']}>
              <ForemanDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/worker"
          element={
            <ProtectedRoute requiredRoles={['worker']}>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute requiredRoles={['client']}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
