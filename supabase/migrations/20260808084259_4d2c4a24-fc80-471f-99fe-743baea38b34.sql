CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

CREATE POLICY "Users can read own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.question_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.question_nodes(id) ON DELETE CASCADE,
  label text NOT NULL,
  answer text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX question_nodes_parent_idx ON public.question_nodes(parent_id);

GRANT SELECT ON public.question_nodes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_nodes TO authenticated;
GRANT ALL ON public.question_nodes TO service_role;
ALTER TABLE public.question_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active questions are public" ON public.question_nodes
FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert questions" ON public.question_nodes
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update questions" ON public.question_nodes
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete questions" ON public.question_nodes
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER question_nodes_updated_at BEFORE UPDATE ON public.question_nodes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.question_nodes (id, parent_id, label, answer, sort_order) VALUES
('11111111-1111-4111-8111-000000000001', NULL, 'Booking & payments', NULL, 1),
('11111111-1111-4111-8111-000000000002', NULL, 'Trips & destinations', NULL, 2),
('11111111-1111-4111-8111-000000000003', NULL, 'Account & support', NULL, 3),
('22222222-2222-4222-8222-000000000001', '11111111-1111-4111-8111-000000000001', 'How do I book a trip?', NULL, 1),
('22222222-2222-4222-8222-000000000002', '11111111-1111-4111-8111-000000000001', 'Cancellations & refunds', NULL, 2),
('22222222-2222-4222-8222-000000000003', '11111111-1111-4111-8111-000000000002', 'Popular destinations', NULL, 1),
('22222222-2222-4222-8222-000000000004', '11111111-1111-4111-8111-000000000003', 'Contact a human', 'Email us at hello@arkantravel.com or call +90 555 000 0000. We reply within 24 hours.', 1),
('33333333-3333-4333-8333-000000000001', '22222222-2222-4222-8222-000000000001', 'Booking a tour package', 'Open Search, pick the Tours tab, choose a package and press Book. Your request appears in your dashboard as pending.', 1),
('33333333-3333-4333-8333-000000000002', '22222222-2222-4222-8222-000000000001', 'Booking a flight or hotel', 'Use the Flights or Hotels tab in Search, filter by price or stops, then press Book on the option you like.', 2),
('33333333-3333-4333-8333-000000000003', '22222222-2222-4222-8222-000000000002', 'How do I cancel?', 'Go to your dashboard, find the booking and press Cancel. The status changes to cancelled immediately.', 1),
('33333333-3333-4333-8333-000000000004', '22222222-2222-4222-8222-000000000003', 'Best time to visit', 'Spring and autumn offer the mildest weather and the best prices across most of our destinations.', 1);