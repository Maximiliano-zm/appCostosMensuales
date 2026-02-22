-- ============================================================
-- Debt Tracker MVP — Migración inicial
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ─── Helper: función para auto-actualizar updated_at ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ─── Tabla: income ───────────────────────────────────────────────────────────
-- Almacena el ingreso mensual declarado por el usuario.
-- Una fila activa por usuario (se actualiza con upsert desde la app).
CREATE TABLE IF NOT EXISTS income (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_amount NUMERIC(12, 2) NOT NULL CHECK (monthly_amount >= 0),
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabla: debts ────────────────────────────────────────────────────────────
-- Almacena cada cuenta de deuda (tarjeta de crédito, préstamo bancario, etc.).
-- Una fila por instrumento de deuda por usuario.
-- current_balance se actualiza cada vez que se procesa una nueva captura.
CREATE TABLE IF NOT EXISTS debts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name        TEXT        NOT NULL,
  current_balance  NUMERIC(12, 2) NOT NULL CHECK (current_balance >= 0),
  original_amount  NUMERIC(12, 2)          CHECK (original_amount >= 0),
  image_url        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── Índices ─────────────────────────────────────────────────────────────────
-- Query principal: obtener todas las deudas/ingresos de un usuario
CREATE INDEX IF NOT EXISTS idx_debts_user_id  ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);


-- ─── Triggers: updated_at automático ────────────────────────────────────────
CREATE OR REPLACE TRIGGER set_debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER set_income_updated_at
  BEFORE UPDATE ON income
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ─── Row Level Security (RLS) ────────────────────────────────────────────────
-- Fundamental: cada usuario solo puede ver y modificar sus propios datos.
ALTER TABLE debts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- debts: acceso total solo al propietario de la fila
CREATE POLICY "debts: owner access only"
  ON debts FOR ALL
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- income: acceso total solo al propietario de la fila
CREATE POLICY "income: owner access only"
  ON income FOR ALL
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─── Script de verificación (ejecutar después de la migración) ───────────────
-- En Supabase Dashboard → Table Editor, selecciona la tabla "debts" o "income"
-- e inserta una fila de prueba. Debes estar autenticado para que RLS lo permita.
--
-- También puedes verificar con este SELECT desde el SQL Editor:
--   SELECT table_name, row_security
--   FROM information_schema.tables
--   WHERE table_schema = 'public'
--   AND table_name IN ('debts', 'income');
--
-- Resultado esperado: row_security = YES en ambas tablas.


-- ─── Rollback (ejecutar solo si necesitas deshacer) ──────────────────────────
-- DROP TRIGGER IF EXISTS set_debts_updated_at  ON debts;
-- DROP TRIGGER IF EXISTS set_income_updated_at ON income;
-- DROP TABLE IF EXISTS debts;
-- DROP TABLE IF EXISTS income;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
