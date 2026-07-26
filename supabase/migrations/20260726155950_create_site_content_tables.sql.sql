/*
# Create site content tables (services, portfolio, testimonials, site_config)

1. Purpose
   This migration creates the tables that hold all editable customer-facing
   content for the wall-panels / PVC / wood-alternative / marble-alternative /
   demountable panels site. Everything the customer sees — brand, logo, hero
   image, services, portfolio gallery, testimonials — is stored here so it can
   be edited from the admin panel without touching code.

2. New Tables
   - `site_config` (single-row): brand name, logo text, tagline, hero image url,
     phone, email, address, social links, about text, order-form intro text.
   - `services`: ordered list of service cards (icon emoji, title, description).
   - `portfolio_items`: gallery items (image url, title, category, location).
   - `testimonials`: customer reviews (name, role, text, rating, avatar url).

3. Security
   This is a single-tenant app with NO sign-in screen, so all tables use
   `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because
   the content is intentionally public and editable by anyone with the anon key.
   RLS is still enabled on every table per policy.

4. Notes
   - `site_config` is constrained to a single row via a unique index on a
     fixed boolean column.
   - All tables include `created_at` and `updated_at` timestamps.
   - `services` and `portfolio_items` have a `sort_order` column for ordering.
*/

CREATE TABLE IF NOT EXISTS site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  single_row boolean NOT NULL DEFAULT true,
  brand_name text NOT NULL DEFAULT 'ديكو بانيلز',
  brand_logo text NOT NULL DEFAULT 'DP',
  tagline text NOT NULL DEFAULT 'ألواح جدارية احترافية — بلاكو بلاتر، بديل الخشب، بديل الرخام، PVC، ديمونطابل',
  hero_image text NOT NULL DEFAULT 'https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=1600',
  phone text NOT NULL DEFAULT '0770000000',
  email text NOT NULL DEFAULT 'info@decopanels.com',
  address text NOT NULL DEFAULT 'بغداد، العراق',
  instagram text NOT NULL DEFAULT '#',
  facebook text NOT NULL DEFAULT '#',
  whatsapp text NOT NULL DEFAULT '#',
  about_text text NOT NULL DEFAULT 'نقدم حلول الألواح الجدارية الاحترافية لجميع المساحات. لدينا خبرة في تركيب وتصميم البلاكو بلاتر، بدائل الخشب، بدائل الرخام، ألواح PVC، والديمونطابل. نلتزم بالعمل الاحترافي والتسليم في الوقت المناسب.',
  order_intro text NOT NULL DEFAULT 'املأ النموذج التالي وسنتواصل معك في أقرب وقت',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_site_config" ON site_config;
CREATE POLICY "anon_select_site_config" ON site_config FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_site_config" ON site_config;
CREATE POLICY "anon_insert_site_config" ON site_config FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_site_config" ON site_config;
CREATE POLICY "anon_update_site_config" ON site_config FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_site_config" ON site_config;
CREATE POLICY "anon_delete_site_config" ON site_config FOR DELETE
  TO anon, authenticated USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS site_config_single_row_idx ON site_config (single_row);

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT '🪟',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_services" ON services;
CREATE POLICY "anon_insert_services" ON services FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image text NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'تجديد',
  location text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_portfolio" ON portfolio_items;
CREATE POLICY "anon_select_portfolio" ON portfolio_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_portfolio" ON portfolio_items;
CREATE POLICY "anon_insert_portfolio" ON portfolio_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_portfolio" ON portfolio_items;
CREATE POLICY "anon_update_portfolio" ON portfolio_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_portfolio" ON portfolio_items;
CREATE POLICY "anon_delete_portfolio" ON portfolio_items FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  text text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar text NOT NULL DEFAULT 'https://images.pexels.com/photos/220617/pexels-photo-220617.jpeg?auto=compress&cs=tinysrgb&w=200',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_testimonials" ON testimonials;
CREATE POLICY "anon_select_testimonials" ON testimonials FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_testimonials" ON testimonials;
CREATE POLICY "anon_insert_testimonials" ON testimonials FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_testimonials" ON testimonials;
CREATE POLICY "anon_update_testimonials" ON testimonials FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_testimonials" ON testimonials;
CREATE POLICY "anon_delete_testimonials" ON testimonials FOR DELETE
  TO anon, authenticated USING (true);

