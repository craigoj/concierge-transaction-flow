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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_invitations: {
        Row: {
          accepted_at: string | null
          agent_id: string
          created_at: string
          email: string
          id: string
          invitation_token: string
          invited_at: string
          invited_by: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          agent_id: string
          created_at?: string
          email: string
          id?: string
          invitation_token: string
          invited_at?: string
          invited_by: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          agent_id?: string
          created_at?: string
          email?: string
          id?: string
          invitation_token?: string
          invited_at?: string
          invited_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_invitations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          template_id: string
          trigger_condition: Json | null
          trigger_event: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          template_id: string
          trigger_condition?: Json | null
          trigger_event: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          template_id?: string
          trigger_condition?: Json | null
          trigger_event?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          calendar_integration_id: string
          created_at: string
          description: string | null
          event_date: string
          event_type: string
          external_event_id: string
          id: string
          title: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          calendar_integration_id: string
          created_at?: string
          description?: string | null
          event_date: string
          event_type: string
          external_event_id: string
          id?: string
          title: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          calendar_integration_id?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: string
          external_event_id?: string
          id?: string
          title?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_calendar_integration_id_fkey"
            columns: ["calendar_integration_id"]
            isOneToOne: false
            referencedRelation: "calendar_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          access_token: string
          calendar_id: string | null
          created_at: string
          id: string
          is_active: boolean
          provider: string
          refresh_token: string
          token_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          refresh_token: string
          token_expires_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          refresh_token?: string
          token_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          preferred_contact_method: string | null
          referral_source: string | null
          transaction_id: string
          type: Database["public"]["Enums"]["client_type"]
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          referral_source?: string | null
          transaction_id: string
          type: Database["public"]["Enums"]["client_type"]
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          referral_source?: string | null
          transaction_id?: string
          type?: Database["public"]["Enums"]["client_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          communication_type: string
          contact_id: string
          contact_type: string
          content: string
          created_at: string
          direction: string
          id: string
          subject: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          communication_type: string
          contact_id: string
          contact_type: string
          content: string
          created_at?: string
          direction: string
          id?: string
          subject?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          communication_type?: string
          contact_id?: string
          contact_type?: string
          content?: string
          created_at?: string
          direction?: string
          id?: string
          subject?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_preferences: {
        Row: {
          contact_id: string
          contact_type: string
          created_at: string
          frequency: string | null
          id: string
          notes: string | null
          preferred_method: string
          preferred_time: string | null
          updated_at: string
        }
        Insert: {
          contact_id: string
          contact_type: string
          created_at?: string
          frequency?: string | null
          id?: string
          notes?: string | null
          preferred_method: string
          preferred_time?: string | null
          updated_at?: string
        }
        Update: {
          contact_id?: string
          contact_type?: string
          created_at?: string
          frequency?: string | null
          id?: string
          notes?: string | null
          preferred_method?: string
          preferred_time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      communications: {
        Row: {
          content: string
          created_at: string
          id: string
          recipient_id: string
          sender_id: string
          sent_at: string
          status: string
          subject: string | null
          transaction_id: string | null
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recipient_id: string
          sender_id: string
          sent_at?: string
          status?: string
          subject?: string | null
          transaction_id?: string | null
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipient_id?: string
          sender_id?: string
          sent_at?: string
          status?: string
          subject?: string | null
          transaction_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          auto_prospect: boolean
          category: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          rating: Database["public"]["Enums"]["contact_rating"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_prospect?: boolean
          category?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          rating?: Database["public"]["Enums"]["contact_rating"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_prospect?: boolean
          category?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          rating?: Database["public"]["Enums"]["contact_rating"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          e_sign_provider: string | null
          e_sign_request_id: string | null
          e_sign_status: string | null
          file_name: string
          file_path: string
          id: string
          is_agent_visible: boolean | null
          transaction_id: string
          uploaded_by_id: string
        }
        Insert: {
          created_at?: string
          e_sign_provider?: string | null
          e_sign_request_id?: string | null
          e_sign_status?: string | null
          file_name: string
          file_path: string
          id?: string
          is_agent_visible?: boolean | null
          transaction_id: string
          uploaded_by_id: string
        }
        Update: {
          created_at?: string
          e_sign_provider?: string | null
          e_sign_request_id?: string | null
          e_sign_status?: string | null
          file_name?: string
          file_path?: string
          id?: string
          is_agent_visible?: boolean | null
          transaction_id?: string
          uploaded_by_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_id_fkey"
            columns: ["uploaded_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          category: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          body_html: string
          category?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          category?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          communication_alerts: boolean
          created_at: string
          email_notifications: boolean
          id: string
          push_notifications: boolean
          sms_notifications: boolean
          status_updates: boolean
          task_reminders: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          communication_alerts?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          push_notifications?: boolean
          sms_notifications?: boolean
          status_updates?: boolean
          task_reminders?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          communication_alerts?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          push_notifications?: boolean
          sms_notifications?: boolean
          status_updates?: boolean
          task_reminders?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          transaction_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          brokerage: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          invitation_status: string | null
          invitation_token: string | null
          invited_at: string | null
          invited_by: string | null
          last_name: string | null
          license_number: string | null
          onboarding_completed_at: string | null
          phone_number: string | null
          profile_image_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          specialties: string[] | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          brokerage?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          invitation_status?: string | null
          invitation_token?: string | null
          invited_at?: string | null
          invited_by?: string | null
          last_name?: string | null
          license_number?: string | null
          onboarding_completed_at?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialties?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          brokerage?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          invitation_status?: string | null
          invitation_token?: string | null
          invited_at?: string | null
          invited_by?: string | null
          last_name?: string | null
          license_number?: string | null
          onboarding_completed_at?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialties?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          service_tier: string | null
          tasks: Json
          transaction_type: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          service_tier?: string | null
          tasks: Json
          transaction_type?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          service_tier?: string | null
          tasks?: Json
          transaction_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          agent_action_prompt: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean
          priority: Database["public"]["Enums"]["task_priority"]
          requires_agent_action: boolean | null
          title: string
          transaction_id: string
        }
        Insert: {
          agent_action_prompt?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          priority?: Database["public"]["Enums"]["task_priority"]
          requires_agent_action?: boolean | null
          title: string
          transaction_id: string
        }
        Update: {
          agent_action_prompt?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          priority?: Database["public"]["Enums"]["task_priority"]
          requires_agent_action?: boolean | null
          title?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          agent_id: string
          city: string
          closing_date: string | null
          commission_rate: number | null
          created_at: string
          id: string
          property_address: string
          purchase_price: number | null
          service_tier: Database["public"]["Enums"]["service_tier_type"] | null
          state: string
          status: Database["public"]["Enums"]["transaction_status"]
          transaction_type:
            | Database["public"]["Enums"]["transaction_type_enum"]
            | null
          updated_at: string
          zip_code: string
        }
        Insert: {
          agent_id: string
          city: string
          closing_date?: string | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          property_address: string
          purchase_price?: number | null
          service_tier?: Database["public"]["Enums"]["service_tier_type"] | null
          state: string
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_type?:
            | Database["public"]["Enums"]["transaction_type_enum"]
            | null
          updated_at?: string
          zip_code: string
        }
        Update: {
          agent_id?: string
          city?: string
          closing_date?: string | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          property_address?: string
          purchase_price?: number | null
          service_tier?: Database["public"]["Enums"]["service_tier_type"] | null
          state?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_type?:
            | Database["public"]["Enums"]["transaction_type_enum"]
            | null
          updated_at?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          error_message: string | null
          executed_at: string
          id: string
          metadata: Json | null
          rule_id: string
          status: string
          transaction_id: string
        }
        Insert: {
          error_message?: string | null
          executed_at?: string
          id?: string
          metadata?: Json | null
          rule_id: string
          status?: string
          transaction_id: string
        }
        Update: {
          error_message?: string | null
          executed_at?: string
          id?: string
          metadata?: Json | null
          rule_id?: string
          status?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_instances: {
        Row: {
          applied_at: string
          applied_by: string
          id: string
          metadata: Json | null
          status: string
          template_id: string
          transaction_id: string
        }
        Insert: {
          applied_at?: string
          applied_by: string
          id?: string
          metadata?: Json | null
          status?: string
          template_id: string
          transaction_id: string
        }
        Update: {
          applied_at?: string
          applied_by?: string
          id?: string
          metadata?: Json | null
          status?: string
          template_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_workflow_instances_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_workflow_instances_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_task_template: {
        Args: {
          p_transaction_id: string
          p_template_id: string
          p_applied_by?: string
        }
        Returns: string
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role: {
        Args: { user_id?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      client_type: "buyer" | "seller"
      contact_rating: "A" | "B" | "C" | "D"
      service_tier_type:
        | "buyer_core"
        | "buyer_elite"
        | "white_glove_buyer"
        | "listing_core"
        | "listing_elite"
        | "white_glove_listing"
      task_priority: "low" | "medium" | "high"
      transaction_status: "intake" | "active" | "closed" | "cancelled"
      transaction_type_enum: "buyer" | "seller" | "dual"
      user_role: "agent" | "coordinator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      client_type: ["buyer", "seller"],
      contact_rating: ["A", "B", "C", "D"],
      service_tier_type: [
        "buyer_core",
        "buyer_elite",
        "white_glove_buyer",
        "listing_core",
        "listing_elite",
        "white_glove_listing",
      ],
      task_priority: ["low", "medium", "high"],
      transaction_status: ["intake", "active", "closed", "cancelled"],
      transaction_type_enum: ["buyer", "seller", "dual"],
      user_role: ["agent", "coordinator"],
    },
  },
} as const
