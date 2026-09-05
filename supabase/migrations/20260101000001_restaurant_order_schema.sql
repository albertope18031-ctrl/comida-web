-- ==============================================================================
-- WINGSTOP MÉXICO - SCHEMA MIGRATION & POSTGRESQL ARCHITECTURE
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE order_type AS ENUM ('pickup', 'delivery');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'on_the_way',
    'delivered',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. BRANCHES TABLE (Sucursales)
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  delivery_radius_km NUMERIC(5, 2) DEFAULT 5.0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  opening_time TIME NOT NULL DEFAULT '11:00:00',
  closing_time TIME NOT NULL DEFAULT '23:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
  image_url TEXT,
  pieces_count INT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. MODIFIER GROUPS TABLE (Grupos de Modificadores)
CREATE TABLE IF NOT EXISTS public.modifier_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_selection INT DEFAULT 0 NOT NULL CHECK (min_selection >= 0),
  max_selection INT DEFAULT 1 NOT NULL CHECK (max_selection >= min_selection),
  is_required BOOLEAN DEFAULT FALSE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. MODIFIER OPTIONS TABLE (Opciones de Modificador con Heat-O-Meter)
CREATE TABLE IF NOT EXISTS public.modifier_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.modifier_groups(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  extra_price NUMERIC(10, 2) DEFAULT 0 NOT NULL CHECK (extra_price >= 0),
  heat_level INT DEFAULT 0 NOT NULL CHECK (heat_level >= 0 AND heat_level <= 5),
  is_available BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE RESTRICT NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  order_type order_type DEFAULT 'delivery'::order_type NOT NULL,
  delivery_address JSONB,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10, 2) DEFAULT 0 NOT NULL CHECK (delivery_fee >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status order_status DEFAULT 'pending'::order_status NOT NULL,
  payment_status payment_status DEFAULT 'unpaid'::payment_status NOT NULL,
  payment_method TEXT DEFAULT 'card' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. ORDER ITEMS TABLE (Congelación de precios por ítem)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. ORDER ITEM MODIFIERS TABLE (Congelación de modificadores y salsas elegidas)
CREATE TABLE IF NOT EXISTS public.order_item_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE NOT NULL,
  modifier_option_id UUID REFERENCES public.modifier_options(id) ON DELETE RESTRICT NOT NULL,
  modifier_name TEXT NOT NULL,
  extra_price NUMERIC(10, 2) DEFAULT 0 NOT NULL CHECK (extra_price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 11. INDEXES FOR HIGH CONCURRENCY & FAST LOOKUPS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_branches_slug ON public.branches (slug);
CREATE INDEX IF NOT EXISTS idx_branches_active ON public.branches (is_active);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories (display_order, is_active);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products (is_active);

CREATE INDEX IF NOT EXISTS idx_modifier_groups_product ON public.modifier_groups (product_id);
CREATE INDEX IF NOT EXISTS idx_modifier_options_group ON public.modifier_options (group_id);
CREATE INDEX IF NOT EXISTS idx_modifier_options_avail ON public.modifier_options (is_available);

CREATE INDEX IF NOT EXISTS idx_orders_branch ON public.orders (branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders (order_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_modifiers_item ON public.order_item_modifiers (order_item_id);

-- ==============================================================================
-- 12. TRIGGERS & BUSINESS FUNCTIONS
-- ==============================================================================

-- Trigger: Updated_at en Orders
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Trigger: Foliador amigable de órdenes (ej. WS-260905-XXXX)
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  date_prefix TEXT;
  random_suffix INT;
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    date_prefix := TO_CHAR(NOW(), 'YYMMDD');
    random_suffix := FLOOR(1000 + RANDOM() * 9000)::INT;
    NEW.order_number := 'WS-' || date_prefix || '-' || random_suffix::TEXT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_order_number ON public.orders;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.generate_order_number();

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_modifiers ENABLE ROW LEVEL SECURITY;

-- Catalog: Public read access for active records
DROP POLICY IF EXISTS "Public can view active branches" ON public.branches;
CREATE POLICY "Public can view active branches"
  ON public.branches FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public can view active modifier groups" ON public.modifier_groups;
CREATE POLICY "Public can view active modifier groups"
  ON public.modifier_groups FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public can view available modifier options" ON public.modifier_options;
CREATE POLICY "Public can view available modifier options"
  ON public.modifier_options FOR SELECT
  USING (is_available = TRUE);

-- Orders: Public creation (anonymous guest or authenticated checkout)
DROP POLICY IF EXISTS "Allow anonymous or auth users to create orders" ON public.orders;
CREATE POLICY "Allow anonymous or auth users to create orders"
  ON public.orders FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow users to insert order items" ON public.order_items;
CREATE POLICY "Allow users to insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow users to insert order item modifiers" ON public.order_item_modifiers;
CREATE POLICY "Allow users to insert order item modifiers"
  ON public.order_item_modifiers FOR INSERT
  WITH CHECK (TRUE);

-- Orders: Read access restricted to customer (by email or auth.uid) or authenticated staff
DROP POLICY IF EXISTS "Customers and staff can view orders" ON public.orders;
CREATE POLICY "Customers and staff can view orders"
  ON public.orders FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    customer_email = (auth.jwt() ->> 'email') OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' IN ('admin', 'kitchen'))
    )
  );

DROP POLICY IF EXISTS "Customers and staff can view order items" ON public.order_items;
CREATE POLICY "Customers and staff can view order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (
        auth.role() = 'service_role' OR
        orders.customer_email = (auth.jwt() ->> 'email') OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND (auth.users.raw_user_meta_data->>'role' IN ('admin', 'kitchen'))
        )
      )
    )
  );

