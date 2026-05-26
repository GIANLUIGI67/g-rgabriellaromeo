-- Adds a top-level product-name summary to confirmed and temporary orders.
-- The application writes this column as "name" for quick inspection in Supabase.

DO $$
BEGIN
  IF to_regclass('public.ordini') IS NOT NULL THEN
    ALTER TABLE public.ordini
      ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';

    UPDATE public.ordini AS o
    SET name = summary.product_names
    FROM (
      SELECT
        source_order.id,
        string_agg(
          product_name ||
            CASE
              WHEN quantity > 1 THEN ' x' || quantity::TEXT
              ELSE ''
            END,
          ', '
          ORDER BY item.ordinality
        ) AS product_names
      FROM public.ordini AS source_order
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(COALESCE(source_order.carrello::jsonb, '[]'::jsonb)) = 'array'
            THEN COALESCE(source_order.carrello::jsonb, '[]'::jsonb)
          WHEN jsonb_typeof(COALESCE(source_order.carrello::jsonb, '{}'::jsonb) -> 'items') = 'array'
            THEN COALESCE(source_order.carrello::jsonb -> 'items', '[]'::jsonb)
          ELSE '[]'::jsonb
        END
      ) WITH ORDINALITY AS item(value, ordinality)
      CROSS JOIN LATERAL (
        SELECT
          NULLIF(TRIM(COALESCE(item.value ->> 'nome', item.value ->> 'name', '')), '') AS product_name,
          CASE
            WHEN COALESCE(item.value ->> 'quantita', item.value ->> 'quantity', item.value ->> 'qty', '1') ~ '^[0-9]+$'
              THEN GREATEST((COALESCE(item.value ->> 'quantita', item.value ->> 'quantity', item.value ->> 'qty', '1'))::INT, 1)
            ELSE 1
          END AS quantity
      ) normalized
      WHERE normalized.product_name IS NOT NULL
      GROUP BY source_order.id
    ) AS summary
    WHERE o.id = summary.id
      AND COALESCE(o.name, '') = '';
  END IF;

  IF to_regclass('public.ordini_temporanei') IS NOT NULL THEN
    ALTER TABLE public.ordini_temporanei
      ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';

    UPDATE public.ordini_temporanei AS o
    SET name = summary.product_names
    FROM (
      SELECT
        source_order.id,
        string_agg(
          product_name ||
            CASE
              WHEN quantity > 1 THEN ' x' || quantity::TEXT
              ELSE ''
            END,
          ', '
          ORDER BY item.ordinality
        ) AS product_names
      FROM public.ordini_temporanei AS source_order
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(COALESCE(source_order.carrello::jsonb, '[]'::jsonb)) = 'array'
            THEN COALESCE(source_order.carrello::jsonb, '[]'::jsonb)
          WHEN jsonb_typeof(COALESCE(source_order.carrello::jsonb, '{}'::jsonb) -> 'items') = 'array'
            THEN COALESCE(source_order.carrello::jsonb -> 'items', '[]'::jsonb)
          ELSE '[]'::jsonb
        END
      ) WITH ORDINALITY AS item(value, ordinality)
      CROSS JOIN LATERAL (
        SELECT
          NULLIF(TRIM(COALESCE(item.value ->> 'nome', item.value ->> 'name', '')), '') AS product_name,
          CASE
            WHEN COALESCE(item.value ->> 'quantita', item.value ->> 'quantity', item.value ->> 'qty', '1') ~ '^[0-9]+$'
              THEN GREATEST((COALESCE(item.value ->> 'quantita', item.value ->> 'quantity', item.value ->> 'qty', '1'))::INT, 1)
            ELSE 1
          END AS quantity
      ) normalized
      WHERE normalized.product_name IS NOT NULL
      GROUP BY source_order.id
    ) AS summary
    WHERE o.id = summary.id
      AND COALESCE(o.name, '') = '';
  END IF;
END $$;
