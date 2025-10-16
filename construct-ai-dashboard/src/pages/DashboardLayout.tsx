
import React from 'react';

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout: React.FC = () => {
  return (
    <div className="d-flex">
        <Sidebar />
        <div style={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
            <Header />
            <main className="p-4">
                <Outlet />
            </main>
        </div>
    </div>
  );
};

export default DashboardLayout;
