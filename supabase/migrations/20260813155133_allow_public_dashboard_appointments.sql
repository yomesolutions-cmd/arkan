-- Allow the intentionally public /amin dashboard to manage appointments
-- without requiring a signed-in Supabase admin user.
--
-- Warning: appointments include customer names, phones, emails, notes, and times.
-- This makes appointment list/create/update/delete available to anyone who can
-- open the public dashboard URL.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO anon;

DROP POLICY IF EXISTS "Public dashboard manages appointments" ON public.appointments;

CREATE POLICY "Public dashboard manages appointments"
ON public.appointments FOR ALL TO anon
USING (true) WITH CHECK (true);
