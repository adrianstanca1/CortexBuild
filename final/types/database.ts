// Generated types for Supabase database
// This file is generated from the database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          industry: string | null
          size: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          subscription_tier: string
          subscription_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          industry?: string | null
          size?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          subscription_tier?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          size?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          subscription_tier?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id: string | null
          email: string
          name: string
          role: string
          permissions: string[]
          avatar_url: string | null
          phone: string | null
          position: string | null
          department: string | null
          is_active: boolean
          last_login_at: string | null
          mfa_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_id?: string | null
          email: string
          name: string
          role?: string
          permissions?: string[]
          avatar_url?: string | null
          phone?: string | null
          position?: string | null
          department?: string | null
          is_active?: boolean
          last_login_at?: string | null
          mfa_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          email?: string
          name?: string
          role?: string
          permissions?: string[]
          avatar_url?: string | null
          phone?: string | null
          position?: string | null
          department?: string | null
          is_active?: boolean
          last_login_at?: string | null
          mfa_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          status: string
          priority: string
          start_date: string | null
          end_date: string | null
          budget: number | null
          spent: number
          address: string | null
          latitude: number | null
          longitude: number | null
          client_id: string | null
          manager_id: string | null
          progress: number
          health_status: string
          tags: string[] | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          status?: string
          priority?: string
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          spent?: number
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          client_id?: string | null
          manager_id?: string | null
          progress?: number
          health_status?: string
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          status?: string
          priority?: string
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          spent?: number
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          client_id?: string | null
          manager_id?: string | null
          progress?: number
          health_status?: string
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      project_assignments: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string | null
          assigned_at: string
          assigned_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: string | null
          assigned_at?: string
          assigned_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string | null
          assigned_at?: string
          assigned_by?: string | null
        }
      }
      todos: {
        Row: {
          id: string
          project_id: string | null
          company_id: string
          title: string
          description: string | null
          status: string
          priority: string
          assigned_to: string | null
          created_by: string | null
          due_date: string | null
          completed_at: string | null
          tags: string[] | null
          checklist: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          company_id: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          assigned_to?: string | null
          created_by?: string | null
          due_date?: string | null
          completed_at?: string | null
          tags?: string[] | null
          checklist?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          company_id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          assigned_to?: string | null
          created_by?: string | null
          due_date?: string | null
          completed_at?: string | null
          tags?: string[] | null
          checklist?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          project_id: string
          company_id: string
          date: string
          hours: number
          description: string | null
          task_type: string | null
          billable: boolean
          approved: boolean
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          company_id: string
          date: string
          hours: number
          description?: string | null
          task_type?: string | null
          billable?: boolean
          approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          company_id?: string
          date?: string
          hours?: number
          description?: string | null
          task_type?: string | null
          billable?: boolean
          approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add more table types as needed...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}


