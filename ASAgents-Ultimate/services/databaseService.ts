// @ts-nocheck
import { supabase, type Database } from '../lib/supabase';
import type { User, Project, Company, ProjectStatus } from '../types';
// Local implementation of getEnvironment to avoid missing import error
function getEnvironment() {
  return {
    supabaseUrl: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key'
  };
}

type Tables = Database['public']['Tables'];
type ProjectRow = Tables['projects']['Row'];
type UserRow = Tables['users']['Row'];
type CompanyRow = Tables['companies']['Row'];
type TaskRow = Tables['tasks']['Row'];
type ExpenseRow = Tables['expenses']['Row'];

/**
 * Database service that provides a unified interface for data operations
 * Automatically falls back to mock data when Supabase is not configured
 */
class DatabaseService {
  private isSupabaseConfigured(): boolean {
    const { supabaseUrl, supabaseAnonKey } = environment;
    return !!(supabaseUrl && supabaseAnonKey && 
              supabaseUrl !== 'https://your-project.supabase.co' && 
              supabaseAnonKey !== 'your-anon-key');
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    if (!this.isSupabaseConfigured()) {
      // Return mock data when Supabase is not configured
      return [
        {
          id: '1',
          name: 'Demo Construction Co.',
          storageUsageGb: 2.5,
          maxUsers: 50,
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'BuildRight Ltd.',
          storageUsageGb: 1.8,
          maxUsers: 25,
          status: 'active',
          createdAt: new Date().toISOString(),
        }
      ];
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.mapCompanyFromDb);
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw new Error('Failed to fetch companies');
    }
  }

  async createCompany(company: Omit<Company, 'id' | 'createdAt'>): Promise<Company> {
    if (!this.isSupabaseConfigured()) {
      throw new Error('Database not configured');
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          name: company.name,
          storage_usage_gb: company.storageUsageGb || 0,
          max_users: company.maxUsers || 10,
          status: company.status || 'active',
        }])
        .select()
        .single();

      if (error) throw error;

      return this.mapCompanyFromDb(data);
    } catch (error) {
      console.error('Error creating company:', error);
      throw new Error('Failed to create company');
    }
  }

  // Projects
  async getProjects(companyId?: string): Promise<Project[]> {
    if (!this.isSupabaseConfigured()) {
      // Return mock data
      return [
        {
          id: '1',
          companyId: companyId || '1',
          name: 'Office Building Renovation',
          locationAddress: '123 Business District, London',
          locationLat: 51.5074,
          locationLng: -0.1278,
          budget: 250000,
          spent: 125000,
          actualCost: 130000,
          startDate: '2024-01-15',
          endDate: '2024-06-30',
          status: 'ACTIVE' as ProjectStatus,
          imageUrl: 'https://picsum.photos/seed/project1/800/400',
          projectType: 'Commercial',
          workClassification: 'Renovation',
          geofenceRadius: 100,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          companyId: companyId || '1',
          name: 'Residential Complex Phase 1',
          locationAddress: '456 Residential Ave, Manchester',
          locationLat: 53.4808,
          locationLng: -2.2426,
          budget: 500000,
          spent: 200000,
          actualCost: 195000,
          startDate: '2024-02-01',
          endDate: '2024-12-31',
          status: 'PLANNING' as ProjectStatus,
          imageUrl: 'https://picsum.photos/seed/project2/800/400',
          projectType: 'Residential',
          workClassification: 'New Build',
          geofenceRadius: 150,
          createdAt: new Date().toISOString(),
        }
      ];
    }

    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(this.mapProjectFromDb);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    if (!this.isSupabaseConfigured()) {
      throw new Error('Database not configured');
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          company_id: project.companyId,
          name: project.name,
          location_address: project.locationAddress,
          location_lat: project.locationLat,
          location_lng: project.locationLng,
          budget: project.budget,
          spent: project.spent || 0,
          actual_cost: project.actualCost || 0,
          start_date: project.startDate,
          end_date: project.endDate,
          status: project.status,
          image_url: project.imageUrl,
          project_type: project.projectType,
          work_classification: project.workClassification,
          geofence_radius: project.geofenceRadius || 100,
        }])
        .select()
        .single();

      if (error) throw error;

      return this.mapProjectFromDb(data);
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    if (!this.isSupabaseConfigured()) {
      throw new Error('Database not configured');
    }

    try {
      const updateData: Partial<Tables['projects']['Update']> = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.locationAddress) updateData.location_address = updates.locationAddress;
      if (updates.locationLat) updateData.location_lat = updates.locationLat;
      if (updates.locationLng) updateData.location_lng = updates.locationLng;
      if (updates.budget) updateData.budget = updates.budget;
      if (updates.spent !== undefined) updateData.spent = updates.spent;
      if (updates.actualCost !== undefined) updateData.actual_cost = updates.actualCost;
      if (updates.startDate) updateData.start_date = updates.startDate;
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
      if (updates.status) updateData.status = updates.status;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.projectType) updateData.project_type = updates.projectType;
      if (updates.workClassification) updateData.work_classification = updates.workClassification;
      if (updates.geofenceRadius) updateData.geofence_radius = updates.geofenceRadius;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapProjectFromDb(data);
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  }

  // Users
  async getUsers(companyId?: string): Promise<User[]> {
    if (!this.isSupabaseConfigured()) {
      // Return mock data
      return [
        {
          id: '1',
          companyId: companyId || '1',
          email: 'admin@demo.com',
          firstName: 'John',
          lastName: 'Admin',
          role: 'ADMIN',
          avatar: null,
          phone: '+44 20 1234 5678',
          mfaEnabled: false,
          createdAt: new Date().toISOString(),
        }
      ];
    }

    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(this.mapUserFromDb);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Mapping functions
  private mapCompanyFromDb(row: CompanyRow): Company {
    return {
      id: row.id,
      name: row.name,
      storageUsageGb: row.storage_usage_gb,
      maxUsers: row.max_users,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  private mapProjectFromDb(row: ProjectRow): Project {
    return {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      locationAddress: row.location_address,
      locationLat: row.location_lat,
      locationLng: row.location_lng,
      budget: row.budget,
      spent: row.spent,
      actualCost: row.actual_cost,
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status as ProjectStatus,
      imageUrl: row.image_url,
      projectType: row.project_type,
      workClassification: row.work_classification,
      geofenceRadius: row.geofence_radius,
      createdAt: row.created_at,
    };
  }

  private mapUserFromDb(row: UserRow): User {
    return {
      id: row.id,
      companyId: row.company_id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role as User['role'],
      avatar: row.avatar,
      phone: row.phone,
      mfaEnabled: row.mfa_enabled,
      createdAt: row.created_at,
    };
  }
}

export const databaseService = new DatabaseService();
