// 🗄️ Supabase Database Client for ASAgents-Ultimate
// Complete database integration with real-time capabilities

import { createClient } from '@supabase/supabase-js';

// Supabase configuration - ASAgents-Ultimate Production Database
const supabaseUrl = 'https://qglvhxkgbzujglehewsa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbHZoeGtnYnp1amdsZWhld3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzc5MDEsImV4cCI6MjA3MzgxMzkwMX0.DxhGOBDyvSzuVYrUcDRcs3iBUN_knTUVcHXqNNkoogY';

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'asagents-ultimate@2.0.0'
    }
  }
});

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key');
};

// =============================================
// AUTHENTICATION FUNCTIONS
// =============================================

export const auth = {
  // Sign up new user
  async signUp(email: string, password: string, userData: any = {}) {
    try {
      console.log('📝 Attempting sign up for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            email_confirm: true
          }
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error.message);
      } else {
        console.log('✅ Sign up successful:', data.user?.email);

        // Create user profile if sign up successful
        if (data.user && !error) {
          console.log('📝 Creating profile for new user:', data.user.id);

          const profileResult = await createUserProfile(data.user.id, {
            email: data.user.email,
            name: userData.full_name || `${userData.first_name} ${userData.last_name}`,
            role: userData.role || 'worker',
            company_id: userData.company_id || null
          });

          if (profileResult.error) {
            console.error('⚠️ Profile creation failed, but user was created');
            // Don't fail the signup if profile creation fails
          }
        }
      }

      return { data, error };
    } catch (error: any) {
      console.error('❌ Sign up exception:', error);
      return { data: null, error: { message: error.message } };
    }
  },

  // Sign in user
  async signIn(email: string, password: string) {
    try {
      console.log('🔐 Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Sign in error:', error.message);
      } else {
        console.log('✅ Sign in successful:', data.user?.email);
      }

      return { data, error };
    } catch (error: any) {
      console.error('❌ Sign in exception:', error);
      return { data: null, error: { message: error.message } };
    }
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  // Update password
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  }
};

// Helper function to create user profile
async function createUserProfile(userId: string, profileData: any) {
  try {
    console.log('👤 Creating user profile for:', userId);

    // Prepare profile data with required fields
    const profileInsert = {
      id: userId,
      email: profileData.email,
      name: profileData.name || 'New User',
      role: profileData.role || 'worker',
      company_id: profileData.company_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avatar: profileData.avatar || null
    };

    console.log('📝 Profile data to insert:', profileInsert);

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileInsert)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating profile:', error.message);
      console.error('❌ Error details:', error);
    } else {
      console.log('✅ Profile created successfully:', data);
    }

    return { data, error };
  } catch (error: any) {
    console.error('❌ Exception creating profile:', error);
    return { data: null, error: { message: error.message } };
  }
}

// =============================================
// COMPANY FUNCTIONS
// =============================================

export const companies = {
  // Get all companies
  async getAll() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get company by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Create new company
  async create(company: any) {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single();
    return { data, error };
  },

  // Update company
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};

// =============================================
// USER FUNCTIONS
// =============================================

export const users = {
  // Get all users for a company
  async getByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get user by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Create new user
  async create(user: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    return { data, error };
  },

  // Update user
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Get users by role
  async getByRole(companyId: string, role: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .eq('role', role)
      .eq('is_active', true);
    return { data, error };
  }
};

// =============================================
// PROJECT FUNCTIONS
// =============================================

export const projects = {
  // Get all projects for a company
  async getByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_manager:users!projects_project_manager_id_fkey(
          id, name, email, role
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get project by ID with related data
  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_manager:users!projects_project_manager_id_fkey(
          id, name, email, role
        )
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Create new project
  async create(project: any) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    return { data, error };
  },

  // Update project
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Get project statistics
  async getStats(projectId: string) {
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('status, priority')
      .eq('project_id', projectId);

    const { data: incidents, error: incidentsError } = await supabase
      .from('safety_incidents')
      .select('severity')
      .eq('project_id', projectId);

    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment')
      .select('status')
      .eq('project_id', projectId);

    return {
      tasks: tasks || [],
      incidents: incidents || [],
      equipment: equipment || [],
      errors: { tasksError, incidentsError, equipmentError }
    };
  }
};

