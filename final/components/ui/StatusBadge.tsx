// full contents of components/ui/StatusBadge.tsx

import React from 'react';
// FIX: Added EquipmentStatus and DocumentStatus to the import from types.
// FIX: Corrected all status imports to use the new enum types.
import { TimesheetStatus, IncidentStatus, IncidentSeverity, InvoiceStatus, QuoteStatus, TodoStatus, DocumentStatus, EquipmentStatus } from '../../types';
import { Tag } from './Tag';

export const TimesheetStatusBadge: React.FC<{ status: TimesheetStatus }> = ({ status }) => {
  const statusMap = {
    [TimesheetStatus.PENDING]: { label: 'Pending', color: 'yellow', indicator: 'yellow' },
    [TimesheetStatus.APPROVED]: { label: 'Approved', color: 'green', indicator: 'green' },
    [TimesheetStatus.REJECTED]: { label: 'Rejected', color: 'red', indicator: 'red' },
    [TimesheetStatus.DRAFT]: { label: 'Draft', color: 'gray', indicator: 'gray' },
  };
  const { label, color, indicator } = statusMap[status] || { label: 'Unknown', color: 'gray', indicator: 'gray' };
  return <Tag label={label} color={color as any} statusIndicator={indicator as any} />;
export const IncidentStatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  const statusMap = {
    [IncidentStatus.REPORTED]: { label: 'Reported', color: 'blue', indicator: 'blue' },
    [IncidentStatus.UNDER_INVESTIGATION]: { label: 'Investigating', color: 'yellow', indicator: 'yellow' },
    [IncidentStatus.RESOLVED]: { label: 'Resolved', color: 'green', indicator: 'green' },
  };
  const { label, color, indicator } = statusMap[status] || { label: 'Unknown', color: 'gray', indicator: 'gray' };
  return <Tag label={label} color={color as any} statusIndicator={indicator as any} />;
export const IncidentSeverityBadge: React.FC<{ severity: IncidentSeverity }> = ({ severity }) => {
  const severityMap = {
    [IncidentSeverity.CRITICAL]: { label: 'Critical', color: 'red' },
    [IncidentSeverity.HIGH]: { label: 'High', color: 'red' },
    [IncidentSeverity.MEDIUM]: { label: 'Medium', color: 'yellow' },
    [IncidentSeverity.LOW]: { label: 'Low', color: 'blue' },
  };
  const { label, color } = severityMap[severity] || { label: 'Unknown', color: 'gray' };
  return <Tag label={label} color={color as any} />;
export const InvoiceStatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const statusMap = {
        [InvoiceStatus.PAID]: { label: 'Paid', color: 'green' },
        [InvoiceStatus.SENT]: { label: 'Sent', color: 'blue' },
        [InvoiceStatus.DRAFT]: { label: 'Draft', color: 'gray' },
        [InvoiceStatus.OVERDUE]: { label: 'Overdue', color: 'red' },
        [InvoiceStatus.CANCELLED]: { label: 'Cancelled', color: 'gray' },
    };
    const style = statusMap[status] || { label: status, color: 'gray' };
    return <Tag label={style.label} color={style.color as any} />;
export const QuoteStatusBadge: React.FC<{ status: QuoteStatus }> = ({ status }) => {
    const statusMap = {
        [QuoteStatus.ACCEPTED]: { label: 'Accepted', color: 'green' },
        [QuoteStatus.SENT]: { label: 'Sent', color: 'blue' },
        [QuoteStatus.DRAFT]: { label: 'Draft', color: 'gray' },
        [QuoteStatus.REJECTED]: { label: 'Rejected', color: 'red' },
    };
    const style = statusMap[status] || { label: status, color: 'gray' };
    return <Tag label={style.label} color={style.color as any} />;
export const DocumentStatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
    const statusMap = {
        [DocumentStatus.DRAFT]: { label: 'Draft', color: 'gray' },
        [DocumentStatus.IN_REVIEW]: { label: 'In Review', color: 'yellow' },
        [DocumentStatus.APPROVED]: { label: 'Approved', color: 'green' },
    };
    const style = statusMap[status] || { label: status, color: 'gray' };
    return <Tag label={style.label} color={style.color as any} />;
export const EquipmentStatusBadge: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
    const statusMap = {
        [EquipmentStatus.AVAILABLE]: { label: 'Available', color: 'green', indicator: 'green' },
        [EquipmentStatus.IN_USE]: { label: 'In Use', color: 'blue', indicator: 'blue' },
        [EquipmentStatus.MAINTENANCE]: { label: 'Maintenance', color: 'yellow', indicator: 'yellow' },
        [EquipmentStatus.OUT_OF_ORDER]: { label: 'Out of Order', color: 'red', indicator: 'red' },
    };
    const { label, color, indicator } = statusMap[status] || { label: status, color: 'gray', indicator: 'gray' };
    return <Tag label={label} color={color as any} statusIndicator={indicator as any} />;
};