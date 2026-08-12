import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const STORAGE_KEY = "arkan-lang";

type Dict = Record<string, { ar: string; en: string }>;

export const dict = {
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.tours": { ar: "الرحلات", en: "Tours" },
  "nav.destinations": { ar: "الوجهات", en: "Destinations" },
  "nav.about": { ar: "من نحن", en: "About" },
  "nav.contact": { ar: "اتصل بنا", en: "Contact" },
  "nav.login": { ar: "تسجيل الدخول", en: "Login" },
  "nav.signup": { ar: "إنشاء حساب", en: "Sign up" },
  "nav.myBookings": { ar: "حجوزاتي", en: "My bookings" },
  "nav.admin": { ar: "لوحة الإدارة", en: "Admin" },
  "nav.menu": { ar: "القائمة", en: "Menu" },
  "lang.switch": { ar: "English", en: "العربية" },

  "topbar.promise": { ar: "خدمة سفر موثوقة للعائلات والمجموعات", en: "Trusted travel service for families and groups" },
  "hero.eyebrow": { ar: "اكتشف العالم مع أركان", en: "Explore the world with Arkan" },
  "hero.title": { ar: "رحلات مصممة بعناية من الحجز حتى العودة", en: "Journeys planned beautifully from booking to return" },
  "hero.subtitle": {
    ar: "نرتب لك الرحلات، تذاكر الطيران، الفنادق، والتأشيرات بخدمة واضحة وسريعة تناسب العائلات والمجموعات ورجال الأعمال.",
    en: "We arrange tours, flight tickets, hotels and visa support with clear, fast service for families, groups and business travelers.",
  },
  "hero.cta": { ar: "ابدأ البحث", en: "Start exploring" },
  "hero.secondary": { ar: "شاهد الباقات", en: "View packages" },
  "hero.featured": { ar: "وجهة مميزة", en: "Featured destination" },
  "hero.service.flights": { ar: "طيران", en: "Flights" },
  "hero.service.hotels": { ar: "فنادق", en: "Hotels" },
  "hero.service.tours": { ar: "رحلات", en: "Tours" },
  "hero.service.visa": { ar: "تأشيرات", en: "Visa support" },
  "hero.badge": { ar: "خدمة موثوقة", en: "Trusted service" },
  "hero.badgeText": { ar: "حجوزات مريحة من البداية حتى العودة", en: "Smooth bookings from takeoff to return" },

  "service.flights.text": { ar: "أفضل خيارات الطيران مع متابعة قبل وبعد السفر.", en: "Smart flight options with support before and after travel." },
  "service.hotels.text": { ar: "فنادق مختارة بعناية تناسب الراحة والميزانية.", en: "Carefully selected hotels for comfort and budget." },
  "service.tours.text": { ar: "برامج سياحية مرنة للأفراد والعائلات والمجموعات.", en: "Flexible tour programs for individuals, families and groups." },
  "service.visa.text": { ar: "مساعدة في تجهيز ملفات التأشيرات ومواعيدها.", en: "Help preparing visa documents and appointments." },

  "search.destination": { ar: "الوجهة", en: "Destination" },
  "search.destinationPh": { ar: "إلى أين تريد الذهاب؟", en: "Where are you going?" },
  "search.activity": { ar: "النشاط", en: "Activity" },
  "search.activityPh": { ar: "مدينة، شاطئ، ثقافة...", en: "City, beach, culture..." },
  "search.dates": { ar: "التواريخ", en: "Dates" },
  "search.guests": { ar: "المسافرون", en: "Guests" },
  "search.action": { ar: "بحث", en: "Search" },
  "search.results": { ar: "نتائج البحث", en: "Search results" },
  "search.filters": { ar: "عوامل التصفية", en: "Filters" },
  "search.tours": { ar: "رحلات", en: "Tours" },
  "search.hotels": { ar: "فنادق", en: "Hotels" },
  "search.flights": { ar: "طيران", en: "Flights" },
  "search.none": { ar: "لا توجد نتائج مطابقة.", en: "No matching results." },
  "search.book": { ar: "احجز الآن", en: "Book now" },

  "sec.destinations.eyebrow": { ar: "أفضل الوجهات", en: "Top destinations" },
  "sec.destinations.title": { ar: "أماكن يحبها المسافرون", en: "Places travelers love most" },
  "sec.destinations.text": {
    ar: "مدن وجزر مختارة بعناية مع فنادق موثوقة ومرشدين محليين وبرامج مرنة.",
    en: "Curated cities and islands with vetted hotels, local guides and flexible itineraries.",
  },
  "sec.packages.eyebrow": { ar: "الباقات السياحية", en: "Tour packages" },
  "sec.packages.title": { ar: "رحلات جاهزة متى ما كنت مستعدا", en: "Trips ready when you are" },
  "sec.why.eyebrow": { ar: "لماذا أركان للسفر", en: "Why Arkan Travel" },
  "sec.why.title": { ar: "راحة وأمان في كل رحلة", en: "Comfort and safety on every journey" },
  "about.body": {
    ar: "فريق أركان يتابع تفاصيل الرحلة من اختيار الوجهة وحتى العودة، مع تواصل واضح وخيارات تناسب أسلوب سفرك.",
    en: "The Arkan team follows every trip detail from destination choice to return, with clear communication and options that match your travel style.",
  },
  "about.badge": { ar: "تخطيط شخصي", en: "Personal planning" },
  "about.badgeText": { ar: "كل رحلة لها مستشار سفر يتابع التفاصيل", en: "Every trip has an advisor watching the details" },
  "stats.years": { ar: "سنوات خبرة", en: "Years of experience" },
  "stats.destinations": { ar: "وجهة حول العالم", en: "Global destinations" },
  "stats.support": { ar: "دعم للمسافرين", en: "Traveler support" },

  "feat.price.title": { ar: "أفضل سعر مضمون", en: "Best price guarantee" },
  "feat.price.text": { ar: "أسعار واضحة بدون رسوم مخفية على أي حجز.", en: "Transparent fares with no hidden fees on any booking." },
  "feat.safe.title": { ar: "آمن وموثوق", en: "Safe and trusted" },
  "feat.safe.text": { ar: "شركاء موثوقون وبرامج سفر مدروسة بعناية.", en: "Trusted partners and carefully planned travel programs." },
  "feat.support.title": { ar: "دعم على مدار الساعة", en: "24/7 support" },
  "feat.support.text": { ar: "خبراء السفر معك قبل السفر وأثناءه.", en: "Travel experts stay with you before and during travel." },
  "feat.fast.title": { ar: "حجز سريع", en: "Fast booking" },
  "feat.fast.text": { ar: "أكد الطيران والفنادق والتأشيرات في محادثة واحدة.", en: "Confirm flights, hotels and visas in a single conversation." },

  "steps.eyebrow": { ar: "طريقة العمل", en: "How it works" },
  "steps.title": { ar: "نحول فكرة السفر إلى خطة واضحة", en: "We turn a travel idea into a clear plan" },
  "steps.text": { ar: "عملية بسيطة تساعدك على الحجز بثقة وبدون تعقيد.", en: "A simple process that helps you book with confidence and less friction." },
  "steps.pick.title": { ar: "اختر الوجهة", en: "Choose the destination" },
  "steps.pick.text": { ar: "شاركنا المدينة أو نوع الرحلة أو الميزانية، ونقترح أفضل الخيارات.", en: "Share the city, trip style or budget, and we suggest the best options." },
  "steps.confirm.title": { ar: "ثبت التفاصيل", en: "Confirm details" },
  "steps.confirm.text": { ar: "نراجع الطيران والفنادق والبرنامج قبل إصدار التأكيد النهائي.", en: "We review flights, hotels and itinerary before final confirmation." },
  "steps.travel.title": { ar: "سافر براحة", en: "Travel with ease" },
  "steps.travel.text": { ar: "يبقى فريقنا متاحا للمساعدة خلال الرحلة وحتى العودة.", en: "Our team remains available during the trip and through your return." },

  "card.days": { ar: "أيام", en: "days" },
  "card.nights": { ar: "ليال", en: "nights" },
  "card.people": { ar: "أشخاص", en: "people" },
  "card.from": { ar: "ابتداء من", en: "from" },
  "card.perNight": { ar: "لكل ليلة", en: "per night" },
  "card.tripLength": { ar: "أيام رحلة", en: "trip days" },

  "testimonials.eyebrow": { ar: "آراء العملاء", en: "Testimonials" },
  "testimonials.title": { ar: "مسافرون يثقون بأركان", en: "Travelers trust Arkan" },
  "testimonials.text": { ar: "تجارب حقيقية من عملاء حجزوا رحلاتهم معنا.", en: "Real experiences from customers who booked with us." },

  "newsletter.eyebrow": { ar: "ابق على اطلاع", en: "Stay inspired" },
  "newsletter.title": { ar: "احصل على عروض الرحلات الجديدة", en: "Get new travel offers" },
  "newsletter.text": { ar: "اشترك لتصلك أفضل الباقات والوجهات الموسمية.", en: "Subscribe for seasonal packages and destination ideas." },
  "newsletter.placeholder": { ar: "بريدك الإلكتروني", en: "Your email address" },
  "newsletter.cta": { ar: "اشتراك", en: "Subscribe" },
  "news.success": { ar: "تم الاشتراك، شكرا لك.", en: "Subscribed. Thank you." },
  "news.error": { ar: "تعذر الاشتراك. حاول مرة أخرى.", en: "Could not subscribe. Please try again." },
  "contact.title": { ar: "جاهزون لمساعدتك", en: "Ready to help" },

  "footer.company": { ar: "الشركة", en: "Company" },
  "footer.services": { ar: "الخدمات", en: "Services" },
  "footer.contact": { ar: "تواصل معنا", en: "Contact" },
  "footer.svc1": { ar: "تذاكر الطيران", en: "Flight tickets" },
  "footer.svc2": { ar: "حجوزات الفنادق", en: "Hotel reservations" },
  "footer.svc3": { ar: "خدمات التأشيرات", en: "Visa assistance" },
  "footer.svc4": { ar: "الرحلات الجماعية", en: "Group tours" },
  "footer.rights": { ar: "جميع الحقوق محفوظة.", en: "All rights reserved." },
  "footer.tagline": {
    ar: "أركان للسفر والسياحة: طيران، فنادق، تأشيرات ورحلات بخدمة واضحة ومريحة.",
    en: "Arkan Travel and Tourism Agency: flights, hotels, visas and tours with clear, comfortable service.",
  },

  "chat.open": { ar: "افتح محادثة المساعدة", en: "Open help chat" },
  "chat.close": { ar: "إغلاق المحادثة", en: "Close chat" },
  "chat.title": { ar: "مساعدة السفر", en: "Travel help" },
  "chat.subtitle": { ar: "اختر موضوعا للحصول على إجابة", en: "Pick a topic to get answers" },
  "chat.greeting": { ar: "مرحبا، كيف يمكننا مساعدتك اليوم؟", en: "Hi, how can we help you today?" },
  "chat.loading": { ar: "جاري تحميل المواضيع...", en: "Loading topics..." },
  "chat.end": { ar: "هذا كل شيء في هذا الموضوع. ارجع أو ابدأ من جديد.", en: "That's everything on this topic. Go back or start over." },
  "chat.back": { ar: "رجوع", en: "Back" },
  "chat.restart": { ar: "من البداية", en: "Start over" },

  "auth.signin": { ar: "تسجيل الدخول", en: "Sign in" },
  "auth.signup": { ar: "إنشاء حساب", en: "Create account" },
  "auth.email": { ar: "البريد الإلكتروني", en: "Email" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.fullName": { ar: "الاسم الكامل", en: "Full name" },
  "auth.google": { ar: "المتابعة عبر جوجل", en: "Continue with Google" },

  "dash.title": { ar: "حجوزاتي", en: "My bookings" },
  "dash.eyebrow": { ar: "حسابك", en: "Your account" },
  "dash.searchTrips": { ar: "ابحث عن رحلات", en: "Search trips" },
  "dash.signedInAs": { ar: "مسجل الدخول باسم", en: "Signed in as" },
  "dash.yourAccount": { ar: "حسابك", en: "Your account" },
  "dash.accountEmail": { ar: "بريد الحساب", en: "Account email" },
  "dash.activeBookings": { ar: "الحجوزات النشطة", en: "Active bookings" },
  "dash.totalBookings": { ar: "إجمالي الحجوزات", en: "Total bookings" },
  "dash.valueBooked": { ar: "قيمة الحجوزات", en: "Value booked" },
  "dash.filterAll": { ar: "الكل", en: "All" },
  "dash.loading": { ar: "جاري تحميل حجوزاتك...", en: "Loading your bookings..." },
  "dash.empty": { ar: "لا توجد حجوزات بعد.", en: "No bookings yet." },
  "dash.emptyFiltered": { ar: "لا توجد حجوزات هنا بعد.", en: "No bookings here yet." },
  "dash.findTrip": { ar: "ابحث عن رحلة", en: "Find a trip" },
  "dash.datesFlexible": { ar: "التواريخ مرنة", en: "Dates flexible" },
  "dash.guest": { ar: "مسافر", en: "guest" },
  "dash.guests": { ar: "مسافرون", en: "guests" },
  "dash.openAccountMenu": { ar: "فتح قائمة الحساب", en: "Open account menu" },
  "dash.cancel": { ar: "إلغاء", en: "Cancel" },
  "dash.delete": { ar: "حذف", en: "Delete" },
  "status.pending": { ar: "قيد الانتظار", en: "Pending" },
  "status.confirmed": { ar: "مؤكد", en: "Confirmed" },
  "status.cancelled": { ar: "ملغي", en: "Cancelled" },

  "admin.title": { ar: "لوحة تحكم المدير", en: "Admin dashboard" },
  "admin.subtitle": { ar: "تحكم بمحتوى الموقع باللغتين العربية والإنجليزية.", en: "Control site content in Arabic and English." },
  "admin.tab.content": { ar: "محتوى الصفحة", en: "Page content" },
  "admin.tab.testimonials": { ar: "آراء العملاء", en: "Testimonials" },
  "admin.tab.trips": { ar: "الرحلات والفنادق والطيران", en: "Trips, hotels and flights" },
  "admin.tab.questions": { ar: "أسئلة المحادثة", en: "Chat questions" },
  "admin.tab.chatlogs": { ar: "رسائل المحادثة", en: "Chat activity" },
  "admin.tab.subscribers": { ar: "المشتركون", en: "Subscribers" },
  "admin.tab.users": { ar: "المستخدمون", en: "Users" },
  "admin.save": { ar: "حفظ", en: "Save" },
  "admin.saved": { ar: "تم الحفظ", en: "Saved" },
  "admin.add": { ar: "إضافة", en: "Add" },
  "admin.delete": { ar: "حذف", en: "Delete" },
  "admin.english": { ar: "الإنجليزية", en: "English" },
  "admin.arabic": { ar: "العربية", en: "Arabic" },
  "admin.onlyAdmins": { ar: "للمديرين فقط", en: "Admins only" },
  "admin.noAccess": { ar: "هذا الحساب لا يملك صلاحية الوصول للوحة التحكم.", en: "This account does not have admin access." },
  "admin.checking": { ar: "جاري التحقق من صلاحيتك...", en: "Checking your access..." },
  "admin.loading": { ar: "جاري التحميل...", en: "Loading..." },
  "admin.empty": { ar: "لا توجد بيانات بعد.", en: "Nothing here yet." },
  "common.back": { ar: "رجوع", en: "Back" },
  "common.signout": { ar: "تسجيل الخروج", en: "Sign out" },
} satisfies Dict;

export type TKey = keyof typeof dict;

type Ctx = {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: TKey) => string;
  pick: (en: string | null | undefined, ar: string | null | undefined) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ar") setLangState(stored);
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      toggle: () => setLang(lang === "ar" ? "en" : "ar"),
      t: (key: TKey) => dict[key][lang],
      pick: (en, ar) => (lang === "ar" ? (ar?.trim() ? ar : (en ?? "")) : (en?.trim() ? en : (ar ?? ""))),
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}