// =============================================
// TASK FUNCTIONS
// =============================================

export const tasks = {
  // Get tasks for a project
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get tasks assigned to a user
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(
          id, name, status
        )
      `)
      .eq('assigned_to', userId)
      .order('due_date', { ascending: true });
    return { data, error };
  },

  // Create new task
  async create(task: any) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    return { data, error };
  },

  // Update task
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Update task progress
  async updateProgress(id: string, progress: number) {
    const updates = {
      progress_percentage: progress,
      status: progress === 100 ? 'completed' : 'in_progress',
      completed_date: progress === 100 ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};

// =============================================
// EQUIPMENT FUNCTIONS
// =============================================

export const equipment = {
  // Get equipment for a company
  async getByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get equipment by project
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('project_id', projectId)
      .order('name');
    return { data, error };
  },

  // Create new equipment
  async create(equipmentData: any) {
    const { data, error } = await supabase
      .from('equipment')
      .insert(equipmentData)
      .select()
      .single();
    return { data, error };
  },

  // Update equipment
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('equipment')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};

// =============================================
// SAFETY FUNCTIONS
// =============================================

export const safety = {
  // Get safety incidents for a project
  async getIncidents(projectId: string) {
    const { data, error } = await supabase
      .from('safety_incidents')
      .select(`
        *,
        reported_by_user:users!safety_incidents_reported_by_fkey(
          id, name, email
        )
      `)
      .eq('project_id', projectId)
      .order('incident_date', { ascending: false });
    return { data, error };
  },

  // Create safety incident
  async createIncident(incident: any) {
    const { data, error } = await supabase
      .from('safety_incidents')
      .insert(incident)
      .select()
      .single();
    return { data, error };
  },

  // Get safety inspections
  async getInspections(projectId: string) {
    const { data, error } = await supabase
      .from('safety_inspections')
      .select(`
        *,
        inspector:users!safety_inspections_inspector_id_fkey(
          id, name, email
        )
      `)
      .eq('project_id', projectId)
      .order('inspection_date', { ascending: false });
    return { data, error };
  }
};

// =============================================
// REAL-TIME SUBSCRIPTIONS
// =============================================

export const realtime = {
  // Subscribe to project changes
  subscribeToProject(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`project-${projectId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
        callback
      )
      .subscribe();
  },

  // Subscribe to task changes
  subscribeToTasks(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`tasks-${projectId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
        callback
      )
      .subscribe();
  },

  // Subscribe to safety incidents
  subscribeToSafety(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`safety-${projectId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'safety_incidents', filter: `project_id=eq.${projectId}` },
        callback
      )
      .subscribe();
  },

  // Unsubscribe from channel
  unsubscribe(subscription: any) {
    return supabase.removeChannel(subscription);
  }
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

export const utils = {
  // Generate unique equipment number
  async generateEquipmentNumber(companyId: string) {
    const { data, error } = await supabase
      .from('equipment')
      .select('equipment_number')
      .eq('company_id', companyId)
      .order('equipment_number', { ascending: false })
      .limit(1);

    if (error) return { number: 'EQ-001', error };

    const lastNumber = data?.[0]?.equipment_number;
    if (!lastNumber) return { number: 'EQ-001', error: null };

    const match = lastNumber.match(/EQ-(\d+)/);
    const nextNumber = match ? parseInt(match[1]) + 1 : 1;
    return { number: `EQ-${nextNumber.toString().padStart(3, '0')}`, error: null };
  },

  // Generate unique incident number
  async generateIncidentNumber(projectId: string) {
    const { data, error } = await supabase
      .from('safety_incidents')
      .select('incident_number')
      .eq('project_id', projectId)
      .order('incident_number', { ascending: false })
      .limit(1);

    if (error) return { number: 'INC-001', error };

    const lastNumber = data?.[0]?.incident_number;
    if (!lastNumber) return { number: 'INC-001', error: null };

    const match = lastNumber.match(/INC-(\d+)/);
    const nextNumber = match ? parseInt(match[1]) + 1 : 1;
    return { number: `INC-${nextNumber.toString().padStart(3, '0')}`, error: null };
  }
};

export default supabase;


