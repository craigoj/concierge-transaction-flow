export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          query?: string;
          variables?: Json;
          extensions?: Json;
          operationName?: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      agent_branding: {
        Row: {
          agent_id: string;
          birthday: string | null;
          business_card_template_url: string | null;
          canva_template_url: string | null;
          communication_style: string | null;
          created_at: string | null;
          drinks_alcohol: boolean | null;
          drinks_coffee: boolean | null;
          email_signature: string | null;
          favorite_color: string | null;
          has_branded_sign: boolean | null;
          has_canva_template: boolean | null;
          id: string;
          logo_url: string | null;
          preferred_communication_time: string | null;
          review_link: string | null;
          sign_notes: string | null;
          social_media_permission: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          agent_id: string;
          birthday?: string | null;
          business_card_template_url?: string | null;
          canva_template_url?: string | null;
          communication_style?: string | null;
          created_at?: string | null;
          drinks_alcohol?: boolean | null;
          drinks_coffee?: boolean | null;
          email_signature?: string | null;
          favorite_color?: string | null;
          has_branded_sign?: boolean | null;
          has_canva_template?: boolean | null;
          id?: string;
          logo_url?: string | null;
          preferred_communication_time?: string | null;
          review_link?: string | null;
          sign_notes?: string | null;
          social_media_permission?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          agent_id?: string;
          birthday?: string | null;
          business_card_template_url?: string | null;
          canva_template_url?: string | null;
          communication_style?: string | null;
          created_at?: string | null;
          drinks_alcohol?: boolean | null;
          drinks_coffee?: boolean | null;
          email_signature?: string | null;
          favorite_color?: string | null;
          has_branded_sign?: boolean | null;
          has_canva_template?: boolean | null;
          id?: string;
          logo_url?: string | null;
          preferred_communication_time?: string | null;
          review_link?: string | null;
          sign_notes?: string | null;
          social_media_permission?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'agent_branding_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      agent_intake_sessions: {
        Row: {
          agent_id: string;
          approval_notes: string | null;
          approved_at: string | null;
          branding_data: Json | null;
          completed_at: string | null;
          completion_percentage: number | null;
          created_at: string | null;
          id: string;
          ip_address: unknown | null;
          last_activity_at: string | null;
          preferences_data: Json | null;
          reviewed_by: string | null;
          session_type: string;
          started_at: string | null;
          status: string | null;
          updated_at: string | null;
          user_agent: string | null;
          vendor_data: Json | null;
        };
        Insert: {
          agent_id: string;
          approval_notes?: string | null;
          approved_at?: string | null;
          branding_data?: Json | null;
          completed_at?: string | null;
          completion_percentage?: number | null;
          created_at?: string | null;
          id?: string;
          ip_address?: unknown | null;
          last_activity_at?: string | null;
          preferences_data?: Json | null;
          reviewed_by?: string | null;
          session_type?: string;
          started_at?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          vendor_data?: Json | null;
        };
        Update: {
          agent_id?: string;
          approval_notes?: string | null;
          approved_at?: string | null;
          branding_data?: Json | null;
          completed_at?: string | null;
          completion_percentage?: number | null;
          created_at?: string | null;
          id?: string;
          ip_address?: unknown | null;
          last_activity_at?: string | null;
          preferences_data?: Json | null;
          reviewed_by?: string | null;
          session_type?: string;
          started_at?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          vendor_data?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'agent_intake_sessions_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'agent_intake_sessions_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      agent_vendors: {
        Row: {
          address: string | null;
          agent_id: string;
          company_name: string;
          contact_name: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          is_active: boolean | null;
          is_primary: boolean | null;
          notes: string | null;
          phone: string | null;
          updated_at: string | null;
          vendor_type: string;
        };
        Insert: {
          address?: string | null;
          agent_id: string;
          company_name: string;
          contact_name?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_primary?: boolean | null;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string | null;
          vendor_type: string;
        };
        Update: {
          address?: string | null;
          agent_id?: string;
          company_name?: string;
          contact_name?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_primary?: boolean | null;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string | null;
          vendor_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'agent_vendors_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      automation_rules: {
        Row: {
          actions: Json;
          automation_category: string | null;
          conditions: Json | null;
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          service_tier: Database['public']['Enums']['service_tier_type'] | null;
          service_tier_filter: string | null;
          trigger_event: string;
          updated_at: string | null;
          vendor_type: string | null;
        };
        Insert: {
          actions: Json;
          automation_category?: string | null;
          conditions?: Json | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          service_tier?: Database['public']['Enums']['service_tier_type'] | null;
          service_tier_filter?: string | null;
          trigger_event: string;
          updated_at?: string | null;
          vendor_type?: string | null;
        };
        Update: {
          actions?: Json;
          automation_category?: string | null;
          conditions?: Json | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          service_tier?: Database['public']['Enums']['service_tier_type'] | null;
          service_tier_filter?: string | null;
          trigger_event?: string;
          updated_at?: string | null;
          vendor_type?: string | null;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          address: string | null;
          created_at: string | null;
          created_by: string | null;
          email: string | null;
          first_name: string;
          id: string;
          last_name: string;
          notes: string | null;
          phone: string | null;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          first_name: string;
          id?: string;
          last_name: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'clients_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      documents: {
        Row: {
          created_at: string | null;
          file_path: string;
          file_size: number | null;
          id: string;
          mime_type: string | null;
          title: string;
          transaction_id: string | null;
          uploaded_by: string | null;
        };
        Insert: {
          created_at?: string | null;
          file_path: string;
          file_size?: number | null;
          id?: string;
          mime_type?: string | null;
          title: string;
          transaction_id?: string | null;
          uploaded_by?: string | null;
        };
        Update: {
          created_at?: string | null;
          file_path?: string;
          file_size?: number | null;
          id?: string;
          mime_type?: string | null;
          title?: string;
          transaction_id?: string | null;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'documents_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'documents_uploaded_by_fkey';
            columns: ['uploaded_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      email_templates: {
        Row: {
          content: string;
          created_at: string | null;
          id: string;
          is_agent_customizable: boolean | null;
          name: string;
          service_tier: Database['public']['Enums']['service_tier_type'] | null;
          service_tier_filter: string | null;
          subject: string;
          template_type: string;
          updated_at: string | null;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: string;
          is_agent_customizable?: boolean | null;
          name: string;
          service_tier?: Database['public']['Enums']['service_tier_type'] | null;
          service_tier_filter?: string | null;
          subject: string;
          template_type: string;
          updated_at?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: string;
          is_agent_customizable?: boolean | null;
          name?: string;
          service_tier?: Database['public']['Enums']['service_tier_type'] | null;
          service_tier_filter?: string | null;
          subject?: string;
          template_type?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      offer_requests: {
        Row: {
          agent_id: string;
          appraisal_contingency_days: number | null;
          approved_at: string | null;
          buyer_contacts: Json;
          buyer_names: string;
          closing_cost_assistance: string | null;
          created_at: string | null;
          drafted_by: string | null;
          emd_amount: number;
          exchange_fee: number;
          extras: string | null;
          fica_details: Json;
          financing_contingency_days: number | null;
          generated_documents: Json | null;
          id: string;
          inspection_contingency_days: number | null;
          lead_eifs_survey: string | null;
          lending_company: string;
          loan_type: string;
          occupancy_notes: string | null;
          projected_closing_date: string;
          property_address: string;
          property_city: string | null;
          property_state: string | null;
          property_zip: string | null;
          purchase_price: number;
          reviewed_by: string | null;
          sent_at: string | null;
          settlement_company: string;
          settlement_date_contingency_days: number | null;
          status: string | null;
          transaction_id: string | null;
          updated_at: string | null;
          wdi_inspection_details: Json;
        };
        Insert: {
          agent_id: string;
          appraisal_contingency_days?: number | null;
          approved_at?: string | null;
          buyer_contacts: Json;
          buyer_names: string;
          closing_cost_assistance?: string | null;
          created_at?: string | null;
          drafted_by?: string | null;
          emd_amount: number;
          exchange_fee: number;
          extras?: string | null;
          fica_details: Json;
          financing_contingency_days?: number | null;
          generated_documents?: Json | null;
          id?: string;
          inspection_contingency_days?: number | null;
          lead_eifs_survey?: string | null;
          lending_company: string;
          loan_type: string;
          occupancy_notes?: string | null;
          projected_closing_date: string;
          property_address: string;
          property_city?: string | null;
          property_state?: string | null;
          property_zip?: string | null;
          purchase_price: number;
          reviewed_by?: string | null;
          sent_at?: string | null;
          settlement_company: string;
          settlement_date_contingency_days?: number | null;
          status?: string | null;
          transaction_id?: string | null;
          updated_at?: string | null;
          wdi_inspection_details: Json;
        };
        Update: {
          agent_id?: string;
          appraisal_contingency_days?: number | null;
          approved_at?: string | null;
          buyer_contacts?: Json;
          buyer_names?: string;
          closing_cost_assistance?: string | null;
          created_at?: string | null;
          drafted_by?: string | null;
          emd_amount?: number;
          exchange_fee?: number;
          extras?: string | null;
          fica_details?: Json;
          financing_contingency_days?: number | null;
          generated_documents?: Json | null;
          id?: string;
          inspection_contingency_days?: number | null;
          lead_eifs_survey?: string | null;
          lending_company?: string;
          loan_type?: string;
          occupancy_notes?: string | null;
          projected_closing_date?: string;
          property_address?: string;
          property_city?: string | null;
          property_state?: string | null;
          property_zip?: string | null;
          purchase_price?: number;
          reviewed_by?: string | null;
          sent_at?: string | null;
          settlement_company?: string;
          settlement_date_contingency_days?: number | null;
          status?: string | null;
          transaction_id?: string | null;
          updated_at?: string | null;
          wdi_inspection_details?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'offer_requests_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'offer_requests_drafted_by_fkey';
            columns: ['drafted_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'offer_requests_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'offer_requests_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          onboarding_completed_at: string | null;
          phone: string | null;
          role: string;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          onboarding_completed_at?: string | null;
          phone?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          onboarding_completed_at?: string | null;
          phone?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          assigned_to: string | null;
          completed_at: string | null;
          created_at: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          priority: string | null;
          title: string;
          transaction_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: string | null;
          title: string;
          transaction_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: string | null;
          title?: string;
          transaction_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
      };
      transaction_service_details: {
        Row: {
          additional_fees: Json | null;
          automation_success_rate: number | null;
          base_service_fee: number | null;
          client_satisfaction_score: number | null;
          created_at: string | null;
          discount_applied: number | null;
          feature_customizations: Json | null;
          id: string;
          issue_resolution_hours: number | null;
          milestone_completions: Json | null;
          response_time_hours: number | null;
          selected_features: Json | null;
          service_milestones: Json | null;
          total_service_cost: number | null;
          transaction_id: string;
          updated_at: string | null;
          upgrade_history: Json[] | null;
        };
        Insert: {
          additional_fees?: Json | null;
          automation_success_rate?: number | null;
          base_service_fee?: number | null;
          client_satisfaction_score?: number | null;
          created_at?: string | null;
          discount_applied?: number | null;
          feature_customizations?: Json | null;
          id?: string;
          issue_resolution_hours?: number | null;
          milestone_completions?: Json | null;
          response_time_hours?: number | null;
          selected_features?: Json | null;
          service_milestones?: Json | null;
          total_service_cost?: number | null;
          transaction_id: string;
          updated_at?: string | null;
          upgrade_history?: Json[] | null;
        };
        Update: {
          additional_fees?: Json | null;
          automation_success_rate?: number | null;
          base_service_fee?: number | null;
          client_satisfaction_score?: number | null;
          created_at?: string | null;
          discount_applied?: number | null;
          feature_customizations?: Json | null;
          id?: string;
          issue_resolution_hours?: number | null;
          milestone_completions?: Json | null;
          response_time_hours?: number | null;
          selected_features?: Json | null;
          service_milestones?: Json | null;
          total_service_cost?: number | null;
          transaction_id?: string;
          updated_at?: string | null;
          upgrade_history?: Json[] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'transaction_service_details_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
      };
      transactions: {
        Row: {
          agent_id: string | null;
          client_id: string | null;
          closing_date: string | null;
          commission_amount: number | null;
          commission_rate: number | null;
          created_at: string | null;
          id: string;
          property_address: string;
          purchase_price: number | null;
          service_tier: Database['public']['Enums']['service_tier_type'];
          status: Database['public']['Enums']['transaction_status'] | null;
          transaction_type: string;
          updated_at: string | null;
        };
        Insert: {
          agent_id?: string | null;
          client_id?: string | null;
          closing_date?: string | null;
          commission_amount?: number | null;
          commission_rate?: number | null;
          created_at?: string | null;
          id?: string;
          property_address: string;
          purchase_price?: number | null;
          service_tier?: Database['public']['Enums']['service_tier_type'];
          status?: Database['public']['Enums']['transaction_status'] | null;
          transaction_type: string;
          updated_at?: string | null;
        };
        Update: {
          agent_id?: string | null;
          client_id?: string | null;
          closing_date?: string | null;
          commission_amount?: number | null;
          commission_rate?: number | null;
          created_at?: string | null;
          id?: string;
          property_address?: string;
          purchase_price?: number | null;
          service_tier?: Database['public']['Enums']['service_tier_type'];
          status?: Database['public']['Enums']['transaction_status'] | null;
          transaction_type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
        ];
      };
      workflow_executions: {
        Row: {
          automation_rule_id: string | null;
          client_context: Json | null;
          completed_at: string | null;
          error_message: string | null;
          execution_status: string | null;
          id: string;
          result_data: Json | null;
          service_tier: Database['public']['Enums']['service_tier_type'] | null;
          started_at: string | null;
          transaction_id: string | null;
          trigger_data: Json | null;
          vendor_context: Json | null;
        };
        Insert: {
          automation_rule_id?: string | null;
          client_context?: Json | null;
          completed_at?: string | null;
          error_message?: string | null;
          execution_status?: string | null;
          id?: string;
          result_data?: Json | null;
          service_tier?: Database['public']['Enums']['service_tier_type'] | null;
          started_at?: string | null;
          transaction_id?: string | null;
          trigger_data?: Json | null;
          vendor_context?: Json | null;
        };
        Update: {
          automation_rule_id?: string | null;
          client_context?: Json | null;
          completed_at?: string | null;
          error_message?: string | null;
          execution_status?: string | null;
          id?: string;
          result_data?: Json | null;
          service_tier?: Database['public']['Enums']['service_tier_type'] | null;
          started_at?: string | null;
          transaction_id?: string | null;
          trigger_data?: Json | null;
          vendor_context?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'workflow_executions_automation_rule_id_fkey';
            columns: ['automation_rule_id'];
            isOneToOne: false;
            referencedRelation: 'automation_rules';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workflow_executions_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      apply_task_template: {
        Args: { p_transaction_id: string; p_service_tier: string };
        Returns: undefined;
      };
      apply_workflow_template: {
        Args: { p_transaction_id: string; p_template_name: string };
        Returns: undefined;
      };
      get_agent_primary_vendor: {
        Args: { p_agent_id: string; p_vendor_type: string };
        Returns: string;
      };
      get_my_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_service_tier_features: {
        Args: { p_service_tier: string };
        Returns: Json;
      };
      get_user_role: {
        Args: { p_user_id: string };
        Returns: string;
      };
    };
    Enums: {
      service_tier_type:
        | 'buyer_core'
        | 'buyer_elite'
        | 'white_glove_buyer'
        | 'listing_core'
        | 'listing_elite'
        | 'white_glove_listing';
      transaction_status:
        | 'pending'
        | 'active'
        | 'under_contract'
        | 'closing'
        | 'completed'
        | 'cancelled';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      service_tier_type: [
        'buyer_core',
        'buyer_elite',
        'white_glove_buyer',
        'listing_core',
        'listing_elite',
        'white_glove_listing',
      ],
      transaction_status: [
        'pending',
        'active',
        'under_contract',
        'closing',
        'completed',
        'cancelled',
      ],
    },
  },
} as const;
