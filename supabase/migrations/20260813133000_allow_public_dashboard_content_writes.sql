-- Allow the intentionally public /amin dashboard to manage public website content
-- without requiring a signed-in Supabase admin user.
--
-- This is limited to public marketing/catalog/chat-question tables. Private customer
-- data tables such as profiles, bookings, subscribers, chat_logs, appointments, and
-- passport_alerts remain protected.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.destinations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tour_packages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotels TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flights TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_nodes TO anon;

CREATE POLICY "Public dashboard manages site content"
ON public.site_content FOR ALL TO anon
USING (true) WITH CHECK (true);

CREATE POLICY "Public dashboard manages testimonials"
ON public.testimonials FOR ALL TO anon
USING (true) WITH CHECK (true);

CREATE POLICY "Public dashboard manages destinations"
ON public.destinations FOR ALL TO anon
USING (true) WITH CHECK (true);

CREATE POLICY "Public dashboard manages tour packages"
ON public.tour_packages FOR ALL TO anon
USING (true) WITH CHECK (true);

CREATE POLICY "Public dashboard manages hotels"
ON public.hotels FOR ALL TO anon
USING (true) WITH CHECK (true);

CREATE POLICY "Public dashboard manages flights"
ON public.flights FOR ALL TO anon
USING (true) WITH CHECK (true);

CREATE POLICY "Public dashboard manages question nodes"
ON public.question_nodes FOR ALL TO anon
USING (true) WITH CHECK (true);
