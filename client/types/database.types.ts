export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          role: 'normal_user' | 'super_admin' | 'cred_manager'
          approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string | null
          role?: 'normal_user' | 'super_admin' | 'cred_manager'
          approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: 'normal_user' | 'super_admin' | 'cred_manager'
          approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          title: string | null
          description: string | null
          location: string
          start_time: string
          end_time: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          location: string
          start_time: string
          end_time: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          location?: string
          start_time?: string
          end_time?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      responses: {
        Row: {
          id: string
          user_id: string
          session_id: string
          status: 'COMING' | 'NOT_COMING' | 'TENTATIVE'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          status: 'COMING' | 'NOT_COMING' | 'TENTATIVE'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          status?: 'COMING' | 'NOT_COMING' | 'TENTATIVE'
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          session_id: string
          user_id: string
          parent_comment_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          parent_comment_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          parent_comment_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_analytics: {
        Row: {
          id: string
          user_id: string
          session_id: string
          predicted_status: 'COMING' | 'NOT_COMING' | 'TENTATIVE'
          actual_attendance: boolean | null
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          predicted_status: 'COMING' | 'NOT_COMING' | 'TENTATIVE'
          actual_attendance?: boolean | null
          recorded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          predicted_status?: 'COMING' | 'NOT_COMING' | 'TENTATIVE'
          actual_attendance?: boolean | null
          recorded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'normal_user' | 'super_admin' | 'cred_manager'
      response_status: 'COMING' | 'NOT_COMING' | 'TENTATIVE'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}