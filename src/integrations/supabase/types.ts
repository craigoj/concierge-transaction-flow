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
      account_lockouts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          locked_at: string
          locked_by: string
          metadata: Json | null
          reason: string | null
          unlock_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          locked_at?: string
          locked_by: string
          metadata?: Json | null
          reason?: string | null
          unlock_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          locked_at?: string
          locked_by?: string
          metadata?: Json | null
          reason?: string | null
          unlock_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      agent_branding: {
        Row: {
          agent_id: string
          birthday: string | null
          canva_template_url: string | null
          created_at: string
          drinks_alcohol: boolean | null
          drinks_coffee: boolean | null
          favorite_color: string | null
          has_branded_sign: string | null
          has_canva_template: string | null
          id: string
          review_link: string
          sign_notes: string | null
          social_media_permission: boolean | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          birthday?: string | null
          canva_template_url?: string | null
          created_at?: string
          drinks_alcohol?: boolean | null
          drinks_coffee?: boolean | null
          favorite_color?: string | null
          has_branded_sign?: string | null
          has_canva_template?: string | null
          id?: string
          review_link: string
          sign_notes?: string | null
          social_media_permission?: boolean | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          birthday?: string | null
          canva_template_url?: string | null
          created_at?: string
          drinks_alcohol?: boolean | null
          drinks_coffee?: boolean | null
          favorite_color?: string | null
          has_branded_sign?: string | null
          has_canva_template?: string | null
          id?: string
          review_link?: string
          sign_notes?: string | null
          social_media_permission?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      agent_intake_sessions: {
        Row: {
          agent_id: string
          branding_data: Json | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          id: string
          status: string
          updated_at: string
          vendor_data: Json | null
        }
        Insert: {
          agent_id: string
          branding_data?: Json | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          vendor_data?: Json | null
        }
        Update: {
          agent_id?: string
          branding_data?: Json | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          vendor_data?: Json | null
        }
        Relationships: []
      }
      agent_invitations: {
        Row: {
          accepted_at: string | null
          admin_notes: string | null
          agent_id: string
          created_at: string
          creation_method: string | null
          email: string
          expires_at: string | null
          id: string
          invitation_token: string
          invited_at: string
          invited_by: string
          setup_link_token: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          admin_notes?: string | null
          agent_id: string
          created_at?: string
          creation_method?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invitation_token: string
          invited_at?: string
          invited_by: string
          setup_link_token?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          admin_notes?: string | null
          agent_id?: string
          created_at?: string
          creation_method?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invitation_token?: string
          invited_at?: string
          invited_by?: string
          setup_link_token?: string | null
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
      agent_profile_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          template_data?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      agent_vendors: {
        Row: {
          address: string | null
          agent_id: string
          company_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_primary: boolean
          notes: string | null
          phone: string | null
          updated_at: string
          vendor_type: string
        }
        Insert: {
          address?: string | null
          agent_id: string
          company_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          notes?: string | null
          phone?: string | null
          updated_at?: string
          vendor_type: string
        }
        Update: {
          address?: string | null
          agent_id?: string
          company_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          notes?: string | null
          phone?: string | null
          updated_at?: string
          vendor_type?: string
        }
        Relationships: []
      }
      automation_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          error_message: string | null
          execution_id: string
          id: string
          status: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          execution_id: string
          id?: string
          status: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          execution_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_audit_logs_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
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
      communication_history: {
        Row: {
          clicked_at: string | null
          communication_type: string
          content: string
          delivered_at: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_id: string
          sent_at: string
          status: string
          subject: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          communication_type: string
          content: string
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_id: string
          sent_at?: string
          status?: string
          subject?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          communication_type?: string
          content?: string
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_id?: string
          sent_at?: string
          status?: string
          subject?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: []
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
      communication_settings: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          notification_types: Json
          sms_enabled: boolean
          template_preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          notification_types?: Json
          sms_enabled?: boolean
          template_preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          notification_types?: Json
          sms_enabled?: boolean
          template_preferences?: Json
          updated_at?: string
          user_id?: string
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
      duplicate_detection_logs: {
        Row: {
          created_at: string
          detection_method: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          potential_duplicate_id: string
          resolved_at: string | null
          resolved_by: string | null
          similarity_score: number
          status: string
        }
        Insert: {
          created_at?: string
          detection_method: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          potential_duplicate_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          similarity_score?: number
          status?: string
        }
        Update: {
          created_at?: string
          detection_method?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          potential_duplicate_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          similarity_score?: number
          status?: string
        }
        Relationships: []
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
      enhanced_activity_logs: {
        Row: {
          action: string
          category: string
          created_at: string
          description: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          target_user_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          category?: string
          created_at?: string
          description: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          category?: string
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      enhanced_email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          category: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          subject: string
          template_type: string
          updated_at: string
          variables: Json
        }
        Insert: {
          body_html: string
          body_text?: string | null
          category?: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          subject: string
          template_type?: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          body_html?: string
          body_text?: string | null
          category?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string
          variables?: Json
        }
        Relationships: []
      }
      imported_email_templates: {
        Row: {
          created_at: string | null
          email_bcc: string | null
          email_cc: string | null
          email_template_id: string
          email_to: string | null
          folder_name: string | null
          id: string
          import_id: string | null
          is_system_template: boolean | null
          original_xml_id: string | null
          template_type: string | null
        }
        Insert: {
          created_at?: string | null
          email_bcc?: string | null
          email_cc?: string | null
          email_template_id: string
          email_to?: string | null
          folder_name?: string | null
          id?: string
          import_id?: string | null
          is_system_template?: boolean | null
          original_xml_id?: string | null
          template_type?: string | null
        }
        Update: {
          created_at?: string | null
          email_bcc?: string | null
          email_cc?: string | null
          email_template_id?: string
          email_to?: string | null
          folder_name?: string | null
          id?: string
          import_id?: string | null
          is_system_template?: boolean | null
          original_xml_id?: string | null
          template_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imported_email_templates_email_template_id_fkey"
            columns: ["email_template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_email_templates_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "xml_template_imports"
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
      offer_requests: {
        Row: {
          agent_id: string
          buyer_contacts: Json
          buyer_names: string
          closing_cost_assistance: string | null
          created_at: string
          emd_amount: number
          exchange_fee: number
          extras: string | null
          fica_details: Json | null
          id: string
          lead_eifs_survey: string | null
          lending_company: string
          loan_type: string
          occupancy_notes: string | null
          projected_closing_date: string
          property_address: string
          purchase_price: number
          settlement_company: string
          status: string
          transaction_id: string | null
          updated_at: string
          wdi_inspection_details: Json | null
        }
        Insert: {
          agent_id: string
          buyer_contacts?: Json
          buyer_names: string
          closing_cost_assistance?: string | null
          created_at?: string
          emd_amount: number
          exchange_fee: number
          extras?: string | null
          fica_details?: Json | null
          id?: string
          lead_eifs_survey?: string | null
          lending_company: string
          loan_type: string
          occupancy_notes?: string | null
          projected_closing_date: string
          property_address: string
          purchase_price: number
          settlement_company: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          wdi_inspection_details?: Json | null
        }
        Update: {
          agent_id?: string
          buyer_contacts?: Json
          buyer_names?: string
          closing_cost_assistance?: string | null
          created_at?: string
          emd_amount?: number
          exchange_fee?: number
          extras?: string | null
          fica_details?: Json | null
          id?: string
          lead_eifs_survey?: string | null
          lending_company?: string
          loan_type?: string
          occupancy_notes?: string | null
          projected_closing_date?: string
          property_address?: string
          purchase_price?: number
          settlement_company?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          wdi_inspection_details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_requests_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_activated: boolean | null
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
          manual_setup: boolean | null
          onboarding_completed_at: string | null
          onboarding_method: string | null
          phone_number: string | null
          profile_image_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          setup_method: string | null
          specialties: string[] | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          admin_activated?: boolean | null
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
          manual_setup?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_method?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          setup_method?: string | null
          specialties?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          admin_activated?: boolean | null
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
          manual_setup?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_method?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          setup_method?: string | null
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
      template_tasks: {
        Row: {
          auto_fill_with_role: string | null
          buyer_seller_visible: boolean | null
          color: string | null
          created_at: string
          description_notes: string | null
          due_date_rule: Json
          due_time_minutes: number | null
          email_template_id: string | null
          expense: number | null
          id: string
          is_agent_visible: boolean
          is_milestone: boolean | null
          is_on_calendar: boolean | null
          is_prospecting: boolean | null
          is_recurring: boolean | null
          phase: string | null
          recurring_count: number | null
          recurring_day_of_month: number | null
          recurring_day_of_week: number | null
          recurring_frequency: string | null
          recurring_month_of_year: number | null
          recurring_separation_count: number | null
          reminder_delta: number | null
          reminder_set: boolean | null
          reminder_time_minutes: number | null
          sort_order: number
          subject: string
          task_type: string | null
          template_id: string
          updated_at: string
          xaction_side_buyer: boolean | null
          xaction_side_dual: boolean | null
          xaction_side_seller: boolean | null
        }
        Insert: {
          auto_fill_with_role?: string | null
          buyer_seller_visible?: boolean | null
          color?: string | null
          created_at?: string
          description_notes?: string | null
          due_date_rule: Json
          due_time_minutes?: number | null
          email_template_id?: string | null
          expense?: number | null
          id?: string
          is_agent_visible?: boolean
          is_milestone?: boolean | null
          is_on_calendar?: boolean | null
          is_prospecting?: boolean | null
          is_recurring?: boolean | null
          phase?: string | null
          recurring_count?: number | null
          recurring_day_of_month?: number | null
          recurring_day_of_week?: number | null
          recurring_frequency?: string | null
          recurring_month_of_year?: number | null
          recurring_separation_count?: number | null
          reminder_delta?: number | null
          reminder_set?: boolean | null
          reminder_time_minutes?: number | null
          sort_order?: number
          subject: string
          task_type?: string | null
          template_id: string
          updated_at?: string
          xaction_side_buyer?: boolean | null
          xaction_side_dual?: boolean | null
          xaction_side_seller?: boolean | null
        }
        Update: {
          auto_fill_with_role?: string | null
          buyer_seller_visible?: boolean | null
          color?: string | null
          created_at?: string
          description_notes?: string | null
          due_date_rule?: Json
          due_time_minutes?: number | null
          email_template_id?: string | null
          expense?: number | null
          id?: string
          is_agent_visible?: boolean
          is_milestone?: boolean | null
          is_on_calendar?: boolean | null
          is_prospecting?: boolean | null
          is_recurring?: boolean | null
          phase?: string | null
          recurring_count?: number | null
          recurring_day_of_month?: number | null
          recurring_day_of_week?: number | null
          recurring_frequency?: string | null
          recurring_month_of_year?: number | null
          recurring_separation_count?: number | null
          reminder_delta?: number | null
          reminder_set?: boolean | null
          reminder_time_minutes?: number | null
          sort_order?: number
          subject?: string
          task_type?: string | null
          template_id?: string
          updated_at?: string
          xaction_side_buyer?: boolean | null
          xaction_side_dual?: boolean | null
          xaction_side_seller?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "template_tasks_email_template_id_fkey"
            columns: ["email_template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
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
      temporary_passwords: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          is_active: boolean
          password_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          is_active?: boolean
          password_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          password_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transaction_service_details: {
        Row: {
          add_ons: Json | null
          base_service_fee: number
          created_at: string
          id: string
          selected_features: Json
          total_service_cost: number
          transaction_id: string
          updated_at: string
        }
        Insert: {
          add_ons?: Json | null
          base_service_fee?: number
          created_at?: string
          id?: string
          selected_features?: Json
          total_service_cost?: number
          transaction_id: string
          updated_at?: string
        }
        Update: {
          add_ons?: Json | null
          base_service_fee?: number
          created_at?: string
          id?: string
          selected_features?: Json
          total_service_cost?: number
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_service_details_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          template_data?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
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
          completed_at: string | null
          error_message: string | null
          executed_at: string
          id: string
          metadata: Json | null
          retry_count: number | null
          rule_id: string
          status: string
          transaction_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          executed_at?: string
          id?: string
          metadata?: Json | null
          retry_count?: number | null
          rule_id: string
          status?: string
          transaction_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          executed_at?: string
          id?: string
          metadata?: Json | null
          retry_count?: number | null
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
      workflow_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      xml_template_imports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          emails_imported: number | null
          error_message: string | null
          filename: string
          id: string
          import_status: string | null
          imported_by: string
          metadata: Json | null
          tasks_imported: number | null
          templates_imported: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          emails_imported?: number | null
          error_message?: string | null
          filename: string
          id?: string
          import_status?: string | null
          imported_by: string
          metadata?: Json | null
          tasks_imported?: number | null
          templates_imported?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          emails_imported?: number | null
          error_message?: string | null
          filename?: string
          id?: string
          import_status?: string | null
          imported_by?: string
          metadata?: Json | null
          tasks_imported?: number | null
          templates_imported?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "xml_template_imports_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      apply_workflow_template: {
        Args: {
          p_transaction_id: string
          p_template_id: string
          p_applied_by?: string
        }
        Returns: string
      }
      bulk_update_agent_status: {
        Args: {
          p_agent_ids: string[]
          p_new_status: string
          p_updated_by?: string
        }
        Returns: number
      }
      bulk_update_transaction_status: {
        Args: {
          transaction_ids: string[]
          new_status: Database["public"]["Enums"]["transaction_status"]
          updated_by?: string
        }
        Returns: number
      }
      create_manual_agent: {
        Args: {
          p_email: string
          p_first_name: string
          p_last_name: string
          p_phone?: string
          p_brokerage?: string
          p_password?: string
          p_created_by?: string
        }
        Returns: Json
      }
      detect_property_duplicates: {
        Args: {
          p_property_address: string
          p_city: string
          p_state: string
          p_zip_code: string
          p_exclude_transaction_id?: string
        }
        Returns: {
          transaction_id: string
          property_address: string
          city: string
          state: string
          zip_code: string
          similarity_score: number
          status: Database["public"]["Enums"]["transaction_status"]
        }[]
      }
      generate_agent_setup_link: {
        Args: { p_agent_id: string; p_expires_hours?: number }
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
      is_account_locked: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      lock_user_account: {
        Args: { p_user_id: string; p_reason?: string }
        Returns: boolean
      }
      unlock_user_account: {
        Args: { p_user_id: string }
        Returns: boolean
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
