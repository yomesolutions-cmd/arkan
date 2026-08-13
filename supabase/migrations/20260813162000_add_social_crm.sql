-- CRM module for social media conversations, leads, and channel-specific
-- question trees used by the public /amin dashboard.

ALTER TABLE public.question_nodes
ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'website',
ADD COLUMN IF NOT EXISTS shortcut text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS is_lead boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  phone text,
  email text,
  channel text NOT NULL DEFAULT 'website',
  status text NOT NULL DEFAULT 'new',
  source_question_id uuid REFERENCES public.question_nodes(id) ON DELETE SET NULL,
  last_message text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL DEFAULT 'facebook',
  contact_name text NOT NULL DEFAULT '',
  contact_handle text,
  status text NOT NULL DEFAULT 'open',
  lead_id uuid REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  last_message text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.social_conversations(id) ON DELETE CASCADE,
  direction text NOT NULL DEFAULT 'inbound',
  body text NOT NULL,
  external_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_leads_channel_idx ON public.crm_leads(channel);
CREATE INDEX IF NOT EXISTS crm_leads_status_idx ON public.crm_leads(status);
CREATE INDEX IF NOT EXISTS social_conversations_channel_idx ON public.social_conversations(channel);
CREATE INDEX IF NOT EXISTS social_messages_conversation_idx ON public.social_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS question_nodes_channel_idx ON public.question_nodes(channel);

CREATE TRIGGER crm_leads_updated_at BEFORE UPDATE ON public.crm_leads
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER social_conversations_updated_at BEFORE UPDATE ON public.social_conversations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_conversations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_messages TO anon;

DROP POLICY IF EXISTS "Public dashboard manages CRM leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Public dashboard manages social conversations" ON public.social_conversations;
DROP POLICY IF EXISTS "Public dashboard manages social messages" ON public.social_messages;

CREATE POLICY "Public dashboard manages CRM leads"
ON public.crm_leads FOR ALL TO anon
USING (true) WITH CHECK (true);

CREATE POLICY "Public dashboard manages social conversations"
ON public.social_conversations FOR ALL TO anon
USING (true) WITH CHECK (true);

CREATE POLICY "Public dashboard manages social messages"
ON public.social_messages FOR ALL TO anon
USING (true) WITH CHECK (true);

INSERT INTO public.crm_leads (full_name, phone, email, channel, status, last_message, notes)
VALUES
  ('Demo Facebook Lead', '+970 59 000 1001', 'facebook.lead@example.com', 'facebook', 'new', 'Interested in Istanbul honeymoon packages.', 'Imported demo lead for CRM preview.'),
  ('Demo WhatsApp Lead', '+970 59 000 1002', null, 'whatsapp', 'qualified', 'Needs visa support and hotel booking.', 'Follow up with package price.'),
  ('Demo Instagram Lead', null, 'instagram.lead@example.com', 'instagram', 'contacted', 'Asked about summer family tours.', 'Send family tour catalog.');

WITH inserted_conversations AS (
  INSERT INTO public.social_conversations (channel, contact_name, contact_handle, status, last_message, last_message_at)
  VALUES
    ('facebook', 'Facebook Visitor', '@fb-traveler', 'open', 'Can you send Istanbul trip options?', now() - interval '2 hours'),
    ('whatsapp', 'WhatsApp Client', '+970590001002', 'open', 'I need a visa appointment this week.', now() - interval '45 minutes'),
    ('instagram', 'Instagram Traveler', '@arkan_guest', 'pending', 'Do you have Maldives offers?', now() - interval '20 minutes')
  RETURNING id, channel
)
INSERT INTO public.social_messages (conversation_id, direction, body, created_at)
SELECT id, 'inbound', 'Can you help me choose the best travel package?', now() - interval '15 minutes'
FROM inserted_conversations;
