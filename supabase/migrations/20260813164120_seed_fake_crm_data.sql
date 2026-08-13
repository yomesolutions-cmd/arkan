-- Rich demo data for the public CRM dashboard.
-- This seed uses fixed IDs so it can be run repeatedly without duplicating rows.

DELETE FROM public.social_messages
WHERE conversation_id IN (
  '2a0a1000-0000-4000-9000-000000000101',
  '2a0a1000-0000-4000-9000-000000000102',
  '2a0a1000-0000-4000-9000-000000000103',
  '2a0a1000-0000-4000-9000-000000000104',
  '2a0a1000-0000-4000-9000-000000000105',
  '2a0a1000-0000-4000-9000-000000000106',
  '2a0a1000-0000-4000-9000-000000000107',
  '2a0a1000-0000-4000-9000-000000000108',
  '2a0a1000-0000-4000-9000-000000000109'
);

DELETE FROM public.social_conversations
WHERE id IN (
  '2a0a1000-0000-4000-9000-000000000101',
  '2a0a1000-0000-4000-9000-000000000102',
  '2a0a1000-0000-4000-9000-000000000103',
  '2a0a1000-0000-4000-9000-000000000104',
  '2a0a1000-0000-4000-9000-000000000105',
  '2a0a1000-0000-4000-9000-000000000106',
  '2a0a1000-0000-4000-9000-000000000107',
  '2a0a1000-0000-4000-9000-000000000108',
  '2a0a1000-0000-4000-9000-000000000109'
);

DELETE FROM public.crm_leads
WHERE id IN (
  '1a0a1000-0000-4000-9000-000000000101',
  '1a0a1000-0000-4000-9000-000000000102',
  '1a0a1000-0000-4000-9000-000000000103',
  '1a0a1000-0000-4000-9000-000000000104',
  '1a0a1000-0000-4000-9000-000000000105',
  '1a0a1000-0000-4000-9000-000000000106',
  '1a0a1000-0000-4000-9000-000000000107',
  '1a0a1000-0000-4000-9000-000000000108'
);

INSERT INTO public.crm_leads
  (id, full_name, phone, email, channel, status, last_message, notes, created_at, updated_at)
VALUES
  (
    '1a0a1000-0000-4000-9000-000000000101',
    'Maya Haddad',
    '+970 59 214 7788',
    'maya.haddad@example.com',
    'facebook',
    'new',
    'Looking for a 5-day Istanbul package for two adults.',
    'Prefers hotel near Taksim. Send Arabic itinerary and price today.',
    now() - interval '2 days 4 hours',
    now() - interval '2 hours'
  ),
  (
    '1a0a1000-0000-4000-9000-000000000102',
    'Ahmad Nasser',
    '+970 56 901 4412',
    null,
    'whatsapp',
    'qualified',
    'Needs a visa appointment and flight options for Dubai.',
    'Budget is flexible. He asked for payment in two parts.',
    now() - interval '1 day 7 hours',
    now() - interval '35 minutes'
  ),
  (
    '1a0a1000-0000-4000-9000-000000000103',
    'Rana Saleh',
    '+972 52 778 1904',
    'rana.saleh@example.com',
    'instagram',
    'contacted',
    'Asked about Maldives honeymoon offers in September.',
    'Send resort options with private pool and breakfast included.',
    now() - interval '3 days',
    now() - interval '1 day'
  ),
  (
    '1a0a1000-0000-4000-9000-000000000104',
    'Omar Khalil',
    '+970 59 332 8801',
    'omar.khalil@example.com',
    'website',
    'won',
    'Booked Antalya family package.',
    'Deposit received. Follow up with travel documents.',
    now() - interval '5 days',
    now() - interval '8 hours'
  ),
  (
    '1a0a1000-0000-4000-9000-000000000105',
    'Nour Abu Ali',
    '+970 59 611 3344',
    null,
    'whatsapp',
    'new',
    'Do you have umrah packages for next month?',
    'Needs details for mother and sister, 3 travelers total.',
    now() - interval '10 hours',
    now() - interval '10 minutes'
  ),
  (
    '1a0a1000-0000-4000-9000-000000000106',
    'Kareem Mansour',
    null,
    'kareem.mansour@example.com',
    'facebook',
    'lost',
    'Price is higher than expected.',
    'Reopen if Eid discount campaign starts.',
    now() - interval '9 days',
    now() - interval '6 days'
  ),
  (
    '1a0a1000-0000-4000-9000-000000000107',
    'Leen Darwish',
    '+970 59 804 2233',
    'leen.d@example.com',
    'instagram',
    'qualified',
    'Interested in Thailand group tour.',
    'Wants Arabic-speaking guide and flexible cancellation.',
    now() - interval '18 hours',
    now() - interval '42 minutes'
  ),
  (
    '1a0a1000-0000-4000-9000-000000000108',
    'Samer Zidan',
    '+970 56 700 3381',
    null,
    'website',
    'contacted',
    'Needs Schengen appointment help.',
    'Call after 6 PM. Has previous rejection, needs document checklist.',
    now() - interval '1 day',
    now() - interval '3 hours'
  );

