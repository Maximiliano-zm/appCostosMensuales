-- ============================================================
-- Debt Tracker MVP — Migración Billing Cycle
-- Añade columnas de estado de cuenta mensual a la tabla debts.
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

ALTER TABLE debts
  ADD COLUMN IF NOT EXISTS statement_balance NUMERIC(12, 2) CHECK (statement_balance >= 0),
  ADD COLUMN IF NOT EXISTS minimum_payment   NUMERIC(12, 2) CHECK (minimum_payment >= 0),
  ADD COLUMN IF NOT EXISTS next_due_date     DATE,
  ADD COLUMN IF NOT EXISTS interest_rate     NUMERIC(5, 2)  CHECK (interest_rate >= 0 AND interest_rate <= 100);

-- ─── Nota RLS ────────────────────────────────────────────────────────────────
-- La política "debts: owner access only" creada en la migración inicial
-- cubre automáticamente estas nuevas columnas (aplica FOR ALL operations).
-- No se requieren cambios de RLS.

-- ─── Verificación ────────────────────────────────────────────────────────────
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'debts'
-- ORDER BY ordinal_position;
-- Resultado esperado: 4 columnas nuevas nullable al final de la lista.

-- ─── Rollback (ejecutar solo si necesitas deshacer) ──────────────────────────
-- ALTER TABLE debts
--   DROP COLUMN IF EXISTS statement_balance,
--   DROP COLUMN IF EXISTS minimum_payment,
--   DROP COLUMN IF EXISTS next_due_date,
--   DROP COLUMN IF EXISTS interest_rate;
