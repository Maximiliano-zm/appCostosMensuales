/**
 * Tipos generados manualmente del esquema de Supabase.
 * Una vez creadas las tablas, puedes regenerarlos con:
 *   npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.ts
 */

export interface Database {
  public: {
    Tables: {
      debts: {
        Row: {
          id: string;
          user_id: string;
          bank_name: string;
          current_balance: number;
          original_amount: number | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bank_name: string;
          current_balance: number;
          original_amount?: number | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bank_name?: string;
          current_balance?: number;
          original_amount?: number | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      income: {
        Row: {
          id: string;
          user_id: string;
          monthly_amount: number;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          monthly_amount: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          monthly_amount?: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ─── Convenience types ───────────────────────────────────────────────────────
export type Debt       = Database["public"]["Tables"]["debts"]["Row"];
export type DebtInsert = Database["public"]["Tables"]["debts"]["Insert"];
export type DebtUpdate = Database["public"]["Tables"]["debts"]["Update"];

export type Income       = Database["public"]["Tables"]["income"]["Row"];
export type IncomeInsert = Database["public"]["Tables"]["income"]["Insert"];
export type IncomeUpdate = Database["public"]["Tables"]["income"]["Update"];
