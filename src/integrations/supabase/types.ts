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
      invoices: {
        Row: {
          amount_brl: number
          created_at: string
          id: string
          merchant_id: string
          product_ids: string[] | null
          ref: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_brl: number
          created_at?: string
          id?: string
          merchant_id: string
          product_ids?: string[] | null
          ref: string
          status: string
          updated_at?: string
        }
        Update: {
          amount_brl?: number
          created_at?: string
          id?: string
          merchant_id?: string
          product_ids?: string[] | null
          ref?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_members: {
        Row: {
          created_at: string
          email: string | null
          is_default: boolean
          merchant_id: string
          name: string | null
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          is_default?: boolean
          merchant_id: string
          name?: string | null
          role: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          is_default?: boolean
          merchant_id?: string
          name?: string | null
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_members_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          category: string | null
          created_at: string
          demo_mode: boolean
          email: string | null
          id: string
          logo_url: string | null
          name: string
          onboarding_complete: boolean
          pay_with_binance: boolean
          phone: string | null
          pix_settlement: boolean
          updated_at: string
          use_program: boolean
          wallet_masked: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          demo_mode?: boolean
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          onboarding_complete?: boolean
          pay_with_binance?: boolean
          phone?: string | null
          pix_settlement?: boolean
          updated_at?: string
          use_program?: boolean
          wallet_masked: string
        }
        Update: {
          category?: string | null
          created_at?: string
          demo_mode?: boolean
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          onboarding_complete?: boolean
          pay_with_binance?: boolean
          phone?: string | null
          pix_settlement?: boolean
          updated_at?: string
          use_program?: boolean
          wallet_masked?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_brl: number
          created_at: string
          id: string
          invoice_id: string
          status: string
          tx_hash: string | null
          updated_at: string
        }
        Insert: {
          amount_brl: number
          created_at?: string
          id?: string
          invoice_id: string
          status: string
          tx_hash?: string | null
          updated_at?: string
        }
        Update: {
          amount_brl?: number
          created_at?: string
          id?: string
          invoice_id?: string
          status?: string
          tx_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          merchant_id: string
          name: string
          price_brl: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          merchant_id: string
          name: string
          price_brl: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          merchant_id?: string
          name?: string
          price_brl?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          id: string
          payment_id: string
          receipt_data: Json
        }
        Insert: {
          created_at?: string
          id?: string
          payment_id: string
          receipt_data: Json
        }
        Update: {
          created_at?: string
          id?: string
          payment_id?: string
          receipt_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_invoice_with_payment: {
        Args: { _amount_brl: number; _product_ids: string[]; _ref: string }
        Returns: {
          amount_brl: number
          invoice_id: string
          payment_id: string
          ref: string
          status: string
        }[]
      }
      current_merchant: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          created_at: string
          demo_mode: boolean
          email: string
          id: string
          logo_url: string
          name: string
          onboarding_complete: boolean
          pay_with_binance: boolean
          phone: string
          pix_settlement: boolean
          updated_at: string
          use_program: boolean
          wallet_masked: string
        }[]
      }
      is_member: {
        Args: { _merchant_id: string }
        Returns: boolean
      }
      is_owner: {
        Args: { _merchant_id: string }
        Returns: boolean
      }
      list_receipts: {
        Args: { _from: string; _to: string }
        Returns: {
          amount_brl: number
          created_at: string
          id: string
          payment_id: string
          payment_status: string
          ref: string
          status: string
          tx_hash: string
          updated_at: string
        }[]
      }
      mark_confirmed: {
        Args: { _ref: string; _tx_hash: string }
        Returns: undefined
      }
      mark_settled: {
        Args: { _ref: string }
        Returns: undefined
      }
      set_default_merchant: {
        Args: { _merchant_id: string }
        Returns: undefined
      }
      update_payment_status: {
        Args: { _ref: string; _status: string; _tx_hash?: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
