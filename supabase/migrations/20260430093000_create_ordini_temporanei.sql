-- ordini_temporanei: holds bank-transfer orders awaiting admin payment confirmation.
-- This migration is safe to run on an existing table: uses ADD COLUMN IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS ordini_temporanei (
  id TEXT PRIMARY KEY
);

-- Add each column only if it doesn't already exist (safe on pre-existing tables)
ALTER TABLE ordini_temporanei
  ADD COLUMN IF NOT EXISTS cliente               JSONB         NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cliente_email         TEXT          NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS carrello              JSONB         NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS spedizione            TEXT          NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pagamento             TEXT          NOT NULL DEFAULT 'bonifico',
  ADD COLUMN IF NOT EXISTS totale                NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotale             NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valore_sconto         NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sconto_primo_acquisto NUMERIC(5,2)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stato                 TEXT          NOT NULL DEFAULT 'in_attesa_bonifico',
  -- Stores [{productId, previousQuantity}] to restore inventory on rejection
  ADD COLUMN IF NOT EXISTS inventory_adjustments JSONB         NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW();

-- Indexes (IF NOT EXISTS supported in Postgres 9.5+)
CREATE INDEX IF NOT EXISTS idx_ordini_temporanei_email   ON ordini_temporanei (cliente_email);
CREATE INDEX IF NOT EXISTS idx_ordini_temporanei_stato   ON ordini_temporanei (stato);
CREATE INDEX IF NOT EXISTS idx_ordini_temporanei_created ON ordini_temporanei (created_at DESC);

-- RLS
ALTER TABLE ordini_temporanei ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ordini_temporanei' AND policyname = 'deny_all_anon'
  ) THEN
    CREATE POLICY "deny_all_anon" ON ordini_temporanei FOR ALL TO anon USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ordini_temporanei' AND policyname = 'deny_all_auth'
  ) THEN
    CREATE POLICY "deny_all_auth" ON ordini_temporanei FOR ALL TO authenticated USING (false);
  END IF;
END $$;
