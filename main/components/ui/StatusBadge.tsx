

import React from 'react';
// FIX: Corrected import path to be relative.
import { DocumentStatus, IncidentSeverity, IncidentStatus, EquipmentStatus, TimesheetStatus, InvoiceStatus, QuoteStatus, UserStatus, Project } from '../../types';

export const DocumentStatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
    const statusMap = {
        [DocumentStatus.APPROVED]: { text: 'Approved', color: 'bg-green-100 text-green-800' },
        [DocumentStatus.UPLOADING]: { text: 'Uploading...', color: 'bg-sky-100 text-sky-800 animate-pulse' },
        [DocumentStatus.SCANNING]: { text: 'Scanning...', color: 'bg-yellow-100 text-yellow-800 animate-pulse' },
        [DocumentStatus.QUARANTINED]: { text: 'Quarantined', color: 'bg-red-100 text-red-800' },
    };
    const { text, color } = statusMap[status] || { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };

    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>{text}</span>;
};

export const IncidentSeverityBadge: React.FC<{ severity: IncidentSeverity }> = ({ severity }) => {
    const severityMap = {
        [IncidentSeverity.CRITICAL]: 'bg-red-600 text-white',
        [IncidentSeverity.HIGH]: 'bg-red-200 text-red-800',
        [IncidentSeverity.MEDIUM]: 'bg-yellow-200 text-yellow-800',
        [IncidentSeverity.LOW]: 'bg-sky-200 text-sky-800',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${severityMap[severity]}`}>{severity}</span>;
};

export const IncidentStatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
    const statusMap = {
        [IncidentStatus.REPORTED]: 'bg-sky-100 text-sky-800',
        [IncidentStatus.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800',
        [IncidentStatus.RESOLVED]: 'bg-green-100 text-green-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[status]}`}>{status}</span>;
};

export const EquipmentStatusBadge: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
    const statusMap = {
        [EquipmentStatus.AVAILABLE]: 'bg-green-100 text-green-800',
        [EquipmentStatus.IN_USE]: 'bg-sky-100 text-sky-800',
        [EquipmentStatus.MAINTENANCE]: 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[status]}`}>{status}</span>;
};

export const TimesheetStatusBadge: React.FC<{ status: TimesheetStatus }> = ({ status }) => {
    const statusMap = {
        [TimesheetStatus.APPROVED]: { text: 'Approved', color: 'bg-green-100 text-green-800' },
        [TimesheetStatus.PENDING]: { text: 'Pending', color: 'bg-sky-100 text-sky-800' },
        [TimesheetStatus.REJECTED]: { text: 'Rejected', color: 'bg-red-100 text-red-800' },
        [TimesheetStatus.FLAGGED]: { text: 'Flagged', color: 'bg-yellow-100 text-yellow-800' },
    };
     const { text, color } = statusMap[status] || { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };

    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>{text}</span>;
}

export const InvoiceStatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const statusMap = {
        [InvoiceStatus.PAID]: 'bg-green-100 text-green-800',
        [InvoiceStatus.SENT]: 'bg-sky-100 text-sky-800',
        [InvoiceStatus.OVERDUE]: 'bg-red-100 text-red-800',
        [InvoiceStatus.DRAFT]: 'bg-slate-200 text-slate-800',
        [InvoiceStatus.VOID]: 'bg-gray-200 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[status]}`}>{status}</span>;
}

export const QuoteStatusBadge: React.FC<{ status: QuoteStatus }> = ({ status }) => {
    const statusMap = {
        [QuoteStatus.ACCEPTED]: 'bg-green-100 text-green-800',
        [QuoteStatus.SENT]: 'bg-sky-100 text-sky-800',
        [QuoteStatus.REJECTED]: 'bg-red-100 text-red-800',
        [QuoteStatus.DRAFT]: 'bg-slate-200 text-slate-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[status]}`}>{status}</span>;
}

export const UserStatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
    const statusConfig = {
        [UserStatus.ON_SITE]: { text: 'On Site', color: 'bg-green-100 text-green-800', icon: <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> },
        [UserStatus.ON_BREAK]: { text: 'On Break', color: 'bg-yellow-100 text-yellow-800', icon: <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" /> },
        [UserStatus.OFF_SITE]: { text: 'Off Site', color: 'bg-slate-200 text-slate-700', icon: <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" /> },
    };
    const { text, color, icon } = statusConfig[status] || statusConfig[UserStatus.OFF_SITE];
    return <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${color}`}>{icon} {text}</span>;
}

export const ProjectStatusBadge: React.FC<{ status: Project['status'] }> = ({ status }) => {
    const statusStyles: Record<Project['status'], string> = {
        'Active': 'bg-green-100 text-green-800',
        'On Hold': 'bg-yellow-100 text-yellow-800',
        'Completed': 'bg-slate-200 text-slate-800'
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyles[status]}`}>{status}</span>;
};
