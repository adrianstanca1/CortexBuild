/**
 * Analytics Service
 * Handles event tracking, metrics calculation, and data aggregation for analytics dashboard
 * Features: Event tracking, metrics retrieval, data aggregation, chart data generation
 */

import { supabase } from '../supabase/client';

export interface AnalyticsEvent {
  id: string;
  project_id: string;
  company_id: string;
  event_type: string;
  metric_name: string;
  metric_value: number;
  user_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ProjectMetrics {
  id: string;
  project_id: string;
  date: string;
  tasks_completed: number;
  tasks_pending: number;
  tasks_overdue: number;
  team_hours: number;
  budget_spent: number;
  budget_remaining: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface TeamPerformanceMetrics {
  id: string;
  project_id: string;
  user_id: string;
  date: string;
  tasks_completed: number;
  hours_worked: number;
  productivity_score: number;
  quality_score: number;
  created_at: string;
  updated_at: string;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

export class AnalyticsService {
  /**
   * Track an analytics event
   */
  async trackEvent(
    projectId: string,
    companyId: string,
    eventType: string,
    metricName: string,
    metricValue: number,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<AnalyticsEvent | null> {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .insert([{
          project_id: projectId,
          company_id: companyId,
          event_type: eventType,
          metric_name: metricName,
          metric_value: metricValue,
          user_id: userId,
          metadata: metadata || {}
        }])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Analytics event tracked:', eventType);
      return data;
    } catch (error) {
      console.error('❌ Error tracking analytics event:', error);
      throw error;
    }
  }

  /**
   * Get analytics events for a project
   */
  async getEvents(
    projectId: string,
    limit = 100,
    offset = 0,
    eventType?: string
  ): Promise<AnalyticsEvent[]> {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching analytics events:', error);
      throw error;
    }
  }

  /**
   * Get project metrics for a date range
   */
  async getProjectMetrics(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<ProjectMetrics[]> {
    try {
      const { data, error } = await supabase
        .from('project_metrics')
        .select('*')
        .eq('project_id', projectId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching project metrics:', error);
      throw error;
    }
  }

  /**
   * Get team performance metrics for a project
   */
  async getTeamMetrics(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<TeamPerformanceMetrics[]> {
    try {
      const { data, error } = await supabase
        .from('team_performance_metrics')
        .select('*')
        .eq('project_id', projectId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching team metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate project metrics for a specific date
   */
  async calculateProjectMetrics(
    projectId: string,
    date: string,
    metrics: Partial<ProjectMetrics>
  ): Promise<ProjectMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('project_metrics')
        .upsert([{
          project_id: projectId,
          date,
          ...metrics
        }], { onConflict: 'project_id,date' })
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Project metrics calculated for', date);
      return data;
    } catch (error) {
      console.error('❌ Error calculating project metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate team performance metrics
   */
  async calculateTeamMetrics(
    projectId: string,
    userId: string,
    date: string,
    metrics: Partial<TeamPerformanceMetrics>
  ): Promise<TeamPerformanceMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('team_performance_metrics')
        .upsert([{
          project_id: projectId,
          user_id: userId,
          date,
          ...metrics
        }], { onConflict: 'project_id,user_id,date' })
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Team metrics calculated for', date);
      return data;
    } catch (error) {
      console.error('❌ Error calculating team metrics:', error);
      throw error;
    }
  }

  /**
   * Get chart data for tasks completed over time
   */
  async getTasksCompletedChartData(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<ChartData[]> {
    try {
      const metrics = await this.getProjectMetrics(projectId, startDate, endDate);
      return metrics.map(m => ({
        name: m.date,
        value: m.tasks_completed,
        date: m.date
      }));
    } catch (error) {
      console.error('❌ Error generating tasks completed chart data:', error);
      throw error;
    }
  }

  /**
   * Get chart data for budget over time
   */
  async getBudgetChartData(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<ChartData[]> {
    try {
      const metrics = await this.getProjectMetrics(projectId, startDate, endDate);
      return metrics.map(m => ({
        name: m.date,
        value: m.budget_spent,
        date: m.date
      }));
    } catch (error) {
      console.error('❌ Error generating budget chart data:', error);
      throw error;
    }
  }

  /**
   * Get chart data for team productivity
   */
  async getTeamProductivityChartData(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<ChartData[]> {
    try {
      const metrics = await this.getTeamMetrics(projectId, startDate, endDate);
      
      // Calculate average productivity score per day
      const dailyAverages = new Map<string, { sum: number; count: number }>();
      
      metrics.forEach(m => {
        const existing = dailyAverages.get(m.date) || { sum: 0, count: 0 };
        dailyAverages.set(m.date, {
          sum: existing.sum + m.productivity_score,
          count: existing.count + 1
        });
      });

      return Array.from(dailyAverages.entries()).map(([date, data]) => ({
        name: date,
        value: Math.round(data.sum / data.count),
        date
      }));
    } catch (error) {
      console.error('❌ Error generating team productivity chart data:', error);
      throw error;
    }
  }

  /**
   * Get summary statistics for a project
   */
  async getProjectSummary(projectId: string): Promise<Record<string, any>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayMetrics } = await supabase
        .from('project_metrics')
        .select('*')
        .eq('project_id', projectId)
        .eq('date', today)
        .single();

      const { data: totalEvents } = await supabase
        .from('analytics_events')
        .select('count', { count: 'exact' })
        .eq('project_id', projectId);

      return {
        tasksCompleted: todayMetrics?.tasks_completed || 0,
        tasksPending: todayMetrics?.tasks_pending || 0,
        tasksOverdue: todayMetrics?.tasks_overdue || 0,
        progress: todayMetrics?.progress_percentage || 0,
        budgetSpent: todayMetrics?.budget_spent || 0,
        budgetRemaining: todayMetrics?.budget_remaining || 0,
        totalEvents: totalEvents?.count || 0
      };
    } catch (error) {
      console.error('❌ Error fetching project summary:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();

