import { pool } from './db.js';
import { logger } from '../utils/logger.js';
import { realTimeService } from './realTimeService.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

/**
 * Enhanced Time Tracking Service
 * Provides comprehensive time tracking, analytics, and productivity insights
 */

export interface TimeEntry {
  id: number;
  userId: number;
  taskId?: number;
  projectId?: number;
  description: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  isRunning: boolean;
  tags: string[];
  billable: boolean;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeTrackingSummary {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalEarnings: number;
  averageHourlyRate: number;
  productivityScore: number;
  entriesCount: number;
  projectBreakdown: Array<{
    projectId: number;
    projectName: string;
    hours: number;
    percentage: number;
  }>;
  dailyBreakdown: Array<{
    date: string;
    hours: number;
    entries: number;
  }>;
}

export interface ProductivityInsights {
  peakHours: Array<{
    hour: number;
    productivity: number;
  }>;
  mostProductiveDays: string[];
  averageSessionLength: number;
  focusScore: number;
  distractionEvents: number;
  recommendations: string[];
}

export class TimeTrackingService {
  /**
   * Start a new time entry
   */
  static async startTimeEntry(
    tenantId: number,
    userId: number,
    data: {
      taskId?: number;
      projectId?: number;
      description: string;
      tags?: string[];
      billable?: boolean;
      hourlyRate?: number;
    }
  ): Promise<TimeEntry> {
    try {
      // Stop any currently running entries for this user
      await this.stopAllRunningEntries(tenantId, userId);

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO time_entries (
          tenant_id, user_id, task_id, project_id, description, 
          start_time, tags, billable, hourly_rate, is_running
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, 1)`,
        [
          tenantId,
          userId,
          data.taskId || null,
          data.projectId || null,
          data.description,
          JSON.stringify(data.tags || []),
          data.billable || false,
          data.hourlyRate || null
        ]
      );

      const timeEntry = await this.getTimeEntry(tenantId, result.insertId);

      // Broadcast real-time event
      realTimeService.broadcastEvent({
        type: 'user_activity',
        entityType: 'user',
        entityId: userId,
        tenantId,
        userId,
        data: {
          action: 'time_tracking_started',
          timeEntryId: result.insertId,
          description: data.description,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

      logger.info({ timeEntryId: result.insertId, userId }, 'Time entry started');
      return timeEntry;
    } catch (error) {
      logger.error({ error, userId, data }, 'Failed to start time entry');
      throw error;
    }
  }

  /**
   * Stop a time entry
   */
  static async stopTimeEntry(
    tenantId: number,
    timeEntryId: number,
    userId: number
  ): Promise<TimeEntry> {
    try {
      // Calculate duration and update entry
      await pool.query(
        `UPDATE time_entries 
         SET end_time = NOW(), 
             duration = TIMESTAMPDIFF(MINUTE, start_time, NOW()),
             is_running = 0,
             updated_at = NOW()
         WHERE id = ? AND tenant_id = ? AND user_id = ?`,
        [timeEntryId, tenantId, userId]
      );

      const timeEntry = await this.getTimeEntry(tenantId, timeEntryId);

      // Broadcast real-time event
      realTimeService.broadcastEvent({
        type: 'user_activity',
        entityType: 'user',
        entityId: userId,
        tenantId,
        userId,
        data: {
          action: 'time_tracking_stopped',
          timeEntryId,
          duration: timeEntry.duration,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

      logger.info({ timeEntryId, userId, duration: timeEntry.duration }, 'Time entry stopped');
      return timeEntry;
    } catch (error) {
      logger.error({ error, timeEntryId, userId }, 'Failed to stop time entry');
      throw error;
    }
  }

  /**
   * Get current running time entry for user
   */
  static async getCurrentTimeEntry(tenantId: number, userId: number): Promise<TimeEntry | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT te.*, p.name as project_name, t.title as task_title
         FROM time_entries te
         LEFT JOIN projects p ON te.project_id = p.id
         LEFT JOIN tasks t ON te.task_id = t.id
         WHERE te.tenant_id = ? AND te.user_id = ? AND te.is_running = 1
         ORDER BY te.start_time DESC
         LIMIT 1`,
        [tenantId, userId]
      );

      if (rows.length === 0) return null;

      return this.mapRowToTimeEntry(rows[0]);
    } catch (error) {
      logger.error({ error, tenantId, userId }, 'Failed to get current time entry');
      throw error;
    }
  }

