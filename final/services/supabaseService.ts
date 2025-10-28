import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Company, Project, Todo, TimeEntry } from '../types';

/**
 * Supabase Service Layer
 * Provides real database operations when Supabase is configured
 * Falls back to mock API when not configured
 */

export class SupabaseService {
  // =====================================================
  // AUTH OPERATIONS
  // =====================================================

  async signUp(email: string, password: string, name: string, companyName?: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          company_name: companyName,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Create company if provided
    let companyId = null;
    if (companyName) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({ name: companyName })
        .select()
        .single();

      if (companyError) throw companyError;
      companyId = company.id;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        company_id: companyId,
        role: companyId ? 'admin' : 'user', // First user of company is admin
        permissions: companyId ? ['*'] : ['read'],
      });

    if (profileError) throw profileError;

    return authData;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;

    // Get user profile with company
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    return {
      user: profile,
      company: profile.company,
    };
  }

  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  }

  // =====================================================
  // PROJECTS
  // =====================================================

  async getProjects(companyId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        manager:users!projects_manager_id_fkey(id, name, email, avatar_url),
        assignments:project_assignments(
          user_id,
          role,
          user:users(id, name, email, avatar_url)
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Project[];
  }

  async getProject(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        manager:users!projects_manager_id_fkey(*),
        assignments:project_assignments(
          *,
          user:users(*)
        ),
        todos(*),
        time_entries(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createProject(project: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async updateProject(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // =====================================================
  // TODOS
  // =====================================================

  async getTodos(companyId: string, filters?: { projectId?: string; status?: string }) {
    let query = supabase
      .from('todos')
      .select(`
        *,
        assigned_to_user:users!todos_assigned_to_fkey(id, name, email, avatar_url),
        created_by_user:users!todos_created_by_fkey(id, name, email),
        project:projects(id, name)
      `)
      .eq('company_id', companyId);

    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Todo[];
  }

  async createTodo(todo: Partial<Todo>) {
    const { data, error } = await supabase
      .from('todos')
      .insert(todo)
      .select()
      .single();

    if (error) throw error;
    return data as Todo;
  }

  async updateTodo(id: string, updates: Partial<Todo>) {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Todo;
  }

  async deleteTodo(id: string) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // =====================================================
  // TIME ENTRIES
  // =====================================================

  async getTimeEntries(companyId: string, filters?: { userId?: string; projectId?: string; startDate?: string; endDate?: string }) {
    let query = supabase
      .from('time_entries')
      .select(`
        *,
        user:users(id, name, email, avatar_url),
        project:projects(id, name)
      `)
      .eq('company_id', companyId);

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data as TimeEntry[];
  }

  async createTimeEntry(entry: Partial<TimeEntry>) {
    const { data, error } = await supabase
      .from('time_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data as TimeEntry;
  }

  async updateTimeEntry(id: string, updates: Partial<TimeEntry>) {
    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as TimeEntry;
  }

  // =====================================================
  // USERS
  // =====================================================

  async getUsers(companyId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data as User[];
  }

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  // =====================================================
  // REALTIME SUBSCRIPTIONS
  // =====================================================

  subscribeToProjects(companyId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`projects:${companyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `company_id=eq.${companyId}`,
      }, callback)
      .subscribe();
  }

  subscribeToTodos(companyId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`todos:${companyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'todos',
        filter: `company_id=eq.${companyId}`,
      }, callback)
      .subscribe();
  }

  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, callback)
      .subscribe();
  }

  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }

  // =====================================================
  // STORAGE
  // =====================================================

  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    return data;
  }

  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();

// Export helper to check if using real database
export { isSupabaseConfigured };

