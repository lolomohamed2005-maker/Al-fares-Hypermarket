/**
-- ============================================================================
-- AL FARES HYPER MARKET | الفارس هايبر ماركت
-- SUPABASE COMPLETE DATABASE SCHEMA, RLS POLICIES, STORAGE & SEED DATA
-- ============================================================================
*/
export const SUPABASE_SCHEMA_SQL = `-- ============================================================================
-- AL FARES HYPER MARKET | الفارس هايبر ماركت
-- SUPABASE COMPLETE DATABASE SCHEMA, RLS POLICIES, STORAGE & SEED DATA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE (التصنيفات والأقسام)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT ('cat-' || extract(epoch from now())::bigint::text),
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'ShoppingBasket',
    image TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- 2. PRODUCTS TABLE (المنتجات والمخزون)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || extract(epoch from now())::bigint::text),
    name TEXT NOT NULL,
    category_id TEXT,
    description TEXT DEFAULT '',
    barcode TEXT DEFAULT '',
    purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_price NUMERIC(12, 2),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_alert INTEGER NOT NULL DEFAULT 5,
    supplier_name TEXT DEFAULT '',
    expiry_date TEXT,
    image TEXT DEFAULT '',
    unit TEXT NOT NULL DEFAULT 'قطعة',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sales_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 3. BRANCHES TABLE (إدارة الفروع)
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY DEFAULT ('branch-' || extract(epoch from now())::bigint::text),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_main BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_branches_is_active ON public.branches(is_active);

-- 4. ORDERS TABLE (الطلبات والمبيعات)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ORD-' || extract(epoch from now())::bigint::text),
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_type TEXT NOT NULL DEFAULT 'delivery',
    delivery_address TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery',
    status TEXT NOT NULL DEFAULT 'received',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 5. STOCK MOVEMENTS (سجل حركات الجرد والمخزن)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id TEXT PRIMARY KEY DEFAULT ('mov-' || extract(epoch from now())::bigint::text),
    product_id TEXT,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity_changed INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. EMPLOYEE LOANS (سلف وعهد الموظفين)
CREATE TABLE IF NOT EXISTS public.employee_loans (
    id TEXT PRIMARY KEY DEFAULT ('loan-' || extract(epoch from now())::bigint::text),
    person_name TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    recorded_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. EXPENSES (المصروفات اليومية والفواتير)
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY DEFAULT ('exp-' || extract(epoch from now())::bigint::text),
    title TEXT,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    date TEXT NOT NULL,
    paid_by TEXT NOT NULL,
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. SUPPLIERS (الموردين والحسابات الآجلة)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY DEFAULT ('sup-' || extract(epoch from now())::bigint::text),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    products_supplied TEXT,
    total_demanded NUMERIC(12, 2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
    remaining_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- 9.1 Categories Policies
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert categories" ON public.categories;
CREATE POLICY "Anyone can insert categories" ON public.categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update categories" ON public.categories;
CREATE POLICY "Anyone can update categories" ON public.categories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete categories" ON public.categories;
CREATE POLICY "Anyone can delete categories" ON public.categories FOR DELETE USING (true);

-- 9.2 Products Policies
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert products" ON public.products;
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update products" ON public.products;
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete products" ON public.products;
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

-- 9.3 Branches Policies
DROP POLICY IF EXISTS "Public can view branches" ON public.branches;
CREATE POLICY "Public can view branches" ON public.branches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can manage branches" ON public.branches;
CREATE POLICY "Anyone can manage branches" ON public.branches FOR ALL USING (true);

-- 9.4 Orders Policies
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
CREATE POLICY "Public can view orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update orders" ON public.orders;
CREATE POLICY "Public can update orders" ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can delete orders" ON public.orders;
CREATE POLICY "Public can delete orders" ON public.orders FOR DELETE USING (true);

-- 9.5 Internal Tables Policies
DROP POLICY IF EXISTS "Allow stock_movements" ON public.stock_movements;
CREATE POLICY "Allow stock_movements" ON public.stock_movements FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow employee_loans" ON public.employee_loans;
CREATE POLICY "Allow employee_loans" ON public.employee_loans FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow expenses" ON public.expenses;
CREATE POLICY "Allow expenses" ON public.expenses FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow suppliers" ON public.suppliers;
CREATE POLICY "Allow suppliers" ON public.suppliers FOR ALL USING (true);

-- 10. REALTIME CONFIGURATION
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.branches;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- 11. SUPABASE STORAGE BUCKET (FOR PRODUCT IMAGES)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access to Product Images'
  ) THEN
    CREATE POLICY "Public Access to Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow uploading images to product-images'
  ) THEN
    CREATE POLICY "Allow uploading images to product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow updating images in product-images'
  ) THEN
    CREATE POLICY "Allow updating images in product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow deleting images in product-images'
  ) THEN
    CREATE POLICY "Allow deleting images in product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
  END IF;
END $$;

-- 12. INITIAL SEED DATA
INSERT INTO public.branches (id, name, address, phone, is_active, is_main)
VALUES 
    ('branch-main', 'الفرع الرئيسي (بورصة الأسماك)', 'كفرالشيخ أمام بورصة الأسماك', '01010574689', true, true),
    ('branch-city', 'فرع وسط المدينة', 'كفرالشيخ - شارع النبوي المهندس', '01055753006', true, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (id, name, icon, description, is_active)
VALUES
    ('cat-1', 'مواد غذائية', 'Wheat', 'أرز، مكرونة، زيوت، سكر، وبقوليات طازجة', true),
    ('cat-2', 'مشروبات', 'Coffee', 'عصائر، مياه غازية، مياه معدنية، شاي وبن', true),
    ('cat-3', 'ألبان وجبن', 'Milk', 'حليب طازج، أجبان متنوعة، زبادي وزبدة', true),
    ('cat-4', 'حلويات', 'Cake', 'شوكولاتة، بسكويت، كيك وحلويات شرقية', true),
    ('cat-5', 'شيبسي وسناكس', 'Popcorn', 'مقرمشات، شيبس، مكسرات وتسالي', true),
    ('cat-6', 'خضار وفاكهة', 'Apple', 'خضروات وفواكه طازجة يومياً بأعلى جودة', true),
    ('cat-7', 'لحوم ودواجن', 'Beef', 'لحوم بلدي طازجة، دواجن، ومصنعات لحوم', true),
    ('cat-8', 'منظفات', 'Sparkles', 'مساحيق غسيل، مطهرات، ومنظفات أطباق', true),
    ('cat-9', 'عناية شخصية', 'Heart', 'شامبو، صابون، معجون أسنان وعناية بالبشرة', true),
    ('cat-10', 'منتجات الأطفال', 'Baby', 'حفاضات، أطعمة رضع، ومستلزمات العناية بالطفل', true),
    ('cat-11', 'أدوات منزلية', 'Home', 'مستلزمات مطبخ، أواني، وبلاستيكيات منزلية', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (
    id, name, category_id, description, barcode, purchase_price, selling_price,
    discount_price, stock_quantity, min_stock_alert, supplier_name, expiry_date,
    image, unit, is_active, sales_count
) VALUES
    ('prod-1', 'أرز مصري فاخر الضحى 5 كجم', 'cat-1', 'أرز أبيض مصري نقي حبة عريضة عالي الجودة منتقى بعناية وخالٍ من الشوائب', '6221001001015', 155, 195, 179, 45, 15, 'شركة الضحى للصناعات الغذائية', '2027-05-15', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 'كيس 5 كجم', true, 142),
    ('prod-2', 'زيت دوار الشمس عافية 1.6 لتر', 'cat-1', 'زيت ذرة نقي 100% غني بفيتامينات أ و د مثالي للطبخ والقلي الخفيف', '6221001001022', 92, 118, 105, 32, 10, 'شركة صافولا للأغذية', '2027-04-20', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', 'زجاجة 1.6 لتر', true, 120),
    ('prod-3', 'مكرونة إيطاليانو مشكلة 400 جم', 'cat-1', 'مكرونة مصنوعة من سيمولينا القمح الصلب 100% متماسكة ولذيذة عند الطهي', '6221001001039', 18, 26, 22, 90, 25, 'شركة إيديتا ومطاحن إيطاليانو', '2027-08-10', 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80', 'كيس 400 جم', true, 230),
    ('prod-4', 'حليب جهينة كامل الدسم 1 لتر', 'cat-3', 'حليب بقري طبيعي مبستر ومعقم طويل الأجل غني بالكالسيوم والبروتين', '6221002002012', 34, 45, 41, 28, 15, 'شركة جهينة للصناعات الغذائية', '2026-11-30', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', 'عبوة 1 لتر', true, 310),
    ('prod-5', 'جبنة فيتا دومتي بلس 500 جم', 'cat-3', 'جبن أبيض نباتي الدهن طري ولذيذ للإفطار والعشاء، قوام كريمي رائع', '6221002002029', 32, 44, NULL, 40, 12, 'شركة دومتي للصناعات الغذائية', '2026-12-15', 'https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&w=600&q=80', 'علبة 500 جم', true, 185),
    ('prod-6', 'عصير برتقال بيتي توب تروبيكال 1 لتر', 'cat-2', 'عصير برتقال طبيعي غني بفيتامين ج بدون مواد حافظة منعش لكل العائلة', '6221003003019', 22, 30, 26, 50, 15, 'شركة المراعي وبيتي', '2027-02-10', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80', 'لتر', true, 95),
    ('prod-7', 'شاي العروسة ناعم 250 جم', 'cat-2', 'شاي أسود أسود كيني فاخر بنكهة غنية قوية ولون مظبوط لمزاج رايق', '6221003003026', 42, 52, NULL, 65, 20, 'شركة بدوي جروب للشاي', '2028-01-01', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', 'باكيت 250 جم', true, 280),
    ('prod-8', 'شيبسي عائلي بطعم الجبنة المتبلة', 'cat-5', 'رقائق بطاطس طبيعية 100% مقرمشة ومتبلة بألذ بهارات الجبن الساحرة', '6221004004016', 11, 15, NULL, 110, 30, 'شركة شيبسي للصناعات الغذائية (بيبسيكو)', '2026-11-20', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80', 'كيس حجم عائلي', true, 420),
    ('prod-9', 'شوكولاتة كادبوري ديري ميلك بالبندق 90 جم', 'cat-4', 'شوكولاتة بالحليب غنية مع قطع البندق المحمص المقرمش تذوب في الفم', '6221005005013', 45, 60, 53, 38, 15, 'شركة مونديليز مصر', '2027-03-15', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80', 'قطعة 90 جم', true, 160),
    ('prod-10', 'طماطم بلدي فرز أول طازجة', 'cat-6', 'طماطم حمراء طازجة مقطوفة يومياً من المزرعة ممتازة للسلطات والطهي', '6221006006010', 12, 18, 15, 75, 20, 'مزارع الصالحية للخضار', '2026-09-15', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', 'كجم', true, 340)
ON CONFLICT (id) DO NOTHING;
`;
