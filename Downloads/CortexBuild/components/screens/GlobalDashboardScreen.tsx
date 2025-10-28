import React from 'react';

// This component is deprecated and its logic has been moved to UnifiedDashboardScreen.
// This placeholder is to prevent compilation errors.
const GlobalDashboardScreen: React.FC = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Loading Dashboard...</h1>
            <p>This component is deprecated. The dashboard logic is now handled by the UnifiedDashboardScreen.</p>
        </div>
    );
};

export default GlobalDashboardScreen;
