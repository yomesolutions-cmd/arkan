CREATE TYPE public.appointment_status AS ENUM ('scheduled','done','cancelled');

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  customer_name text NOT NULL DEFAULT '',
  phone text,
  email text,
  notes text,
  starts_at timestamptz NOT NULL,
  duration_min integer NOT NULL DEFAULT 60,
  kind text NOT NULL DEFAULT 'consultation',
  status public.appointment_status NOT NULL DEFAULT 'scheduled',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage appointments" ON public.appointments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX appointments_starts_at_idx ON public.appointments (starts_at);