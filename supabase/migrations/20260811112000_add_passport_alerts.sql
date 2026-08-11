CREATE TABLE public.passport_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  traveler_name text NOT NULL,
  phone text NOT NULL,
  email text,
  passport_number text,
  passport_country text,
  passport_image_url text,
  expires_on date NOT NULL,
  reminder_days_before integer NOT NULL DEFAULT 30,
  sms_message text,
  sms_sent_at timestamptz,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.passport_alerts TO authenticated;
GRANT ALL ON public.passport_alerts TO service_role;

ALTER TABLE public.passport_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage passport alerts" ON public.passport_alerts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER passport_alerts_updated_at BEFORE UPDATE ON public.passport_alerts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX passport_alerts_expires_on_idx ON public.passport_alerts (expires_on);
CREATE INDEX passport_alerts_sms_due_idx ON public.passport_alerts (sms_sent_at, expires_on);
