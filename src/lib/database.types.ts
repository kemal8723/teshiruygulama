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
      equipment: {
        Row: {
          id: string
          name: string
          reference_image_url: string
          description: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          reference_image_url: string
          description: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          reference_image_url?: string
          description?: string
          created_at?: string | null
        }
      }
      stores: {
        Row: {
          id: string
          name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string | null
        }
      }
      submissions: {
        Row: {
          id: string
          store_id: string
          equipment_id: string
          uploaded_image_url: string | null
          uploaded_image_filename: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          store_id: string
          equipment_id: string
          uploaded_image_url?: string | null
          uploaded_image_filename?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          store_id?: string
          equipment_id?: string
          uploaded_image_url?: string | null
          uploaded_image_filename?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          submission_id: string
          manager_id: string
          manager_name: string
          is_correct: boolean
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          submission_id: string
          manager_id: string
          manager_name: string
          is_correct: boolean
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          submission_id?: string
          manager_id?: string
          manager_name?: string
          is_correct?: boolean
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
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
      [_ in never]: never
    }
  }
}