export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          condition: Database["public"]["Enums"]["alert_condition"]
          created_at: string
          enabled: boolean
          id: string
          last_triggered: string | null
          message: string | null
          name: string
          threshold: number | null
          triggered: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          condition: Database["public"]["Enums"]["alert_condition"]
          created_at?: string
          enabled?: boolean
          id?: string
          last_triggered?: string | null
          message?: string | null
          name: string
          threshold?: number | null
          triggered?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          condition?: Database["public"]["Enums"]["alert_condition"]
          created_at?: string
          enabled?: boolean
          id?: string
          last_triggered?: string | null
          message?: string | null
          name?: string
          threshold?: number | null
          triggered?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      correlated_events: {
        Row: {
          created_at: string
          end_time: string
          id: string
          log_ids: string[]
          rule_id: string
          rule_name: string
          severity: Database["public"]["Enums"]["log_severity"]
          shared_values: Json
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          log_ids?: string[]
          rule_id: string
          rule_name: string
          severity?: Database["public"]["Enums"]["log_severity"]
          shared_values?: Json
          start_time: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          log_ids?: string[]
          rule_id?: string
          rule_name?: string
          severity?: Database["public"]["Enums"]["log_severity"]
          shared_values?: Json
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "correlated_events_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "correlation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      correlation_rules: {
        Row: {
          conditions: Json
          created_at: string
          description: string
          enabled: boolean
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conditions?: Json
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conditions?: Json
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      log_sources: {
        Row: {
          created_at: string
          id: string
          last_seen: string | null
          log_count: number
          name: string
          status: Database["public"]["Enums"]["source_status"]
          type: Database["public"]["Enums"]["source_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen?: string | null
          log_count?: number
          name: string
          status?: Database["public"]["Enums"]["source_status"]
          type: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen?: string | null
          log_count?: number
          name?: string
          status?: Database["public"]["Enums"]["source_status"]
          type?: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          created_at: string
          host: string
          id: string
          ip: string | null
          message: string
          metadata: Json | null
          request_id: string | null
          severity: Database["public"]["Enums"]["log_severity"]
          source_id: string | null
          source_name: string
          source_type: Database["public"]["Enums"]["source_type"]
          timestamp: string
          user_id: string
          user_id_field: string | null
        }
        Insert: {
          created_at?: string
          host: string
          id?: string
          ip?: string | null
          message: string
          metadata?: Json | null
          request_id?: string | null
          severity?: Database["public"]["Enums"]["log_severity"]
          source_id?: string | null
          source_name: string
          source_type: Database["public"]["Enums"]["source_type"]
          timestamp?: string
          user_id: string
          user_id_field?: string | null
        }
        Update: {
          created_at?: string
          host?: string
          id?: string
          ip?: string | null
          message?: string
          metadata?: Json | null
          request_id?: string | null
          severity?: Database["public"]["Enums"]["log_severity"]
          source_id?: string | null
          source_name?: string
          source_type?: Database["public"]["Enums"]["source_type"]
          timestamp?: string
          user_id?: string
          user_id_field?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "log_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_condition: "error_spike" | "pattern_match" | "anomaly" | "threshold"
      app_role: "admin" | "moderator" | "user"
      log_severity: "critical" | "error" | "warning" | "info" | "debug"
      source_status: "active" | "inactive" | "error"
      source_type:
        | "syslog"
        | "application"
        | "cloudwatch"
        | "gcp"
        | "kubernetes"
        | "http"
        | "file"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_condition: ["error_spike", "pattern_match", "anomaly", "threshold"],
      app_role: ["admin", "moderator", "user"],
      log_severity: ["critical", "error", "warning", "info", "debug"],
      source_status: ["active", "inactive", "error"],
      source_type: [
        "syslog",
        "application",
        "cloudwatch",
        "gcp",
        "kubernetes",
        "http",
        "file",
      ],
    },
  },
} as const