INSERT INTO public.social_conversations
  (id, channel, contact_name, contact_handle, status, lead_id, last_message, last_message_at, created_at, updated_at)
VALUES
  (
    '2a0a1000-0000-4000-9000-000000000101',
    'facebook',
    'Maya Haddad',
    '@maya.travels',
    'open',
    '1a0a1000-0000-4000-9000-000000000101',
    'Great, send me the hotel names please.',
    now() - interval '12 minutes',
    now() - interval '2 days 4 hours',
    now() - interval '12 minutes'
  ),
  (
    '2a0a1000-0000-4000-9000-000000000102',
    'whatsapp',
    'Ahmad Nasser',
    '+970569014412',
    'open',
    '1a0a1000-0000-4000-9000-000000000102',
    'Can you reserve the earliest appointment?',
    now() - interval '35 minutes',
    now() - interval '1 day 7 hours',
    now() - interval '35 minutes'
  ),
  (
    '2a0a1000-0000-4000-9000-000000000103',
    'instagram',
    'Rana Saleh',
    '@rana_goes',
    'pending',
    'Private pool is important for us.',
    now() - interval '1 hour',
    now() - interval '3 days',
    now() - interval '1 hour'
  ),
  (
    '2a0a1000-0000-4000-9000-000000000104',
    'website',
    'Omar Khalil',
    'omar.khalil@example.com',
    'closed',
    'Thank you, I received the invoice.',
    now() - interval '8 hours',
    now() - interval '5 days',
    now() - interval '8 hours'
  ),
  (
    '2a0a1000-0000-4000-9000-000000000105',
    'whatsapp',
    'Nour Abu Ali',
    '+970596113344',
    'open',
    'Do you have umrah packages for next month?',
    now() - interval '10 minutes',
    now() - interval '10 hours',
    now() - interval '10 minutes'
  ),
  (
    '2a0a1000-0000-4000-9000-000000000106',
    'facebook',
    'Kareem Mansour',
    '@kareem.m',
    'closed',
    'I will wait for a discount.',
    now() - interval '6 days',
    now() - interval '9 days',
    now() - interval '6 days'
  ),
  (
    '2a0a1000-0000-4000-9000-000000000107',
    'instagram',
    'Leen Darwish',
    '@leen_trip',
    'open',
    'Does the Thailand trip include a guide?',
    now() - interval '42 minutes',
    now() - interval '18 hours',
    now() - interval '42 minutes'
  ),
  (
    '2a0a1000-0000-4000-9000-000000000108',
    'website',
    'Samer Zidan',
    '+970567003381',
    'pending',
    'Please call me after 6 PM.',
    now() - interval '3 hours',
    now() - interval '1 day',
    now() - interval '3 hours'
  ),
  (
    '2a0a1000-0000-4000-9000-000000000109',
    'facebook',
    'Hiba Yasin',
    '@hiba.family',
    'open',
    null,
    'مرحبا، بدي برنامج عائلي لتركيا.',
    now() - interval '5 minutes',
    now() - interval '4 hours',
    now() - interval '5 minutes'
  );

INSERT INTO public.social_messages
  (id, conversation_id, direction, body, external_id, created_at)
