export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface TimesheetEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  date: Date;
  startTime: string;
  endTime: string;
  hours: number;
  breakHours: number;
  overtimeHours: number;
  description: string;
  status: TimesheetStatus;
  approvedBy?: string; // User ID
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyTimesheet {
  userId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  entries: TimesheetEntry[];
  totalHours: number;
  totalOvertimeHours: number;
  status: TimesheetStatus;
}
