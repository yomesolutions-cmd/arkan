-- Seed separate question trees for Website, Facebook, WhatsApp, and Instagram.
-- This can be run more than once; it only inserts missing questions.

ALTER TABLE public.question_nodes
ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'website',
ADD COLUMN IF NOT EXISTS shortcut text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS is_lead boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS question_nodes_channel_idx ON public.question_nodes(channel);

WITH seed_roots(channel, label, label_ar, answer, answer_ar, shortcut, is_lead, sort_order) AS (
  VALUES
    ('website', 'I want to book a trip', 'أريد حجز رحلة', 'Great. Choose the service you need and we will guide you.', 'رائع. اختر الخدمة التي تحتاجها وسنرشدك للخطوة التالية.', 'book', true, 1),
    ('website', 'Visa and passport services', 'خدمات التأشيرة والجوازات', 'We can help with visa requirements, appointments, and passport reminders.', 'يمكننا مساعدتك بمتطلبات التأشيرة والمواعيد وتذكير الجوازات.', 'visa', true, 2),
    ('website', 'Talk to an agent', 'التحدث مع موظف', 'Please leave your phone number and our travel team will contact you.', 'اترك رقم هاتفك وسيتواصل معك فريق السفر.', 'agent', true, 3),
    ('facebook', 'Facebook travel offer', 'عرض سفر من فيسبوك', 'Thanks for messaging Arkan Travel on Facebook. What kind of trip are you looking for?', 'شكراً لتواصلك مع أركان للسفر عبر فيسبوك. ما نوع الرحلة التي تبحث عنها؟', 'offer', true, 1),
    ('facebook', 'Flight ticket prices', 'أسعار تذاكر الطيران', 'Tell us the destination and travel date so we can check flight options.', 'أرسل الوجهة وتاريخ السفر لنفحص خيارات الطيران.', 'flight', true, 2),
    ('facebook', 'Family vacation packages', 'باقات العائلات', 'We can prepare family packages with flights, hotels, and transport.', 'نستطيع تجهيز باقات عائلية تشمل الطيران والفنادق والمواصلات.', 'family', true, 3),
    ('whatsapp', 'Book by WhatsApp', 'الحجز عبر واتساب', 'Send the destination, dates, and number of travelers to start booking.', 'أرسل الوجهة والتواريخ وعدد المسافرين لبدء الحجز.', 'book', true, 1),
    ('whatsapp', 'Send passport details', 'إرسال بيانات الجواز', 'You can send passport details here for visa or ticket booking.', 'يمكنك إرسال بيانات الجواز هنا للتأشيرة أو حجز التذاكر.', 'passport', true, 2),
    ('whatsapp', 'Urgent support', 'دعم عاجل', 'Please describe the urgent request and share your phone number.', 'يرجى وصف الطلب العاجل وإرسال رقم هاتفك.', 'urgent', true, 3),
    ('instagram', 'Instagram package inquiry', 'استفسار باقة من إنستغرام', 'Tell us which destination you saw and your preferred travel month.', 'أخبرنا بالوجهة التي شاهدتها وشهر السفر المناسب لك.', 'package', true, 1),
    ('instagram', 'Honeymoon trips', 'رحلات شهر العسل', 'We can suggest honeymoon trips with hotels, flights, and activities.', 'يمكننا اقتراح رحلات شهر عسل مع فنادق وطيران وبرامج.', 'honeymoon', true, 2),
    ('instagram', 'Ask for offer details', 'طلب تفاصيل العرض', 'Send the offer name or screenshot and we will send full details.', 'أرسل اسم العرض أو صورة منه وسنرسل لك التفاصيل كاملة.', 'details', true, 3)
),
inserted_roots AS (
  INSERT INTO public.question_nodes (channel, parent_id, label, label_ar, answer, answer_ar, shortcut, is_lead, sort_order, is_active)
  SELECT sr.channel, null, sr.label, sr.label_ar, sr.answer, sr.answer_ar, sr.shortcut, sr.is_lead, sr.sort_order, true
  FROM seed_roots sr
  WHERE NOT EXISTS (
    SELECT 1 FROM public.question_nodes q
    WHERE q.parent_id IS NULL AND q.channel = sr.channel AND q.label = sr.label
  )
  RETURNING id, channel, label
),
all_roots AS (
  SELECT id, channel, label FROM inserted_roots
  UNION
  SELECT q.id, q.channel, q.label
  FROM public.question_nodes q
  JOIN seed_roots sr ON sr.channel = q.channel AND sr.label = q.label
  WHERE q.parent_id IS NULL
),
seed_options(root_label, channel, label, label_ar, answer, answer_ar, shortcut, is_lead, sort_order) AS (
  VALUES
    ('I want to book a trip', 'website', 'Flights', 'طيران', 'Please share destination, date, and passenger count.', 'يرجى إرسال الوجهة والتاريخ وعدد المسافرين.', 'flights', true, 1),
    ('I want to book a trip', 'website', 'Hotels', 'فنادق', 'Please share city, dates, rooms, and hotel level.', 'يرجى إرسال المدينة والتواريخ وعدد الغرف ومستوى الفندق.', 'hotels', true, 2),
    ('I want to book a trip', 'website', 'Tours', 'رحلات سياحية', 'Please choose destination and travel month.', 'اختر الوجهة وشهر السفر المناسب.', 'tours', true, 3),
    ('Visa and passport services', 'website', 'Visa appointment', 'موعد تأشيرة', 'Tell us the country and preferred appointment date.', 'أرسل الدولة وتاريخ الموعد المناسب.', 'visa', true, 1),
    ('Visa and passport services', 'website', 'Passport expiry reminder', 'تذكير انتهاء الجواز', 'Send passport expiry date and phone number.', 'أرسل تاريخ انتهاء الجواز ورقم الهاتف.', 'passport', true, 2),

    ('Facebook travel offer', 'facebook', 'Istanbul', 'إسطنبول', 'We have Istanbul packages with flights and hotels. Send dates and traveler count.', 'لدينا باقات إسطنبول مع الطيران والفنادق. أرسل التواريخ وعدد المسافرين.', 'istanbul', true, 1),
    ('Facebook travel offer', 'facebook', 'Dubai', 'دبي', 'Dubai offers are available. Send travel dates and hotel level.', 'عروض دبي متوفرة. أرسل تواريخ السفر ومستوى الفندق.', 'dubai', true, 2),
    ('Facebook travel offer', 'facebook', 'Europe', 'أوروبا', 'Tell us preferred countries and travel month.', 'أخبرنا بالدول المفضلة وشهر السفر.', 'europe', true, 3),
    ('Flight ticket prices', 'facebook', 'One way', 'اتجاه واحد', 'Please send from city, to city, and travel date.', 'أرسل مدينة المغادرة والوصول وتاريخ السفر.', 'oneway', true, 1),
    ('Flight ticket prices', 'facebook', 'Round trip', 'ذهاب وعودة', 'Please send departure date, return date, and passenger count.', 'أرسل تاريخ الذهاب والعودة وعدد المسافرين.', 'round', true, 2),

    ('Book by WhatsApp', 'whatsapp', 'Flight booking', 'حجز طيران', 'Send route, dates, passenger names, and phone number.', 'أرسل خط الرحلة والتواريخ وأسماء المسافرين ورقم الهاتف.', 'flight', true, 1),
    ('Book by WhatsApp', 'whatsapp', 'Hotel booking', 'حجز فندق', 'Send city, dates, rooms, and preferred budget.', 'أرسل المدينة والتواريخ والغرف والميزانية المناسبة.', 'hotel', true, 2),
    ('Book by WhatsApp', 'whatsapp', 'Full travel package', 'باقة سفر كاملة', 'Send destination, dates, travelers, and budget.', 'أرسل الوجهة والتواريخ وعدد المسافرين والميزانية.', 'package', true, 3),
    ('Urgent support', 'whatsapp', 'Change booking', 'تعديل حجز', 'Send booking details and what you need changed.', 'أرسل تفاصيل الحجز والتعديل المطلوب.', 'change', true, 1),
    ('Urgent support', 'whatsapp', 'Cancel booking', 'إلغاء حجز', 'Send booking details and cancellation reason.', 'أرسل تفاصيل الحجز وسبب الإلغاء.', 'cancel', true, 2),

    ('Instagram package inquiry', 'instagram', 'Beach trips', 'رحلات الشواطئ', 'We can send beach offers. Share month and number of travelers.', 'نستطيع إرسال عروض الشواطئ. أرسل الشهر وعدد المسافرين.', 'beach', true, 1),
    ('Instagram package inquiry', 'instagram', 'City breaks', 'رحلات المدن', 'Tell us the city you liked and travel dates.', 'أخبرنا بالمدينة التي أعجبتك وتواريخ السفر.', 'city', true, 2),
    ('Honeymoon trips', 'instagram', 'Luxury honeymoon', 'شهر عسل فاخر', 'We can prepare luxury options. Share dates and budget.', 'نستطيع تجهيز خيارات فاخرة. أرسل التواريخ والميزانية.', 'luxury', true, 1),
    ('Honeymoon trips', 'instagram', 'Budget honeymoon', 'شهر عسل اقتصادي', 'We can suggest affordable honeymoon packages.', 'يمكننا اقتراح باقات شهر عسل اقتصادية.', 'budget', true, 2)
)
INSERT INTO public.question_nodes (channel, parent_id, label, label_ar, answer, answer_ar, shortcut, is_lead, sort_order, is_active)
SELECT so.channel, ar.id, so.label, so.label_ar, so.answer, so.answer_ar, so.shortcut, so.is_lead, so.sort_order, true
FROM seed_options so
JOIN all_roots ar ON ar.channel = so.channel AND ar.label = so.root_label
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_nodes q
  WHERE q.parent_id = ar.id AND q.channel = so.channel AND q.label = so.label
);
