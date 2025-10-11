import React from 'react';
// Fix: Corrected import paths to use proper relative path and file extension.
import { Project } from '../../types';
// Fix: Corrected import paths to use proper relative path and file extension.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
// Fix: Added .tsx extension to import
import StatCard from './StatCard';

interface GlobalStatsWidgetProps {
    projects: Project[];
}

const GlobalStatsWidget: React.FC<GlobalStatsWidgetProps> = ({ projects }) => {
    const stats = projects.reduce((acc, project) => ({
        openRFIs: acc.openRFIs + project.snapshot.openRFIs,
        overdueTasks: acc.overdueTasks + project.snapshot.overdueTasks,
        pendingTMTickets: acc.pendingTMTickets + project.snapshot.pendingTMTickets,
    }), { openRFIs: 0, overdueTasks: 0, pendingTMTickets: 0 });

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Total Open RFIs" value={stats.openRFIs} type="rfi" />
            <StatCard label="Total Overdue" value={stats.overdueTasks} type="overdue" />
            <StatCard label="Total Pending T&M" value={stats.pendingTMTickets} type="tm-ticket" />
            <StatCard label="Company Risk" value="Low" type="ai-risk" />
        </div>
    );
};

export default GlobalStatsWidget;