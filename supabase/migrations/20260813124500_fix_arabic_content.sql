-- Repair Arabic content that was imported with mojibake and fill Arabic catalog labels.

UPDATE public.site_content
SET data_ar = jsonb_build_object(
  'eyebrow', 'اكتشف العالم',
  'title', 'ابحث عن رحلتك القادمة التي لا تنسى',
  'subtitle', 'رحلات وطيران وفنادق مختارة بعناية حول العالم من أركان للسفر.',
  'cta', 'ابدأ البحث'
)
WHERE section = 'hero';

UPDATE public.site_content
SET data_ar = jsonb_build_object(
  'eyebrow', 'من نحن',
  'title', 'سفر بسيط ودافئ وشخصي',
  'body', 'تصنع أركان للسفر رحلات مميزة منذ أكثر من عشر سنوات. من العطلات العائلية إلى رحلات العمل، يتولى فريقنا كل التفاصيل لتستمتع أنت فقط بالرحلة.',
  'stat1_value', '+12 ألف',
  'stat1_label', 'مسافر سعيد',
  'stat2_value', '85',
  'stat2_label', 'وجهة',
  'stat3_value', '4.9',
  'stat3_label', 'متوسط التقييم'
)
WHERE section = 'about';

UPDATE public.site_content
SET data_ar = jsonb_build_object(
  'eyebrow', 'آراء العملاء',
  'title', 'ماذا يقول مسافرونا',
  'subtitle', 'كلمات حقيقية من أشخاص سافروا مع أركان.'
)
WHERE section = 'testimonials_header';

UPDATE public.site_content
SET data_ar = jsonb_build_object(
  'title', 'احصل على عروض السفر في بريدك',
  'subtitle', 'اشترك لتصلك عروض مختارة. بدون رسائل مزعجة، ويمكنك إلغاء الاشتراك في أي وقت.',
  'placeholder', 'بريدك الإلكتروني',
  'cta', 'اشترك'
)
WHERE section = 'newsletter';

UPDATE public.testimonials
SET name_ar = 'سارة مالك',
    role_ar = 'رحلة عائلية إلى إسطنبول',
    quote_ar = 'كان كل شيء منظماً بشكل مثالي. الفندق كان جميلاً والمرشد كان لطيفاً جداً مع أطفالنا.'
WHERE name_en = 'Sarah Malik';

UPDATE public.testimonials
SET name_ar = 'عمر حداد',
    role_ar = 'سفر عمل',
    quote_ar = 'حجزت رحلة في اللحظة الأخيرة وحصلت على سعر أفضل من أي مكان آخر. خدمة العملاء ردت خلال دقائق.'
WHERE name_en = 'Omar Haddad';

UPDATE public.testimonials
SET name_ar = 'لينا قاسم',
    role_ar = 'شهر عسل في المالديف',
    quote_ar = 'باقة المالديف كانت حلماً. تم الاعتناء بكل التفاصيل واستمتعنا بالرحلة فقط.'
WHERE name_en = 'Lina Kassem';

UPDATE public.destinations
SET country = 'Türkiye',
    name_ar = CASE slug
      WHEN 'istanbul' THEN 'إسطنبول'
      WHEN 'dubai' THEN 'دبي'
      WHEN 'maldives' THEN 'المالديف'
      WHEN 'paris' THEN 'باريس'
      WHEN 'cappadocia' THEN 'كابادوكيا'
      WHEN 'antalya' THEN 'أنطاليا'
      WHEN 'rome' THEN 'روما'
      WHEN 'bali' THEN 'بالي'
      ELSE name_ar
    END,
    country_ar = CASE slug
      WHEN 'istanbul' THEN 'تركيا'
      WHEN 'dubai' THEN 'الإمارات'
      WHEN 'maldives' THEN 'المحيط الهندي'
      WHEN 'paris' THEN 'فرنسا'
      WHEN 'cappadocia' THEN 'تركيا'
      WHEN 'antalya' THEN 'تركيا'
      WHEN 'rome' THEN 'إيطاليا'
      WHEN 'bali' THEN 'إندونيسيا'
      ELSE country_ar
    END,
    description_ar = CASE slug
      WHEN 'istanbul' THEN 'مدينة يلتقي فيها الشرق والغرب: أسواق، قصور، ومضيق البوسفور.'
      WHEN 'dubai' THEN 'أبراج حديثة، صحراء ذهبية، وتسوق عالمي.'
      WHEN 'maldives' THEN 'فلل فوق الماء، شعاب مرجانية، وبحر صاف لا ينسى.'
      WHEN 'paris' THEN 'شوارع ساحرة، متاحف، وتجارب طعام أوروبية رائعة.'
      WHEN 'cappadocia' THEN 'مناطيد عند الشروق فوق الوديان وفنادق الكهوف.'
      WHEN 'antalya' THEN 'ساحل تركوازي، مدينة قديمة، ومنتجعات عائلية.'
      WHEN 'rome' THEN 'آثار قديمة، ساحات نابضة بالحياة، ومذاق إيطالي أصيل.'
      WHEN 'bali' THEN 'مدرجات أرز، معابد، وشواطئ ركوب الأمواج.'
      ELSE description_ar
    END
