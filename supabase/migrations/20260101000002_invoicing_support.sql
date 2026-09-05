-- ==============================================================================
-- INVOICING (CFDI 4.0 SAT) SUPPORT FOR ORDERS TABLE
-- ==============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS invoice_status TEXT DEFAULT 'pending' NOT NULL,
  ADD COLUMN IF NOT EXISTS invoice_uuid UUID,
  ADD COLUMN IF NOT EXISTS invoice_rfc TEXT,
  ADD COLUMN IF NOT EXISTS invoice_xml_url TEXT,
  ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS invoiced_at TIMESTAMPTZ;

-- Index for fast lookup by invoice_uuid and invoice_rfc
CREATE INDEX IF NOT EXISTS idx_orders_invoice_uuid ON public.orders (invoice_uuid);
CREATE INDEX IF NOT EXISTS idx_orders_invoice_rfc ON public.orders (invoice_rfc);
CREATE INDEX IF NOT EXISTS idx_orders_invoice_status ON public.orders (invoice_status);
