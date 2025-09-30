import React from 'react';
import {
  TimesheetStatus,
  IncidentStatus,
  IncidentSeverity,
  InvoiceStatus,
  QuoteStatus,
  TodoStatus,
  DocumentStatus,
  EquipmentStatus,
} from '../../types';
import { Tag } from './Tag';

const fallback = { label: 'Unknown', color: 'gray', indicator: 'gray' };

export const TimesheetStatusBadge: React.FC<{ status: TimesheetStatus }> = ({ status }) => {
  const statusMap: Record<TimesheetStatus, { label: string; color: string; indicator: string }> = {
    [TimesheetStatus.PENDING]: { label: 'Pending', color: 'yellow', indicator: 'yellow' },
    [TimesheetStatus.APPROVED]: { label: 'Approved', color: 'green', indicator: 'green' },
    [TimesheetStatus.REJECTED]: { label: 'Rejected', color: 'red', indicator: 'red' },
    [TimesheetStatus.DRAFT]: { label: 'Draft', color: 'gray', indicator: 'gray' },
  };
  const { label, color, indicator } = statusMap[status] ?? fallback;
  return <Tag label={label} color={color as any} statusIndicator={indicator as any} />;
};

export const IncidentStatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  const statusMap: Record<IncidentStatus, { label: string; color: string; indicator: string }> = {
    [IncidentStatus.REPORTED]: { label: 'Reported', color: 'blue', indicator: 'blue' },
    [IncidentStatus.UNDER_INVESTIGATION]: { label: 'Investigating', color: 'yellow', indicator: 'yellow' },
    [IncidentStatus.RESOLVED]: { label: 'Resolved', color: 'green', indicator: 'green' },
  };
  const { label, color, indicator } = statusMap[status] ?? fallback;
  return <Tag label={label} color={color as any} statusIndicator={indicator as any} />;
};

export const IncidentSeverityBadge: React.FC<{ severity: IncidentSeverity }> = ({ severity }) => {
  const severityMap: Record<IncidentSeverity, { label: string; color: string }> = {
    [IncidentSeverity.CRITICAL]: { label: 'Critical', color: 'red' },
    [IncidentSeverity.HIGH]: { label: 'High', color: 'red' },
    [IncidentSeverity.MEDIUM]: { label: 'Medium', color: 'yellow' },
    [IncidentSeverity.LOW]: { label: 'Low', color: 'blue' },
  };
  const { label, color } = severityMap[severity] ?? fallback;
  return <Tag label={label} color={color as any} />;
};

export const InvoiceStatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const statusMap: Record<InvoiceStatus, { label: string; color: string }> = {
    [InvoiceStatus.PAID]: { label: 'Paid', color: 'green' },
    [InvoiceStatus.SENT]: { label: 'Sent', color: 'blue' },
    [InvoiceStatus.DRAFT]: { label: 'Draft', color: 'gray' },
    [InvoiceStatus.OVERDUE]: { label: 'Overdue', color: 'red' },
    [InvoiceStatus.CANCELLED]: { label: 'Cancelled', color: 'gray' },
  };
  const style = statusMap[status] ?? { label: status, color: 'gray' };
  return <Tag label={style.label} color={style.color as any} />;
};

export const QuoteStatusBadge: React.FC<{ status: QuoteStatus }> = ({ status }) => {
  const statusMap: Record<QuoteStatus, { label: string; color: string }> = {
    [QuoteStatus.ACCEPTED]: { label: 'Accepted', color: 'green' },
    [QuoteStatus.SENT]: { label: 'Sent', color: 'blue' },
    [QuoteStatus.DRAFT]: { label: 'Draft', color: 'gray' },
    [QuoteStatus.REJECTED]: { label: 'Rejected', color: 'red' },
  };
  const style = statusMap[status] ?? { label: status, color: 'gray' };
  return <Tag label={style.label} color={style.color as any} />;
};

export const DocumentStatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
  const statusMap: Record<DocumentStatus, { label: string; color: string }> = {
    [DocumentStatus.DRAFT]: { label: 'Draft', color: 'gray' },
    [DocumentStatus.IN_REVIEW]: { label: 'In Review', color: 'yellow' },
    [DocumentStatus.APPROVED]: { label: 'Approved', color: 'green' },
  };
  const style = statusMap[status] ?? { label: status, color: 'gray' };
  return <Tag label={style.label} color={style.color as any} />;
};

export const EquipmentStatusBadge: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
  const statusMap: Record<EquipmentStatus, { label: string; color: string; indicator: string }> = {
    [EquipmentStatus.AVAILABLE]: { label: 'Available', color: 'green', indicator: 'green' },
    [EquipmentStatus.IN_USE]: { label: 'In Use', color: 'blue', indicator: 'blue' },
    [EquipmentStatus.MAINTENANCE]: { label: 'Maintenance', color: 'yellow', indicator: 'yellow' },
    [EquipmentStatus.OUT_OF_ORDER]: { label: 'Out of Order', color: 'red', indicator: 'red' },
  };
  const { label, color, indicator } = statusMap[status] ?? fallback;
  return <Tag label={label} color={color as any} statusIndicator={indicator as any} />;
};