WHERE slug IN ('istanbul','dubai','maldives','paris','cappadocia','antalya','rome','bali');

UPDATE public.destinations
SET country = 'Türkiye'
WHERE country = 'Tأ¼rkiye';

UPDATE public.tour_packages
SET place = CASE WHEN place = 'Tأ¼rkiye' THEN 'Türkiye' ELSE place END,
    title_ar = CASE slug
      WHEN 'bosphorus-cappadocia' THEN 'هروب البوسفور وكابادوكيا'
      WHEN 'dubai-city-desert' THEN 'أضواء دبي والصحراء'
      WHEN 'maldives-overwater' THEN 'استجمام فوق مياه المالديف'
      WHEN 'paris-weekend' THEN 'عطلة طويلة في باريس'
      WHEN 'antalya-family' THEN 'أسبوع عائلي مشمس في أنطاليا'
      WHEN 'rome-classics' THEN 'روائع روما الكلاسيكية'
      WHEN 'bali-adventure' THEN 'مغامرة جزيرة بالي'
      WHEN 'cappadocia-balloon' THEN 'استراحة مناطيد كابادوكيا'
      ELSE title_ar
    END,
    place_ar = CASE slug
      WHEN 'bosphorus-cappadocia' THEN 'تركيا'
      WHEN 'dubai-city-desert' THEN 'الإمارات العربية المتحدة'
      WHEN 'maldives-overwater' THEN 'المالديف'
      WHEN 'paris-weekend' THEN 'فرنسا'
      WHEN 'antalya-family' THEN 'تركيا'
      WHEN 'rome-classics' THEN 'إيطاليا'
      WHEN 'bali-adventure' THEN 'إندونيسيا'
      WHEN 'cappadocia-balloon' THEN 'تركيا'
      ELSE place_ar
    END,
    description_ar = CASE slug
      WHEN 'bosphorus-cappadocia' THEN 'أبرز معالم إسطنبول مع شروق المناطيد في كابادوكيا.'
      WHEN 'dubai-city-desert' THEN 'برج خليفة، رحلة بحرية في المارينا، وليلة في مخيم صحراوي.'
      WHEN 'maldives-overwater' THEN 'فيلا خاصة فوق الماء مع سنوركلينغ وأيام سبا.'
      WHEN 'paris-weekend' THEN 'اللوفر، مونمارتر، وعشاء على نهر السين.'
      WHEN 'antalya-family' THEN 'أسبوع شامل في منتجع مع رحلات بحرية وألعاب مائية.'
      WHEN 'rome-classics' THEN 'الكولوسيوم، الفاتيكان، وجولة طعام في تراستيفيري.'
      WHEN 'bali-adventure' THEN 'أوبود، نوسا بينيدا، ومشي عند شروق الشمس قرب البركان.'
      WHEN 'cappadocia-balloon' THEN 'إقامة في فندق كهفي مع رحلة منطاد هوائي.'
      ELSE description_ar
    END
WHERE slug IN ('bosphorus-cappadocia','dubai-city-desert','maldives-overwater','paris-weekend','antalya-family','rome-classics','bali-adventure','cappadocia-balloon');

UPDATE public.hotels
SET country = CASE WHEN country = 'Tأ¼rkiye' THEN 'Türkiye' ELSE country END,
    name_ar = CASE name
      WHEN 'Bosphorus Pearl Hotel' THEN 'فندق لؤلؤة البوسفور'
      WHEN 'Sultanahmet Boutique' THEN 'فندق سلطان أحمد البوتيكي'
      WHEN 'Marina Bay Towers' THEN 'أبراج مارينا باي'
      WHEN 'Desert Rose Residence' THEN 'إقامة وردة الصحراء'
      WHEN 'Coral Lagoon Resort' THEN 'منتجع كورال لاجون'
      WHEN 'Blue Atoll Villas' THEN 'فلل بلو أتول'
      WHEN 'Hotel Rive Gauche' THEN 'فندق ريف غوش'
      WHEN 'Montmartre Suites' THEN 'أجنحة مونمارتر'
      WHEN 'Antalya Sun Resort' THEN 'منتجع شمس أنطاليا'
      WHEN 'Trastevere Garden' THEN 'حديقة تراستيفيري'
      ELSE name_ar
    END,
    city_ar = CASE city
      WHEN 'Istanbul' THEN 'إسطنبول'
      WHEN 'Dubai' THEN 'دبي'
      WHEN 'Maldives' THEN 'المالديف'
      WHEN 'Paris' THEN 'باريس'
      WHEN 'Antalya' THEN 'أنطاليا'
      WHEN 'Rome' THEN 'روما'
      ELSE city_ar
    END;

