/**
 * Reporting Service
 * Handles report creation, templates, scheduling, and generation
 * Features: Report CRUD, template management, scheduling, export functionality
 */

import { supabase } from '../supabase/client';

export interface Report {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  project_id?: string;
  company_id?: string;
  template_type: 'project_summary' | 'team_performance' | 'budget_analysis' | 'timeline_analysis' | 'custom';
  filters?: Record<string, any>;
  schedule?: 'once' | 'daily' | 'weekly' | 'monthly' | 'never';
  recipients?: string[];
  last_generated_at?: string;
  next_scheduled_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  sections: string[];
  default_filters?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ReportHistory {
  id: string;
  report_id: string;
  generated_by: string;
  file_path?: string;
  file_size?: number;
  format?: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
}

export class ReportingService {
  /**
   * Create a new report
   */
  async createReport(
    name: string,
    templateType: Report['template_type'],
    createdBy: string,
    options?: {
      description?: string;
      projectId?: string;
      companyId?: string;
      filters?: Record<string, any>;
      schedule?: Report['schedule'];
      recipients?: string[];
    }
  ): Promise<Report | null> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          name,
          description: options?.description,
          created_by: createdBy,
          project_id: options?.projectId,
          company_id: options?.companyId,
          template_type: templateType,
          filters: options?.filters || {},
          schedule: options?.schedule || 'never',
          recipients: options?.recipients || [],
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Report created:', name);
      return data;
    } catch (error) {
      console.error('❌ Error creating report:', error);
      throw error;
    }
  }

  /**
   * Get reports for a user
   */
  async getReports(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<Report[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      throw error;
    }
  }

  /**
   * Get a single report by ID
   */
  async getReport(reportId: string): Promise<Report | null> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error fetching report:', error);
      throw error;
    }
  }

  /**
   * Update a report
   */
  async updateReport(
    reportId: string,
    updates: Partial<Report>
  ): Promise<Report | null> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Report updated:', reportId);
      return data;
    } catch (error) {
      console.error('❌ Error updating report:', error);
      throw error;
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      console.log('✅ Report deleted:', reportId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting report:', error);
      throw error;
    }
  }

  /**
   * Get all report templates
   */
  async getTemplates(): Promise<ReportTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<ReportTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('category', category);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching templates by category:', error);
      throw error;
    }
  }

  /**
   * Generate a report
   */
  async generateReport(
    reportId: string,
    userId: string,
    format: ReportHistory['format'] = 'json'
  ): Promise<ReportHistory | null> {
    try {
      // Create report history entry
      const { data, error } = await supabase
        .from('report_history')
        .insert([{
          report_id: reportId,
          generated_by: userId,
          format,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      // TODO: Implement actual report generation logic
      // This would involve:
      // 1. Fetching report configuration
      // 2. Gathering data based on filters
      // 3. Generating the report in the specified format
      // 4. Storing the file
      // 5. Updating the history entry with file path and status

      console.log('✅ Report generation started:', reportId);
      return data;
    } catch (error) {
      console.error('❌ Error generating report:', error);
      throw error;
    }
  }

  /**
   * Get report history
   */
  async getReportHistory(
    reportId: string,
    limit = 20
  ): Promise<ReportHistory[]> {
    try {
      const { data, error } = await supabase
        .from('report_history')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching report history:', error);
      throw error;
    }
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(): Promise<Report[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .neq('schedule', 'never')
        .eq('is_active', true)
        .order('next_scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching scheduled reports:', error);
      throw error;
    }
  }

  /**
   * Update report schedule
   */
  async updateSchedule(
    reportId: string,
    schedule: Report['schedule'],
    nextScheduledAt?: string
  ): Promise<Report | null> {
    try {
      const updates: Partial<Report> = { schedule };
      if (nextScheduledAt) {
        updates.next_scheduled_at = nextScheduledAt;
      }

      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Report schedule updated:', reportId);
      return data;
    } catch (error) {
      console.error('❌ Error updating schedule:', error);
      throw error;
    }
  }
}

export const reportingService = new ReportingService();

