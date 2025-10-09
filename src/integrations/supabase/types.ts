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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_wallets: {
        Row: {
          address: string
          created_at: string | null
          currency: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          currency: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          currency?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_sync_logs: {
        Row: {
          broker_type: string
          created_at: string
          error_message: string | null
          id: string
          portfolio_id: string
          positions_added: number | null
          positions_updated: number | null
          status: string
          sync_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          broker_type: string
          created_at?: string
          error_message?: string | null
          id?: string
          portfolio_id: string
          positions_added?: number | null
          positions_updated?: number | null
          status?: string
          sync_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          broker_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          portfolio_id?: string
          positions_added?: number | null
          positions_updated?: number | null
          status?: string
          sync_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      auto_sync_schedule: {
        Row: {
          broker_type: string
          created_at: string
          id: string
          is_enabled: boolean | null
          last_auto_sync: string | null
          portfolio_id: string
          sync_count_today: number | null
          sync_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          broker_type: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          last_auto_sync?: string | null
          portfolio_id: string
          sync_count_today?: number | null
          sync_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          broker_type?: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          last_auto_sync?: string | null
          portfolio_id?: string
          sync_count_today?: number | null
          sync_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          created_at: string
          id: string
          message: string
          response: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          response: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          status: string
          transaction_hash: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: string
          status?: string
          transaction_hash?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          status?: string
          transaction_hash?: string | null
          user_id?: string
        }
        Relationships: []
      }
      detected_dividends: {
        Row: {
          annual_dividend: number | null
          company_name: string | null
          detected_at: string | null
          detection_source: string | null
          dividend_yield: number | null
          estimated_annual_income: number | null
          ex_dividend_date: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          payment_date: string | null
          portfolio_id: string
          shares_owned: number | null
          symbol: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_dividend?: number | null
          company_name?: string | null
          detected_at?: string | null
          detection_source?: string | null
          dividend_yield?: number | null
          estimated_annual_income?: number | null
          ex_dividend_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          payment_date?: string | null
          portfolio_id: string
          shares_owned?: number | null
          symbol: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_dividend?: number | null
          company_name?: string | null
          detected_at?: string | null
          detection_source?: string | null
          dividend_yield?: number | null
          estimated_annual_income?: number | null
          ex_dividend_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          payment_date?: string | null
          portfolio_id?: string
          shares_owned?: number | null
          symbol?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dividend_detection_jobs: {
        Row: {
          created_at: string | null
          dividend_stocks_found: number | null
          id: string
          last_run_at: string | null
          next_run_at: string | null
          portfolio_id: string
          status: string | null
          stocks_analyzed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dividend_stocks_found?: number | null
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          portfolio_id: string
          status?: string | null
          stocks_analyzed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dividend_stocks_found?: number | null
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          portfolio_id?: string
          status?: string | null
          stocks_analyzed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dividend_settings: {
        Row: {
          auto_import_enabled: boolean | null
          created_at: string
          default_portfolio_id: string | null
          id: string
          notification_enabled: boolean | null
          preferred_currency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_import_enabled?: boolean | null
          created_at?: string
          default_portfolio_id?: string | null
          id?: string
          notification_enabled?: boolean | null
          preferred_currency?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_import_enabled?: boolean | null
          created_at?: string
          default_portfolio_id?: string | null
          id?: string
          notification_enabled?: boolean | null
          preferred_currency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dividend_settings_default_portfolio_id_fkey"
            columns: ["default_portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      dividends: {
        Row: {
          company_name: string | null
          created_at: string
          currency: string
          dividend_amount: number
          dividend_type: string
          ex_dividend_date: string | null
          id: string
          notes: string | null
          payment_date: string
          portfolio_id: string
          record_date: string | null
          shares_owned: number | null
          symbol: string
          tax_withheld: number | null
          total_received: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          currency?: string
          dividend_amount: number
          dividend_type?: string
          ex_dividend_date?: string | null
          id?: string
          notes?: string | null
          payment_date: string
          portfolio_id: string
          record_date?: string | null
          shares_owned?: number | null
          symbol: string
          tax_withheld?: number | null
          total_received: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          currency?: string
          dividend_amount?: number
          dividend_type?: string
          ex_dividend_date?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          portfolio_id?: string
          record_date?: string | null
          shares_owned?: number | null
          symbol?: string
          tax_withheld?: number | null
          total_received?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dividends_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          sent_at: string | null
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sent_at?: string | null
          status?: string
          subject: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sent_at?: string | null
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          default_currency: string
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          default_currency?: string
          id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          default_currency?: string
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      portfolio_metadata: {
        Row: {
          broker_type: string
          cash_balance: number | null
          created_at: string
          holdings_count: number | null
          id: string
          last_sync_at: string
          portfolio_id: string
          today_change: number | null
          today_change_percentage: number | null
          total_return: number | null
          total_return_percentage: number | null
          total_value: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          broker_type: string
          cash_balance?: number | null
          created_at?: string
          holdings_count?: number | null
          id?: string
          last_sync_at?: string
          portfolio_id: string
          today_change?: number | null
          today_change_percentage?: number | null
          total_return?: number | null
          total_return_percentage?: number | null
          total_value?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          broker_type?: string
          cash_balance?: number | null
          created_at?: string
          holdings_count?: number | null
          id?: string
          last_sync_at?: string
          portfolio_id?: string
          today_change?: number | null
          today_change_percentage?: number | null
          total_return?: number | null
          total_return_percentage?: number | null
          total_value?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      portfolio_positions: {
        Row: {
          average_price: number
          broker_type: string
          created_at: string
          current_price: number
          id: string
          last_updated: string
          market_value: number
          portfolio_id: string
          quantity: number
          symbol: string
          unrealized_pnl: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          average_price?: number
          broker_type: string
          created_at?: string
          current_price?: number
          id?: string
          last_updated?: string
          market_value?: number
          portfolio_id: string
          quantity?: number
          symbol: string
          unrealized_pnl?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          average_price?: number
          broker_type?: string
          created_at?: string
          current_price?: number
          id?: string
          last_updated?: string
          market_value?: number
          portfolio_id?: string
          quantity?: number
          symbol?: string
          unrealized_pnl?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          portfolio_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          portfolio_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          portfolio_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          default_currency: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          default_currency?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          default_currency?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          created_at: string
          frequency: string
          id: string
          last_run: string | null
          name: string
          next_run: string
        }
        Insert: {
          created_at?: string
          frequency: string
          id?: string
          last_run?: string | null
          name: string
          next_run: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          last_run?: string | null
          name?: string
          next_run?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          id: string
          plan: string
          portfolio_limit: number
          updated_at: string
          user_id: string
          watchlist_limit: number
        }
        Insert: {
          created_at?: string
          id?: string
          plan?: string
          portfolio_limit?: number
          updated_at?: string
          user_id: string
          watchlist_limit?: number
        }
        Update: {
          created_at?: string
          id?: string
          plan?: string
          portfolio_limit?: number
          updated_at?: string
          user_id?: string
          watchlist_limit?: number
        }
        Relationships: []
      }
      watchlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