-- Seed default services
INSERT INTO services (icon, title, description, sort_order) VALUES
  ('🪟', 'بلاكو بلاتر', 'تركيب ألواح البلاكو بلاتر بجميع الألوان والتشطيبات', 1),
  ('🪵', 'بديل الخشب', 'ألواح بديل الخشب عالية الجودة بمظهر طبيعي', 2),
  ('🟤', 'بديل الرخام', 'ألواح بديل الرخام بتشطيبات راقية وفاخرة', 3),
  ('🔷', 'ألواح PVC', 'ألواح PVC مقاومة للماء والرطوبة', 4),
  ('🔧', 'ديمونطابل', 'ألواح ديمونطابل قابلة للفك والتركيب', 5),
  ('🎨', 'تصميم وتركيب', 'تصميم وتركيب احترافي لجميع المساحات', 6)
ON CONFLICT DO NOTHING;

-- Seed default portfolio items
INSERT INTO portfolio_items (image, title, category, location, sort_order) VALUES
  ('https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=800', 'غرفة معيشة بلاكو بلاتر', 'بلاكو بلاتر', 'بغداد', 1),
  ('https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=800', 'جدار بديل الخشب', 'بديل الخشب', 'المنصور', 2),
  ('https://images.pexels.com/photos/6585756/pexels-photo-6585756.jpeg?auto=compress&cs=tinysrgb&w=800', 'مدخل بديل الرخام', 'بديل الرخام', 'الكرادة', 3),
  ('https://images.pexels.com/photos/6585755/pexels-photo-6585755.jpeg?auto=compress&cs=tinysrgb&w=800', 'مطبخ ألواح PVC', 'PVC', 'الجادرية', 4),
  ('https://images.pexels.com/photos/6585754/pexels-photo-6585754.jpeg?auto=compress&cs=tinysrgb&w=800', 'مكتب ديمونطابل', 'ديمونطابل', 'البصرة', 5),
  ('https://images.pexels.com/photos/6585753/pexels-photo-6585753.jpeg?auto=compress&cs=tinysrgb&w=800', 'غرفة نوم بلاكو بلاتر', 'بلاكو بلاتر', 'أربيل', 6),
  ('https://images.pexels.com/photos/6585752/pexels-photo-6585752.jpeg?auto=compress&cs=tinysrgb&w=800', 'استقبال بديل الرخام', 'بديل الرخام', 'النجف', 7),
  ('https://images.pexels.com/photos/6585751/pexels-photo-6585751.jpeg?auto=compress&cs=tinysrgb&w=800', 'مطعم ألواح PVC', 'PVC', 'كربلاء', 8)
ON CONFLICT DO NOTHING;

-- Seed default testimonials
INSERT INTO testimonials (name, role, text, rating, avatar, sort_order) VALUES
  ('أحمد العبيدي', 'صاحب منزل', 'عمل احترافي وتم التسليم في الوقت المحدد. الجودة ممتازة والأسعار مناسبة.', 5, 'https://images.pexels.com/photos/220617/pexels-photo-220617.jpeg?auto=compress&cs=tinysrgb&w=200', 1),
  ('سارة الحسن', 'مصممة ديكور', 'تعاملت معهم في أكثر من مشروع والنتيجة دائماً تفوق التوقعات. أنصح بالتعامل معهم.', 5, 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', 2),
  ('محمد الكناني', 'صاحب مطعم', 'ركبوا ألواح PVC في المطعم والنتيجة رائعة. عمل مرتب ونظيف وفي الوقت المناسب.', 5, 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200', 3)
ON CONFLICT DO NOTHING;

-- Seed default site_config (single row)
INSERT INTO site_config (single_row) VALUES (true)
ON CONFLICT DO NOTHING;