  /**
   * Get time entries for user with filters
   */
  static async getTimeEntries(
    tenantId: number,
    userId: number,
    filters: {
      startDate?: string;
      endDate?: string;
      projectId?: number;
      taskId?: number;
      billable?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ entries: TimeEntry[]; total: number }> {
    try {
      let whereClause = 'WHERE te.tenant_id = ? AND te.user_id = ?';
      const params: any[] = [tenantId, userId];

      if (filters.startDate) {
        whereClause += ' AND DATE(te.start_time) >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        whereClause += ' AND DATE(te.start_time) <= ?';
        params.push(filters.endDate);
      }

      if (filters.projectId) {
        whereClause += ' AND te.project_id = ?';
        params.push(filters.projectId);
      }

      if (filters.taskId) {
        whereClause += ' AND te.task_id = ?';
        params.push(filters.taskId);
      }

      if (filters.billable !== undefined) {
        whereClause += ' AND te.billable = ?';
        params.push(filters.billable);
      }

      // Get total count
      const [countResult] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM time_entries te ${whereClause}`,
        params
      );

      // Get entries with pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT te.*, p.name as project_name, t.title as task_title
         FROM time_entries te
         LEFT JOIN projects p ON te.project_id = p.id
         LEFT JOIN tasks t ON te.task_id = t.id
         ${whereClause}
         ORDER BY te.start_time DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      const entries = rows.map(row => this.mapRowToTimeEntry(row));

      return {
        entries,
        total: countResult[0].total
      };
    } catch (error) {
      logger.error({ error, tenantId, userId, filters }, 'Failed to get time entries');
      throw error;
    }
  }

  /**
   * Get time tracking summary for period
   */
  static async getTimeTrackingSummary(
    tenantId: number,
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<TimeTrackingSummary> {
    try {
      // Get basic summary
      const [summaryRows] = await pool.query<RowDataPacket[]>(
        `SELECT 
           COUNT(*) as entries_count,
           SUM(CASE WHEN duration IS NOT NULL THEN duration ELSE 0 END) as total_minutes,
           SUM(CASE WHEN billable = 1 AND duration IS NOT NULL THEN duration ELSE 0 END) as billable_minutes,
           SUM(CASE WHEN billable = 0 AND duration IS NOT NULL THEN duration ELSE 0 END) as non_billable_minutes,
           SUM(CASE WHEN billable = 1 AND hourly_rate IS NOT NULL AND duration IS NOT NULL 
               THEN (duration / 60) * hourly_rate ELSE 0 END) as total_earnings,
           AVG(CASE WHEN hourly_rate IS NOT NULL THEN hourly_rate END) as avg_hourly_rate
         FROM time_entries 
         WHERE tenant_id = ? AND user_id = ? 
         AND DATE(start_time) BETWEEN ? AND ?`,
        [tenantId, userId, startDate, endDate]
      );

      // Get project breakdown
      const [projectRows] = await pool.query<RowDataPacket[]>(
        `SELECT 
           te.project_id,
           p.name as project_name,
           SUM(CASE WHEN te.duration IS NOT NULL THEN te.duration ELSE 0 END) as total_minutes
         FROM time_entries te
         LEFT JOIN projects p ON te.project_id = p.id
         WHERE te.tenant_id = ? AND te.user_id = ? 
         AND DATE(te.start_time) BETWEEN ? AND ?
         AND te.project_id IS NOT NULL
         GROUP BY te.project_id, p.name
         ORDER BY total_minutes DESC`,
        [tenantId, userId, startDate, endDate]
      );

      // Get daily breakdown
      const [dailyRows] = await pool.query<RowDataPacket[]>(
        `SELECT 
           DATE(start_time) as date,
           COUNT(*) as entries,
           SUM(CASE WHEN duration IS NOT NULL THEN duration ELSE 0 END) as total_minutes
         FROM time_entries 
         WHERE tenant_id = ? AND user_id = ? 
         AND DATE(start_time) BETWEEN ? AND ?
         GROUP BY DATE(start_time)
         ORDER BY date`,
        [tenantId, userId, startDate, endDate]
      );

      const summary = summaryRows[0];
      const totalHours = (summary.total_minutes || 0) / 60;
      const billableHours = (summary.billable_minutes || 0) / 60;
      const nonBillableHours = (summary.non_billable_minutes || 0) / 60;

      // Calculate project breakdown percentages
      const projectBreakdown = projectRows.map(row => ({
        projectId: row.project_id,
        projectName: row.project_name,
        hours: row.total_minutes / 60,
        percentage: totalHours > 0 ? (row.total_minutes / (summary.total_minutes || 1)) * 100 : 0
      }));

      // Calculate daily breakdown
      const dailyBreakdown = dailyRows.map(row => ({
        date: row.date,
        hours: row.total_minutes / 60,
        entries: row.entries
      }));

      // Calculate productivity score (simplified)
      const productivityScore = this.calculateProductivityScore(
        summary.entries_count,
        totalHours,
        dailyBreakdown.length
      );

      return {
        totalHours,
        billableHours,
        nonBillableHours,
        totalEarnings: summary.total_earnings || 0,
        averageHourlyRate: summary.avg_hourly_rate || 0,
        productivityScore,
        entriesCount: summary.entries_count,
        projectBreakdown,
        dailyBreakdown
      };
    } catch (error) {
      logger.error({ error, tenantId, userId, startDate, endDate }, 'Failed to get time tracking summary');
      throw error;
    }
  }

  /**
   * Get productivity insights
   */
  static async getProductivityInsights(
    tenantId: number,
    userId: number,
    days: number = 30
  ): Promise<ProductivityInsights> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get hourly productivity data
      const [hourlyRows] = await pool.query<RowDataPacket[]>(
        `SELECT 
           HOUR(start_time) as hour,
           COUNT(*) as entries,
           AVG(CASE WHEN duration IS NOT NULL THEN duration ELSE 0 END) as avg_duration
         FROM time_entries 
         WHERE tenant_id = ? AND user_id = ? 
         AND start_time >= ?
         GROUP BY HOUR(start_time)
         ORDER BY hour`,
        [tenantId, userId, startDate.toISOString()]
      );

      // Get daily productivity
      const [dailyRows] = await pool.query<RowDataPacket[]>(
        `SELECT 
           DAYNAME(start_time) as day_name,
           DATE(start_time) as date,
           SUM(CASE WHEN duration IS NOT NULL THEN duration ELSE 0 END) as total_minutes
         FROM time_entries 
         WHERE tenant_id = ? AND user_id = ? 
         AND start_time >= ?
         GROUP BY DATE(start_time), DAYNAME(start_time)
         ORDER BY total_minutes DESC`,
        [tenantId, userId, startDate.toISOString()]
      );

      // Calculate peak hours
      const peakHours = hourlyRows.map(row => ({
        hour: row.hour,
        productivity: row.entries * (row.avg_duration / 60) // entries * average hours
      })).sort((a, b) => b.productivity - a.productivity);

      // Get most productive days
      const mostProductiveDays = dailyRows.slice(0, 5).map(row => row.day_name);

      // Calculate average session length
      const [sessionRows] = await pool.query<RowDataPacket[]>(
        `SELECT AVG(CASE WHEN duration IS NOT NULL THEN duration ELSE 0 END) as avg_session
         FROM time_entries 
         WHERE tenant_id = ? AND user_id = ? 
         AND start_time >= ? AND duration IS NOT NULL`,
        [tenantId, userId, startDate.toISOString()]
      );

      const averageSessionLength = (sessionRows[0]?.avg_session || 0) / 60; // Convert to hours

      // Calculate focus score (simplified)
      const focusScore = this.calculateFocusScore(averageSessionLength, peakHours.length);

      // Generate recommendations
      const recommendations = this.generateProductivityRecommendations(
        peakHours,
        averageSessionLength,
        mostProductiveDays
      );

      return {
        peakHours: peakHours.slice(0, 8), // Top 8 hours
        mostProductiveDays,
        averageSessionLength,
        focusScore,
        distractionEvents: 0, // Would be calculated from actual distraction tracking
        recommendations
      };
    } catch (error) {
      logger.error({ error, tenantId, userId, days }, 'Failed to get productivity insights');
      throw error;
    }
  }

  /**
   * Stop all running entries for user
   */
  private static async stopAllRunningEntries(tenantId: number, userId: number): Promise<void> {
    await pool.query(
      `UPDATE time_entries 
       SET end_time = NOW(), 
           duration = TIMESTAMPDIFF(MINUTE, start_time, NOW()),
           is_running = 0,
           updated_at = NOW()
       WHERE tenant_id = ? AND user_id = ? AND is_running = 1`,
      [tenantId, userId]
    );
  }

  /**
   * Get single time entry
   */
  private static async getTimeEntry(tenantId: number, timeEntryId: number): Promise<TimeEntry> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT te.*, p.name as project_name, t.title as task_title
       FROM time_entries te
       LEFT JOIN projects p ON te.project_id = p.id
       LEFT JOIN tasks t ON te.task_id = t.id
       WHERE te.id = ? AND te.tenant_id = ?`,
      [timeEntryId, tenantId]
    );

    if (rows.length === 0) {
      throw new Error('Time entry not found');
    }

    return this.mapRowToTimeEntry(rows[0]);
  }

  /**
   * Map database row to TimeEntry object
   */
  private static mapRowToTimeEntry(row: any): TimeEntry {
    return {
      id: row.id,
      userId: row.user_id,
      taskId: row.task_id,
      projectId: row.project_id,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      duration: row.duration,
      isRunning: Boolean(row.is_running),
      tags: row.tags ? JSON.parse(row.tags) : [],
      billable: Boolean(row.billable),
      hourlyRate: row.hourly_rate,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Calculate productivity score
   */
  private static calculateProductivityScore(
    entriesCount: number,
    totalHours: number,
    activeDays: number
  ): number {
    // Simplified productivity calculation
    const consistencyScore = activeDays > 0 ? Math.min((activeDays / 30) * 100, 100) : 0;
    const volumeScore = Math.min((totalHours / 40) * 100, 100); // Based on 40-hour work week
    const frequencyScore = Math.min((entriesCount / 50) * 100, 100); // Based on reasonable entry frequency

    return Math.round((consistencyScore + volumeScore + frequencyScore) / 3);
  }

  /**
   * Calculate focus score
   */
  private static calculateFocusScore(averageSessionLength: number, peakHoursCount: number): number {
    // Longer sessions and consistent peak hours indicate better focus
    const sessionScore = Math.min((averageSessionLength / 2) * 100, 100); // 2 hours as ideal
    const consistencyScore = Math.min((peakHoursCount / 8) * 100, 100); // 8 hours as full day

    return Math.round((sessionScore + consistencyScore) / 2);
  }

  /**
   * Generate productivity recommendations
   */
  private static generateProductivityRecommendations(
    peakHours: any[],
    averageSessionLength: number,
    mostProductiveDays: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (peakHours.length > 0) {
      const topHour = peakHours[0].hour;
      recommendations.push(`Your peak productivity is at ${topHour}:00. Schedule important tasks during this time.`);
    }

    if (averageSessionLength < 1) {
      recommendations.push('Consider longer focused work sessions. Aim for 1-2 hour blocks for better productivity.');
    } else if (averageSessionLength > 3) {
      recommendations.push('Take regular breaks to maintain focus. Consider the Pomodoro technique.');
    }

    if (mostProductiveDays.length > 0) {
      recommendations.push(`You're most productive on ${mostProductiveDays[0]}s. Plan challenging tasks for these days.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Keep tracking your time to identify productivity patterns and opportunities for improvement.');
    }

    return recommendations;
  }
}
