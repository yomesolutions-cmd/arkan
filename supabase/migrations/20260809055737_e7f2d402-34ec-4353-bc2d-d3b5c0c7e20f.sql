-- 1. SITE CONTENT
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL UNIQUE,
  data_en jsonb NOT NULL DEFAULT '{}'::jsonb,
  data_ar jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site content is public" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert site content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update site content" ON public.site_content FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete site content" ON public.site_content FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. TESTIMONIALS
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  role_en text NOT NULL DEFAULT '',
  role_ar text NOT NULL DEFAULT '',
  quote_en text NOT NULL,
  quote_ar text NOT NULL DEFAULT '',
  rating numeric NOT NULL DEFAULT 5,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active testimonials are public" ON public.testimonials FOR SELECT TO anon USING (is_active);
CREATE POLICY "Users read testimonials" ON public.testimonials FOR SELECT TO authenticated USING (is_active OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. SUBSCRIBERS
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  locale text NOT NULL DEFAULT 'ar',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.subscribers TO anon;
GRANT SELECT, INSERT, DELETE ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read subscribers" ON public.subscribers FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete subscribers" ON public.subscribers FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- 4. CHAT LOGS
CREATE TABLE public.chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  node_id uuid,
  node_label text NOT NULL,
  locale text NOT NULL DEFAULT 'ar',
  depth integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.chat_logs TO anon;
GRANT SELECT, INSERT, DELETE ON public.chat_logs TO authenticated;
GRANT ALL ON public.chat_logs TO service_role;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log chat clicks" ON public.chat_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read chat logs" ON public.chat_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete chat logs" ON public.chat_logs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE INDEX chat_logs_session_idx ON public.chat_logs (session_id, created_at);

-- 5. ARABIC COLUMNS
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS name_ar text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS country_ar text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS description_ar text;
ALTER TABLE public.tour_packages ADD COLUMN IF NOT EXISTS title_ar text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS place_ar text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS description_ar text;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS name_ar text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS city_ar text NOT NULL DEFAULT '';
ALTER TABLE public.flights ADD COLUMN IF NOT EXISTS airline_ar text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS from_city_ar text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS to_city_ar text NOT NULL DEFAULT '';
ALTER TABLE public.question_nodes ADD COLUMN IF NOT EXISTS label_ar text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS answer_ar text;

-- 6. ADMIN WRITE ACCESS TO CATALOG
CREATE POLICY "Admins manage destinations" ON public.destinations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage tour packages" ON public.tour_packages FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage hotels" ON public.hotels FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage flights" ON public.flights FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 7. ADMIN CAN SEE USERS AND BOOKINGS
CREATE POLICY "Admins read profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read bookings" ON public.bookings FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- 8. SEED CONTENT
INSERT INTO public.site_content (section, data_en, data_ar) VALUES
('hero',
 '{"eyebrow":"Explore the world","title":"Find your next unforgettable journey","subtitle":"Handpicked tours, flights and hotels across the world, curated by Arkan Travel.","cta":"Start searching"}',
 '{"eyebrow":"اكتشف العالم","title":"ابحث عن رحلتك القادمة التي لا تُنسى","subtitle":"رحلات وطيران وفنادق مختارة بعناية حول العالم من أركان للسفر.","cta":"ابدأ البحث"}'),
('about',
 '{"eyebrow":"About us","title":"Travel made simple, warm and personal","body":"Arkan Travel has been crafting journeys for over a decade. From family holidays to business trips, our team handles every detail so you can simply enjoy the ride.","stat1_value":"12k+","stat1_label":"Happy travellers","stat2_value":"85","stat2_label":"Destinations","stat3_value":"4.9","stat3_label":"Average rating"}',
 '{"eyebrow":"من نحن","title":"سفر بسيط ودافئ وشخصي","body":"تصنع أركان للسفر الرحلات منذ أكثر من عشر سنوات. من العطلات العائلية إلى رحلات العمل، يتولى فريقنا كل التفاصيل لتستمتع أنت فقط بالرحلة.","stat1_value":"+12 ألف","stat1_label":"مسافر سعيد","stat2_value":"85","stat2_label":"وجهة","stat3_value":"4.9","stat3_label":"متوسط التقييم"}'),
('testimonials_header',
 '{"eyebrow":"Testimonials","title":"What our travellers say","subtitle":"Real words from people who travelled with Arkan."}',
 '{"eyebrow":"آراء العملاء","title":"ماذا يقول مسافرونا","subtitle":"كلمات حقيقية من أشخاص سافروا مع أركان."}'),
('newsletter',
 '{"title":"Get travel deals in your inbox","subtitle":"Subscribe for handpicked offers. No spam, unsubscribe anytime.","cta":"Subscribe","placeholder":"Your email address"}',
 '{"title":"احصل على عروض السفر في بريدك","subtitle":"اشترك لتصلك عروض مختارة. بدون رسائل مزعجة، ويمكنك إلغاء الاشتراك في أي وقت.","cta":"اشترك","placeholder":"بريدك الإلكتروني"}');

INSERT INTO public.testimonials (name_en, name_ar, role_en, role_ar, quote_en, quote_ar, rating, sort_order) VALUES
('Sarah Malik','سارة مالك','Family trip to Istanbul','رحلة عائلية إلى إسطنبول','Everything was organised perfectly. The hotel was beautiful and the guide was so kind to our kids.','كان كل شيء منظماً بشكل مثالي. الفندق كان جميلاً والمرشد كان لطيفاً جداً مع أطفالنا.',5,1),
('Omar Haddad','عمر حداد','Business travel','سفر عمل','Booked a last-minute flight and got a better price than anywhere else. Support answered in minutes.','حجزت رحلة في اللحظة الأخيرة وحصلت على سعر أفضل من أي مكان آخر. خدمة العملاء ردت خلال دقائق.',5,2),
('Lina Kassem','لينا قاسم','Honeymoon in the Maldives','شهر عسل في المالديف','The Maldives package was a dream. Every detail was handled and we just enjoyed ourselves.','باقة المالديف كانت حلماً. كل التفاصيل تم الاعتناء بها ونحن استمتعنا فقط.',5,3);