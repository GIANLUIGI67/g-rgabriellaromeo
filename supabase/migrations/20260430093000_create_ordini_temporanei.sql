-- ordini_temporanei: holds bank-transfer orders awaiting admin payment confirmation.
-- Inventory (products.quantita) is decremented immediately when the record is created.
-- Admin confirms or rejects: confirmed orders move to 'ordini'; rejected ones restore inventory.

CREATE TABLE IF NOT EXISTS ordini_temporanei (
  id                      TEXT PRIMARY KEY,
  cliente                 JSONB        NOT NULL DEFAULT '{}',
  cliente_email           TEXT         NOT NULL DEFAULT '',
  carrello                JSONB        NOT NULL DEFAULT '[]',
  spedizione              TEXT         NOT NULL DEFAULT '',
  pagamento               TEXT         NOT NULL DEFAULT 'bonifico',
  totale                  NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotale               NUMERIC(10,2) NOT NULL DEFAULT 0,
  valore_sconto           NUMERIC(10,2) NOT NULL DEFAULT 0,
  sconto_primo_acquisto   NUMERIC(5,2)  NOT NULL DEFAULT 0,
  stato                   TEXT         NOT NULL DEFAULT 'in_attesa_bonifico',
  -- Stores [{productId, previousQuantity}] so inventory can be restored on rejection
  inventory_adjustments   JSONB        NOT NULL DEFAULT '[]',
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordini_temporanei_email  ON ordini_temporanei (cliente_email);
CREATE INDEX IF NOT EXISTS idx_ordini_temporanei_stato  ON ordini_temporanei (stato);
CREATE INDEX IF NOT EXISTS idx_ordini_temporanei_created ON ordini_temporanei (created_at DESC);

-- RLS: only server-side service role can manage these records
ALTER TABLE ordini_temporanei ENABLE ROW LEVEL SECURITY;

-- Deny all direct client access; service role bypasses RLS automatically
CREATE POLICY "deny_all_anon" ON ordini_temporanei FOR ALL TO anon USING (false);
CREATE POLICY "deny_all_auth" ON ordini_temporanei FOR ALL TO authenticated USING (false);
