/**
 * Marketplace Apps Service
 * Service layer for all 6 pre-installed marketplace apps data persistence
 */

import { supabase } from '../supabase/client';

// ============================================================================
// TODO LIST SERVICE
// ============================================================================

export interface Todo {
    id: string;
    user_id: string;
    text: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

export const todoService = {
    async getAll(userId: string): Promise<Todo[]> {
        const { data, error } = await supabase
            .from('app_todos')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    },

    async create(userId: string, text: string): Promise<Todo> {
        const { data, error } = await supabase
            .from('app_todos')
            .insert({ user_id: userId, text })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<Todo>): Promise<Todo> {
        const { data, error } = await supabase
            .from('app_todos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('app_todos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
};

// ============================================================================
// EXPENSE TRACKER SERVICE
// ============================================================================

export interface Transaction {
    id: string;
    user_id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    created_at: string;
    updated_at: string;
}

export const expenseService = {
    async getAll(userId: string): Promise<Transaction[]> {
        const { data, error } = await supabase
            .from('app_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        
        if (error) throw error;
        return data || [];
    },

    async create(userId: string, transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
        const { data, error } = await supabase
            .from('app_transactions')
            .insert({ user_id: userId, ...transaction })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('app_transactions')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
};

// ============================================================================
// POMODORO TIMER SERVICE
// ============================================================================

export interface PomodoroSession {
    id: string;
    user_id: string;
    duration_minutes: number;
    type: 'work' | 'break';
    completed: boolean;
    started_at: string;
    completed_at?: string;
    created_at: string;
}

export const pomodoroService = {
    async getAll(userId: string): Promise<PomodoroSession[]> {
        const { data, error } = await supabase
            .from('app_pomodoro_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('started_at', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        return data || [];
    },

    async create(userId: string, session: Omit<PomodoroSession, 'id' | 'user_id' | 'created_at'>): Promise<PomodoroSession> {
        const { data, error } = await supabase
            .from('app_pomodoro_sessions')
            .insert({ user_id: userId, ...session })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async complete(id: string): Promise<PomodoroSession> {
        const { data, error } = await supabase
            .from('app_pomodoro_sessions')
            .update({ completed: true, completed_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async getStats(userId: string): Promise<{ total: number; today: number; thisWeek: number }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data, error } = await supabase
            .from('app_pomodoro_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('completed', true);
        
        if (error) throw error;

        const sessions = data || [];
        return {
            total: sessions.length,
            today: sessions.filter(s => new Date(s.started_at) >= today).length,
            thisWeek: sessions.filter(s => new Date(s.started_at) >= weekAgo).length
        };
    }
};

// ============================================================================
// NOTES SERVICE
// ============================================================================

export interface Note {
    id: string;
    user_id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export const notesService = {
    async getAll(userId: string): Promise<Note[]> {
        const { data, error } = await supabase
            .from('app_notes')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    },

    async create(userId: string, note: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Note> {
        const { data, error } = await supabase
            .from('app_notes')
            .insert({ user_id: userId, ...note })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<Note>): Promise<Note> {
        const { data, error } = await supabase
            .from('app_notes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('app_notes')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
};

// ============================================================================
// HABIT TRACKER SERVICE
// ============================================================================

export interface Habit {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    color: string;
    streak: number;
    total_completed: number;
    created_at: string;
    updated_at: string;
}

export interface HabitCompletion {
    id: string;
    habit_id: string;
    user_id: string;
    completed_date: string;
    created_at: string;
}

export const habitService = {
    async getAll(userId: string): Promise<Habit[]> {
        const { data, error } = await supabase
            .from('app_habits')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        return data || [];
    },

    async create(userId: string, habit: Omit<Habit, 'id' | 'user_id' | 'streak' | 'total_completed' | 'created_at' | 'updated_at'>): Promise<Habit> {
        const { data, error } = await supabase
            .from('app_habits')
            .insert({ user_id: userId, ...habit })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('app_habits')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    },

    async toggleCompletion(habitId: string, userId: string, date: string): Promise<boolean> {
        // Check if already completed
        const { data: existing } = await supabase
            .from('app_habit_completions')
            .select('*')
            .eq('habit_id', habitId)
            .eq('completed_date', date)
            .single();

        if (existing) {
            // Remove completion
            await supabase
                .from('app_habit_completions')
                .delete()
                .eq('id', existing.id);
            return false;
        } else {
            // Add completion
            await supabase
                .from('app_habit_completions')
                .insert({ habit_id: habitId, user_id: userId, completed_date: date });
            return true;
        }
    }
};

// ============================================================================
// SITE INSPECTION SERVICE
// ============================================================================

export const siteInspectionService = {
    async getAll(userId: string) {
        const { data, error } = await supabase
            .from('site_inspections')
            .select(`
                *,
                site_photos(*),
                inspection_checklist_items(*)
            `)
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async create(userId: string, location: string, weather: string, temperature: string, notes: string, latitude?: number, longitude?: number) {
        const { data, error } = await supabase
            .from('site_inspections')
            .insert({
                user_id: userId,
                location,
                weather,
                temperature,
                notes,
                latitude,
                longitude
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(inspectionId: string, updates: any) {
        const { data, error } = await supabase
            .from('site_inspections')
            .update(updates)
            .eq('id', inspectionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(inspectionId: string) {
        const { error } = await supabase
            .from('site_inspections')
            .delete()
            .eq('id', inspectionId);

        if (error) throw error;
    },

    async addPhoto(inspectionId: string, userId: string, url: string, caption: string, latitude?: number, longitude?: number) {
        const { data, error } = await supabase
            .from('site_photos')
            .insert({
                inspection_id: inspectionId,
                user_id: userId,
                url,
                caption,
                latitude,
                longitude
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deletePhoto(photoId: string) {
        const { error } = await supabase
            .from('site_photos')
            .delete()
            .eq('id', photoId);

        if (error) throw error;
    },

    async addChecklistItem(inspectionId: string, task: string, notes: string = '') {
        const { data, error } = await supabase
            .from('inspection_checklist_items')
            .insert({ inspection_id: inspectionId, task, notes })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async toggleChecklistItem(itemId: string, completed: boolean) {
        const { data, error } = await supabase
            .from('inspection_checklist_items')
            .update({ completed })
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteChecklistItem(itemId: string) {
        const { error } = await supabase
            .from('inspection_checklist_items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;
    }
};
