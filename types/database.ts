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
      organisations: {
        Row: {
          id: string
          name: string
          slug: string
          abn: string | null
          phone: string | null
          email: string | null
          address: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          abn?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          abn?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          logo_url?: string | null
          updated_at?: string
        }
      }
      staff_profiles: {
        Row: {
          id: string
          organisation_id: string
          email: string
          full_name: string
          phone: string | null
          role: 'super_admin' | 'team_leader' | 'staff'
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organisation_id: string
          email: string
          full_name: string
          phone?: string | null
          role: 'super_admin' | 'team_leader' | 'staff'
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          organisation_id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'super_admin' | 'team_leader' | 'staff'
          avatar_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      houses: {
        Row: {
          id: string
          organisation_id: string
          name: string
          address: string | null
          phone: string | null
          capacity: number | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          name: string
          address?: string | null
          phone?: string | null
          capacity?: number | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          address?: string | null
          phone?: string | null
          capacity?: number | null
          notes?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          organisation_id: string
          house_id: string | null
          full_name: string
          date_of_birth: string | null
          ndis_number: string | null
          phone: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          house_id?: string | null
          full_name: string
          date_of_birth?: string | null
          ndis_number?: string | null
          phone?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          house_id?: string | null
          full_name?: string
          date_of_birth?: string | null
          ndis_number?: string | null
          phone?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          notes?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      shifts: {
        Row: {
          id: string
          organisation_id: string
          house_id: string
          date: string
          start_time: string
          end_time: string
          status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          house_id: string
          date: string
          start_time: string
          end_time: string
          status?: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          house_id?: string
          date?: string
          start_time?: string
          end_time?: string
          status?: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          updated_at?: string
        }
      }
      shift_assignments: {
        Row: {
          id: string
          organisation_id: string
          shift_id: string
          staff_id: string
          status: 'pending' | 'accepted' | 'declined' | 'completed' | 'no_show'
          assigned_by: string
          responded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          shift_id: string
          staff_id: string
          status?: 'pending' | 'accepted' | 'declined' | 'completed' | 'no_show'
          assigned_by: string
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'accepted' | 'declined' | 'completed' | 'no_show'
          responded_at?: string | null
          updated_at?: string
        }
      }
      case_notes: {
        Row: {
          id: string
          organisation_id: string
          participant_id: string
          shift_id: string | null
          house_id: string | null
          author_id: string
          content: string
          category: 'general' | 'health' | 'behaviour' | 'medication' | 'activity' | 'other' | null
          is_flagged: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          participant_id: string
          shift_id?: string | null
          house_id?: string | null
          author_id: string
          content: string
          category?: 'general' | 'health' | 'behaviour' | 'medication' | 'activity' | 'other' | null
          is_flagged?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          category?: 'general' | 'health' | 'behaviour' | 'medication' | 'activity' | 'other' | null
          is_flagged?: boolean
          updated_at?: string
        }
      }
      case_note_attachments: {
        Row: {
          id: string
          organisation_id: string
          case_note_id: string
          file_name: string
          file_path: string
          file_type: string | null
          file_size: number | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          case_note_id: string
          file_name: string
          file_path: string
          file_type?: string | null
          file_size?: number | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          file_name?: string
          file_path?: string
        }
      }
      incidents: {
        Row: {
          id: string
          organisation_id: string
          house_id: string | null
          participant_id: string | null
          reported_by: string
          title: string
          description: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'open' | 'under_review' | 'resolved' | 'closed'
          occurred_at: string
          resolved_at: string | null
          resolution_notes: string | null
          reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          house_id?: string | null
          participant_id?: string | null
          reported_by: string
          title: string
          description: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          status?: 'open' | 'under_review' | 'resolved' | 'closed'
          occurred_at: string
          resolved_at?: string | null
          resolution_notes?: string | null
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'open' | 'under_review' | 'resolved' | 'closed'
          resolved_at?: string | null
          resolution_notes?: string | null
          reviewed_by?: string | null
          updated_at?: string
        }
      }
      incident_attachments: {
        Row: {
          id: string
          organisation_id: string
          incident_id: string
          file_name: string
          file_path: string
          file_type: string | null
          file_size: number | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          incident_id: string
          file_name: string
          file_path: string
          file_type?: string | null
          file_size?: number | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          file_name?: string
          file_path?: string
        }
      }
      notifications: {
        Row: {
          id: string
          organisation_id: string
          user_id: string
          title: string
          body: string | null
          type: 'shift_assigned' | 'shift_updated' | 'shift_reminder' | 'case_note_flagged' | 'incident_created' | 'general'
          reference_type: string | null
          reference_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          user_id: string
          title: string
          body?: string | null
          type: 'shift_assigned' | 'shift_updated' | 'shift_reminder' | 'case_note_flagged' | 'incident_created' | 'general'
          reference_type?: string | null
          reference_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }
      audit_logs: {
        Row: {
          id: string
          organisation_id: string
          user_id: string
          action_type: string
          entity_type: string
          entity_id: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          user_id: string
          action_type: string
          entity_type: string
          entity_id: string
          metadata?: Json | null
          created_at?: string
        }
        Update: never
      }
      staff_availability: {
        Row: {
          id: string
          organisation_id: string
          staff_id: string
          date: string
          is_available: boolean
          start_time: string | null
          end_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          staff_id: string
          date: string
          is_available?: boolean
          start_time?: string | null
          end_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          is_available?: boolean
          start_time?: string | null
          end_time?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      shift_broadcasts: {
        Row: {
          id: string
          organisation_id: string
          shift_id: string
          created_by: string
          message: string | null
          status: 'open' | 'filled' | 'cancelled'
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          shift_id: string
          created_by: string
          message?: string | null
          status?: 'open' | 'filled' | 'cancelled'
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          message?: string | null
          status?: 'open' | 'filled' | 'cancelled'
          expires_at?: string | null
          updated_at?: string
        }
      }
      shift_broadcast_responses: {
        Row: {
          id: string
          organisation_id: string
          broadcast_id: string
          staff_id: string
          status: 'interested' | 'accepted' | 'rejected'
          responded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          broadcast_id: string
          staff_id: string
          status?: 'interested' | 'accepted' | 'rejected'
          responded_at?: string
          created_at?: string
        }
        Update: {
          status?: 'interested' | 'accepted' | 'rejected'
        }
      }
      shift_summaries: {
        Row: {
          id: string
          organisation_id: string
          shift_id: string
          summary: string
          generated_at: string
          generated_by: string | null
          is_approved: boolean
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          shift_id: string
          summary: string
          generated_at?: string
          generated_by?: string | null
          is_approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          summary?: string
          is_approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organisation_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
