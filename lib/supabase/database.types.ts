/**
 * Supabase Database Types
 * Auto-generated from schema
 */

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
          address: string | null
          city: string | null
          country: string | null
          postal_code: string | null
          tax_id: string | null
          registration_number: string | null
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          tax_id?: string | null
          registration_number?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          tax_id?: string | null
          registration_number?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          phone: string | null
          avatar_url: string | null
          role: string
          company_id: string | null
          is_active: boolean
          last_login: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          name: string
          phone?: string | null
          avatar_url?: string | null
          role?: string
          company_id?: string | null
          is_active?: boolean
          last_login?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: string
          company_id?: string | null
          is_active?: boolean
          last_login?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          company_id: string
          name: string
          email: string | null
          phone: string | null
          company_name: string | null
          address: string | null
          city: string | null
          country: string | null
          postal_code: string | null
          type: string | null
          status: string
          tax_id: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          type?: string | null
          status?: string
          tax_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          type?: string | null
          status?: string
          tax_id?: string | null
          notes?: string | null
          created_by?: string | null
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
          client_id: string | null
          type: string | null
          status: string
          priority: string
          budget: number | null
          spent: number
          progress: number
          start_date: string | null
          end_date: string | null
          actual_end_date: string | null
          location: string | null
          address: string | null
          city: string | null
          country: string | null
          postal_code: string | null
          manager_id: string | null
          team_size: number
          notes: string | null
          metadata: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          client_id?: string | null
          type?: string | null
          status?: string
          priority?: string
          budget?: number | null
          spent?: number
          progress?: number
          start_date?: string | null
          end_date?: string | null
          actual_end_date?: string | null
          location?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          manager_id?: string | null
          team_size?: number
          notes?: string | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          client_id?: string | null
          type?: string | null
          status?: string
          priority?: string
          budget?: number | null
          spent?: number
          progress?: number
          start_date?: string | null
          end_date?: string | null
          actual_end_date?: string | null
          location?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          manager_id?: string | null
          team_size?: number
          notes?: string | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed...
    }
    Views: {
      project_summary: {
        Row: {
          id: string
          name: string
          status: string
          priority: string
          budget: number | null
          spent: number
          progress: number
          start_date: string | null
          end_date: string | null
          client_name: string | null
          manager_name: string | null
          time_entries_count: number
          total_hours: number
          rfis_count: number
          invoices_count: number
          paid_amount: number
        }
      }
    }
    Functions: {
      set_company_context: {
        Args: { company_id: string }
        Returns: void
      }
    }
  }
}