UPDATE public.flights
SET airline_ar = CASE airline
      WHEN 'Turkish Airlines' THEN 'الخطوط التركية'
      WHEN 'Emirates' THEN 'طيران الإمارات'
      WHEN 'Air France' THEN 'الخطوط الفرنسية'
      WHEN 'Qatar Airways' THEN 'الخطوط القطرية'
      WHEN 'Pegasus' THEN 'طيران بيغاسوس'
      WHEN 'ITA Airways' THEN 'الخطوط الإيطالية'
      WHEN 'Singapore Airlines' THEN 'الخطوط السنغافورية'
      ELSE airline_ar
    END,
    from_city_ar = CASE from_city
      WHEN 'Istanbul' THEN 'إسطنبول'
      WHEN 'Dubai' THEN 'دبي'
      WHEN 'Paris' THEN 'باريس'
      WHEN 'Rome' THEN 'روما'
      WHEN 'Bali' THEN 'بالي'
      ELSE from_city_ar
    END,
    to_city_ar = CASE to_city
      WHEN 'Istanbul' THEN 'إسطنبول'
      WHEN 'Dubai' THEN 'دبي'
      WHEN 'Paris' THEN 'باريس'
      WHEN 'Maldives' THEN 'المالديف'
      WHEN 'Antalya' THEN 'أنطاليا'
      WHEN 'Rome' THEN 'روما'
      ELSE to_city_ar
    END;

UPDATE public.question_nodes
SET label_ar = CASE label
      WHEN 'Booking & payments' THEN 'الحجز والدفع'
      WHEN 'Trips & destinations' THEN 'الرحلات والوجهات'
      WHEN 'Account & support' THEN 'الحساب والدعم'
      WHEN 'How do I book a trip?' THEN 'كيف أحجز رحلة؟'
      WHEN 'Cancellations & refunds' THEN 'الإلغاء والاسترداد'
      WHEN 'Popular destinations' THEN 'الوجهات الشائعة'
      WHEN 'Contact a human' THEN 'التواصل مع موظف'
      WHEN 'Booking a tour package' THEN 'حجز باقة سياحية'
      WHEN 'Booking a flight or hotel' THEN 'حجز طيران أو فندق'
      WHEN 'How do I cancel?' THEN 'كيف ألغي الحجز؟'
      WHEN 'Best time to visit' THEN 'أفضل وقت للزيارة'
      ELSE label_ar
    END,
    answer_ar = CASE label
      WHEN 'How do I book a trip?' THEN 'اختر الرحلة أو الفندق أو الطيران من صفحة البحث، ثم اضغط احجز الآن واتبع الخطوات.'
      WHEN 'Cancellations & refunds' THEN 'يمكنك طلب الإلغاء من لوحة حجوزاتك. تختلف شروط الاسترداد حسب نوع الحجز والمزود.'
      WHEN 'Popular destinations' THEN 'أشهر الوجهات لدينا تشمل إسطنبول، دبي، المالديف، باريس، أنطاليا، روما وبالي.'
      WHEN 'Contact a human' THEN 'يمكنك التواصل معنا عبر الهاتف أو البريد الإلكتروني الموجود في أسفل الصفحة.'
      WHEN 'Booking a tour package' THEN 'اختر الباقة المناسبة وأرسل طلب الحجز، وسيتواصل معك فريق أركان لتأكيد التفاصيل.'
      WHEN 'Booking a flight or hotel' THEN 'ابحث حسب الوجهة والسعر والتاريخ، ثم أرسل طلب الحجز وسنساعدك في التأكيد.'
      WHEN 'How do I cancel?' THEN 'افتح لوحة حجوزاتك واختر الحجز ثم اضغط إلغاء، أو تواصل معنا للمساعدة.'
      WHEN 'Best time to visit' THEN 'يعتمد أفضل وقت على الوجهة. سنساعدك في اختيار الموسم المناسب حسب الطقس والميزانية.'
      ELSE answer_ar
    END
WHERE label IN (
  'Booking & payments',
  'Trips & destinations',
  'Account & support',
  'How do I book a trip?',
  'Cancellations & refunds',
  'Popular destinations',
  'Contact a human',
  'Booking a tour package',
  'Booking a flight or hotel',
  'How do I cancel?',
  'Best time to visit'
);