DROP POLICY IF EXISTS "Customers and staff can view order item modifiers" ON public.order_item_modifiers;
CREATE POLICY "Customers and staff can view order item modifiers"
  ON public.order_item_modifiers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items
      JOIN public.orders ON orders.id = order_items.order_id
      WHERE order_items.id = order_item_modifiers.order_item_id
      AND (
        auth.role() = 'service_role' OR
        orders.customer_email = (auth.jwt() ->> 'email') OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND (auth.users.raw_user_meta_data->>'role' IN ('admin', 'kitchen'))
        )
      )
    )
  );

-- ==============================================================================
-- 14. REALISTIC SEED DATA (WINGSTOP MÉXICO)
-- ==============================================================================

-- Branches
INSERT INTO public.branches (id, name, slug, address, phone, latitude, longitude, delivery_radius_km, is_active, opening_time, closing_time)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Wingstop Roma Norte', 'roma-norte', 'Álvaro Obregón 151, Roma Norte, Cuauhtémoc, CDMX', '55 5584 9201', 19.418240, -99.161320, 6.0, TRUE, '12:00:00', '23:00:00'),
  ('a0000000-0000-0000-0000-000000000002', 'Wingstop Polanco', 'polanco', 'Av. Homero 1425, Polanco, Miguel Hidalgo, CDMX', '55 5280 4310', 19.436150, -99.198300, 5.5, TRUE, '12:00:00', '23:30:00'),
  ('a0000000-0000-0000-0000-000000000003', 'Wingstop Insurgentes Sur', 'insurgentes-sur', 'Av. Insurgentes Sur 1235, Del Valle, Benito Juárez, CDMX', '55 5598 7720', 19.380120, -99.176430, 7.0, TRUE, '12:00:00', '23:00:00'),
  ('a0000000-0000-0000-0000-000000000004', 'Wingstop Ciudad Satélite', 'satelite', 'Circuito Centro Comercial 2251, Naucalpan, Edo. Méx.', '55 5562 1084', 19.513410, -99.234120, 8.0, TRUE, '11:30:00', '22:30:00')
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO public.categories (id, name, slug, image_url, display_order, is_active)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Alitas Tradicionales', 'alitas', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=800', 1, TRUE),
  ('b0000000-0000-0000-0000-000000000002', 'Boneless de Pechuga', 'boneless', 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800', 2, TRUE),
  ('b0000000-0000-0000-0000-000000000003', 'Crispy Tenders', 'tenders', 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=800', 3, TRUE),
  ('b0000000-0000-0000-0000-000000000004', 'Combos & Packs', 'combos', 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800', 4, TRUE),
  ('b0000000-0000-0000-0000-000000000005', 'Papas & Complementos', 'papas', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=800', 5, TRUE),
  ('b0000000-0000-0000-0000-000000000006', 'Bebidas Frías', 'bebidas', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800', 6, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO public.products (id, category_id, name, slug, description, base_price, image_url, pieces_count, is_active)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Alitas Tradicionales (10 Pzas)', 'alitas-10-piezas', '10 alitas frescas con hueso, doradas al momento y bañadas a mano con hasta 2 salsas a elegir.', 199.00, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=800', 10, TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Alitas Tradicionales (15 Pzas)', 'alitas-15-piezas', '15 alitas crujientes con hueso, salseadas a mano con hasta 2 sabores legendarios.', 289.00, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=800', 15, TRUE),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Alitas Tradicionales (20 Pzas)', 'alitas-20-piezas', '20 alitas tradicionales para compartir. Hasta 3 salsas o sazonadores secos.', 379.00, 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=800', 20, TRUE),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'Boneless de Pechuga (10 Pzas)', 'boneless-10-piezas', '10 jugosos cubos de pechuga 100% natural empanizada y bañada con hasta 2 salsas.', 189.00, 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800', 10, TRUE),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'Boneless de Pechuga (15 Pzas)', 'boneless-15-piezas', '15 piezas de boneless premium crujientes preparados al instante con hasta 2 salsas.', 269.00, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800', 15, TRUE),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'Crispy Tenders (4 Pzas)', 'crispy-tenders-4-piezas', '4 tiras gigantes de pechuga marinadas y empanizadas artesanalmente.', 169.00, 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=800', 4, TRUE),
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004', 'Wingstop All-in-One Combo', 'wingstop-all-in-one-combo', '8 piezas a elegir + Papas sazonadas regulares + 1 Aderezo Ranch + Refresco 600 ml.', 259.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800', 8, TRUE),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', 'Crew Pack (30 Piezas + 2 Papas)', 'crew-pack-30-piezas', '30 alitas o boneless con hasta 4 sabores, 2 órdenes grandes de papas sazonadas y 3 dips.', 629.00, 'https://images.unsplash.com/photo-1514944298352-f43577d46816?q=80&w=800', 30, TRUE),
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005', 'Papas Fritas Sazonadas Wingstop', 'papas-fritas-sazonadas', 'Papas corte natural con nuestro sazonador secreto dulce y especiado.', 65.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=800', NULL, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Global Modifier Groups
INSERT INTO public.modifier_groups (id, product_id, name, min_selection, max_selection, is_required, is_active)
VALUES
  ('d0000000-0000-0000-0000-000000000001', NULL, 'Elige tus Sabores (Heat-O-Meter)', 1, 2, TRUE, TRUE),
  ('d0000000-0000-0000-0000-000000000002', NULL, 'Aderezos Artesanales', 0, 4, FALSE, TRUE),
  ('d0000000-0000-0000-0000-000000000003', NULL, 'Complementos & Sides', 0, 2, FALSE, TRUE),
  ('d0000000-0000-0000-0000-000000000004', NULL, 'Bebidas Frías', 0, 1, FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Modifier Options: 11 Flavors (Heat Level 0 to 5)
INSERT INTO public.modifier_options (id, group_id, name, extra_price, heat_level, is_available)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Garlic Parmesan', 0.00, 0, TRUE),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Hawaiian', 0.00, 0, TRUE),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Lemon Pepper', 0.00, 1, TRUE),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'Hickory Smoked BBQ', 0.00, 1, TRUE),
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 'Mild', 0.00, 1, TRUE),
  ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', 'Louisiana Rub (Dry Rub)', 0.00, 2, TRUE),
  ('e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000001', 'Spicy Korean Q', 0.00, 2, TRUE),
  ('e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000001', 'Original Hot', 0.00, 3, TRUE),
  ('e0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000001', 'Cajun', 0.00, 3, TRUE),
  ('e0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000001', 'Mango Habanero', 0.00, 4, TRUE),
  ('e0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000001', 'Atomic 🔥', 0.00, 5, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Modifier Options: Dips
INSERT INTO public.modifier_options (id, group_id, name, extra_price, heat_level, is_available)
VALUES
  ('e0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000002', 'Ranch Hecho en Casa (2 oz)', 25.00, 0, TRUE),
  ('e0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000002', 'Blue Cheese Artesanal (2 oz)', 29.00, 0, TRUE),
  ('e0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000002', 'Honey Mustard', 25.00, 0, TRUE),
  ('e0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000002', 'Queso Cheddar Caliente', 32.00, 0, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Modifier Options: Complementos
INSERT INTO public.modifier_options (id, group_id, name, extra_price, heat_level, is_available)
VALUES
  ('e0000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000003', 'Papas Fritas Sazonadas (Regulares)', 65.00, 0, TRUE),
  ('e0000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000003', 'Veggie Sticks (Zanahoria y Apio)', 39.00, 0, TRUE),
  ('e0000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000003', 'Aros de Cebolla Crujientes', 79.00, 0, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Modifier Options: Bebidas
INSERT INTO public.modifier_options (id, group_id, name, extra_price, heat_level, is_available)
VALUES
  ('e0000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000004', 'Coca-Cola Original 600 ml', 38.00, 0, TRUE),
  ('e0000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000004', 'Sprite 600 ml', 38.00, 0, TRUE),
  ('e0000000-0000-0000-0000-000000000021', 'd0000000-0000-0000-0000-000000000004', 'Cerveza Corona Extra 355 ml', 55.00, 0, TRUE)
ON CONFLICT (id) DO NOTHING;
