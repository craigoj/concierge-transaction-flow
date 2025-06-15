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
      clients: {
        Row: {
          email: string | null
          full_name: string
          id: string
          phone: string | null
          transaction_id: string
          type: Database["public"]["Enums"]["client_type"]
        }
        Insert: {
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          transaction_id: string
          type: Database["public"]["Enums"]["client_type"]
        }
        Update: {
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          transaction_id?: string
          type?: Database["public"]["Enums"]["client_type"]
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
          file_name: string
          file_path: string
          id: string
          transaction_id: string
          uploaded_by_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          transaction_id: string
          uploaded_by_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
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
          brokerage: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          brokerage?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          brokerage?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean
          priority: Database["public"]["Enums"]["task_priority"]
          title: string
          transaction_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          priority?: Database["public"]["Enums"]["task_priority"]
          title: string
          transaction_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          priority?: Database["public"]["Enums"]["task_priority"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