VALUES
  ('3a0a1000-0000-4000-9000-000000000101', '2a0a1000-0000-4000-9000-000000000101', 'inbound', 'Hi, I need Istanbul for two adults, 5 days.', 'arkan-demo:fb:101:1', now() - interval '2 days 4 hours'),
  ('3a0a1000-0000-4000-9000-000000000102', '2a0a1000-0000-4000-9000-000000000101', 'outbound', 'Sure. Do you prefer shopping, tours, or a relaxed hotel stay?', 'arkan-demo:fb:101:2', now() - interval '2 days 3 hours 48 minutes'),
  ('3a0a1000-0000-4000-9000-000000000103', '2a0a1000-0000-4000-9000-000000000101', 'inbound', 'Shopping and a clean hotel near Taksim.', 'arkan-demo:fb:101:3', now() - interval '1 day 23 hours'),
  ('3a0a1000-0000-4000-9000-000000000104', '2a0a1000-0000-4000-9000-000000000101', 'outbound', 'I can prepare three hotel options with flights and transfer.', 'arkan-demo:fb:101:4', now() - interval '1 hour'),
  ('3a0a1000-0000-4000-9000-000000000105', '2a0a1000-0000-4000-9000-000000000101', 'inbound', 'Great, send me the hotel names please.', 'arkan-demo:fb:101:5', now() - interval '12 minutes'),

  ('3a0a1000-0000-4000-9000-000000000201', '2a0a1000-0000-4000-9000-000000000102', 'inbound', 'السلام عليكم، بدي موعد فيزا دبي بأسرع وقت.', 'arkan-demo:wa:102:1', now() - interval '1 day 7 hours'),
  ('3a0a1000-0000-4000-9000-000000000202', '2a0a1000-0000-4000-9000-000000000102', 'outbound', 'وعليكم السلام. كم مسافر ومعك جواز ساري؟', 'arkan-demo:wa:102:2', now() - interval '1 day 6 hours 40 minutes'),
  ('3a0a1000-0000-4000-9000-000000000203', '2a0a1000-0000-4000-9000-000000000102', 'inbound', 'مسافر واحد، الجواز صالح سنتين.', 'arkan-demo:wa:102:3', now() - interval '1 day 5 hours'),
  ('3a0a1000-0000-4000-9000-000000000204', '2a0a1000-0000-4000-9000-000000000102', 'outbound', 'تمام، سأفحص أقرب موعد وأرسل لك التكلفة.', 'arkan-demo:wa:102:4', now() - interval '50 minutes'),
  ('3a0a1000-0000-4000-9000-000000000205', '2a0a1000-0000-4000-9000-000000000102', 'inbound', 'Can you reserve the earliest appointment?', 'arkan-demo:wa:102:5', now() - interval '35 minutes'),

  ('3a0a1000-0000-4000-9000-000000000301', '2a0a1000-0000-4000-9000-000000000103', 'inbound', 'Do you have Maldives honeymoon offers for September?', 'arkan-demo:ig:103:1', now() - interval '3 days'),
  ('3a0a1000-0000-4000-9000-000000000302', '2a0a1000-0000-4000-9000-000000000103', 'outbound', 'Yes, we have 4-star and 5-star resorts. What budget range do you prefer?', 'arkan-demo:ig:103:2', now() - interval '2 days 23 hours'),
  ('3a0a1000-0000-4000-9000-000000000303', '2a0a1000-0000-4000-9000-000000000103', 'inbound', 'Private pool is important for us.', 'arkan-demo:ig:103:3', now() - interval '1 hour'),

  ('3a0a1000-0000-4000-9000-000000000401', '2a0a1000-0000-4000-9000-000000000104', 'inbound', 'I want Antalya for family, two adults and two kids.', 'arkan-demo:web:104:1', now() - interval '5 days'),
  ('3a0a1000-0000-4000-9000-000000000402', '2a0a1000-0000-4000-9000-000000000104', 'outbound', 'We have a family resort package with airport transfer included.', 'arkan-demo:web:104:2', now() - interval '4 days 20 hours'),
  ('3a0a1000-0000-4000-9000-000000000403', '2a0a1000-0000-4000-9000-000000000104', 'inbound', 'Thank you, I received the invoice.', 'arkan-demo:web:104:3', now() - interval '8 hours'),

  ('3a0a1000-0000-4000-9000-000000000501', '2a0a1000-0000-4000-9000-000000000105', 'inbound', 'Do you have umrah packages for next month?', 'arkan-demo:wa:105:1', now() - interval '10 minutes'),
  ('3a0a1000-0000-4000-9000-000000000601', '2a0a1000-0000-4000-9000-000000000106', 'inbound', 'How much is the Georgia package?', 'arkan-demo:fb:106:1', now() - interval '9 days'),
  ('3a0a1000-0000-4000-9000-000000000602', '2a0a1000-0000-4000-9000-000000000106', 'outbound', 'The package starts from $620 including flight and hotel.', 'arkan-demo:fb:106:2', now() - interval '8 days 22 hours'),
  ('3a0a1000-0000-4000-9000-000000000603', '2a0a1000-0000-4000-9000-000000000106', 'inbound', 'I will wait for a discount.', 'arkan-demo:fb:106:3', now() - interval '6 days'),

  ('3a0a1000-0000-4000-9000-000000000701', '2a0a1000-0000-4000-9000-000000000107', 'inbound', 'Does the Thailand trip include a guide?', 'arkan-demo:ig:107:1', now() - interval '42 minutes'),
  ('3a0a1000-0000-4000-9000-000000000801', '2a0a1000-0000-4000-9000-000000000108', 'inbound', 'I need Schengen appointment help.', 'arkan-demo:web:108:1', now() - interval '1 day'),
  ('3a0a1000-0000-4000-9000-000000000802', '2a0a1000-0000-4000-9000-000000000108', 'outbound', 'Please send passport photo and travel dates, then we can advise.', 'arkan-demo:web:108:2', now() - interval '5 hours'),
  ('3a0a1000-0000-4000-9000-000000000803', '2a0a1000-0000-4000-9000-000000000108', 'inbound', 'Please call me after 6 PM.', 'arkan-demo:web:108:3', now() - interval '3 hours'),

  ('3a0a1000-0000-4000-9000-000000000901', '2a0a1000-0000-4000-9000-000000000109', 'inbound', 'مرحبا، بدي برنامج عائلي لتركيا.', 'arkan-demo:fb:109:1', now() - interval '5 minutes');
