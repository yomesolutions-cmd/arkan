import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const STORAGE_KEY = "arkan-lang";

type Dict = Record<string, { ar: string; en: string }>;

export const dict = {
  // nav / header
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.tours": { ar: "الرحلات", en: "Tours" },
  "nav.destinations": { ar: "الوجهات", en: "Destinations" },
  "nav.about": { ar: "من نحن", en: "About" },
  "nav.contact": { ar: "اتصل بنا", en: "Contact" },
  "nav.login": { ar: "تسجيل الدخول", en: "Login" },
  "nav.signup": { ar: "إنشاء حساب", en: "Sign Up" },
  "nav.myBookings": { ar: "حجوزاتي", en: "My bookings" },
  "nav.admin": { ar: "لوحة التحكم", en: "Admin" },
  "nav.menu": { ar: "القائمة", en: "Menu" },
  "lang.switch": { ar: "English", en: "العربية" },

  "hero.service.flights": { ar: "طيران", en: "Flights" },
  "hero.service.hotels": { ar: "فنادق", en: "Hotels" },
  "hero.service.tours": { ar: "رحلات", en: "Tours" },
  "hero.service.visa": { ar: "تأشيرات", en: "Visa support" },
  "hero.badge": { ar: "خدمة موثوقة", en: "Trusted service" },
  "hero.badgeText": {
    ar: "حجوزات مريحة من البداية حتى العودة",
    en: "Smooth bookings from takeoff to return",
  },

  // search widget
  "search.destination": { ar: "الوجهة", en: "Destination" },
  "search.destinationPh": { ar: "إلى أين تريد الذهاب؟", en: "Where are you going?" },
  "search.activity": { ar: "النشاط", en: "Activity" },
  "search.activityPh": { ar: "مدينة، شاطئ، ثقافة…", en: "City, Beach, Culture…" },
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

  // sections
  "sec.destinations.eyebrow": { ar: "أفضل الوجهات", en: "Top destinations" },
  "sec.destinations.title": { ar: "أماكن يعشقها المسافرون", en: "Places travellers love most" },
  "sec.destinations.text": {
    ar: "مدن وجزر مختارة بعناية مع فنادق موثوقة ومرشدين محليين وبرامج مرنة.",
    en: "Curated cities and islands with vetted hotels, local guides and flexible itineraries.",
  },
  "sec.packages.eyebrow": { ar: "الباقات السياحية", en: "Tour packages" },
  "sec.packages.title": { ar: "رحلات جاهزة متى ما كنت مستعداً", en: "Trips ready when you are" },
  "sec.why.eyebrow": { ar: "لماذا أركان للسفر", en: "Why Arkan Travel" },
  "sec.why.title": { ar: "راحة وأمان في كل رحلة", en: "Comfort and safety on every journey" },

  "feat.price.title": { ar: "أفضل سعر مضمون", en: "Best Price Guarantee" },
  "feat.price.text": { ar: "أسعار واضحة بدون رسوم خفية على أي حجز.", en: "Transparent fares with no hidden fees on any booking." },
  "feat.safe.title": { ar: "آمن وموثوق", en: "Safe & Trusted" },
  "feat.safe.text": { ar: "وكالة مرخّصة برحلات وشركاء مؤمَّنين بالكامل.", en: "Licensed agency with fully insured trips and partners." },
  "feat.support.title": { ar: "دعم على مدار الساعة", en: "24/7 Support" },
  "feat.support.text": { ar: "خبراء السفر معك قبل السفر وأثناءه.", en: "Our travel experts stay with you before and during travel." },
  "feat.fast.title": { ar: "حجز سريع", en: "Fast Booking" },
  "feat.fast.text": { ar: "أكّد الطيران والفنادق والتأشيرات في محادثة واحدة.", en: "Confirm flights, hotels and visas in a single conversation." },

  "card.days": { ar: "أيام", en: "days" },
  "card.nights": { ar: "ليالٍ", en: "nights" },
  "card.people": { ar: "أشخاص", en: "people" },
  "card.from": { ar: "ابتداءً من", en: "from" },
  "card.perNight": { ar: "لكل ليلة", en: "per night" },

  "card.tripLength": { ar: "أيام رحلة", en: "trip days" },

  // newsletter
  "news.success": { ar: "تم الاشتراك! شكراً لك.", en: "Subscribed! Thank you." },
  "news.error": { ar: "تعذّر الاشتراك. حاول مرة أخرى.", en: "Could not subscribe. Please try again." },

  // footer
  "footer.company": { ar: "الشركة", en: "Company" },
  "footer.services": { ar: "الخدمات", en: "Services" },
  "footer.contact": { ar: "تواصل معنا", en: "Contact" },
  "footer.svc1": { ar: "تذاكر الطيران", en: "Flight tickets" },
  "footer.svc2": { ar: "حجوزات الفنادق", en: "Hotel reservations" },
  "footer.svc3": { ar: "خدمات التأشيرات", en: "Visa assistance" },
  "footer.svc4": { ar: "الرحلات الجماعية", en: "Group tours" },
  "footer.rights": { ar: "جميع الحقوق محفوظة.", en: "All rights reserved." },
  "footer.tagline": {
    ar: "أركان للسفر والسياحة — طيران وفنادق وتأشيرات ورحلات. راحة وأمان.",
    en: "Arkan Travel and Tourism Agency — flights, hotels, visas and tours.",
  },

  // chat
  "chat.open": { ar: "افتح محادثة المساعدة", en: "Open help chat" },
  "chat.close": { ar: "إغلاق المحادثة", en: "Close chat" },
  "chat.title": { ar: "مساعدة السفر", en: "Travel help" },
  "chat.subtitle": { ar: "اختر موضوعاً للحصول على إجابة", en: "Pick a topic to get answers" },
  "chat.greeting": { ar: "مرحباً! 👋 كيف يمكننا مساعدتك اليوم؟", en: "Hi! 👋 What can we help you with today?" },
  "chat.loading": { ar: "جاري تحميل المواضيع…", en: "Loading topics…" },
  "chat.end": { ar: "هذا كل شيء في هذا الموضوع. ارجع أو ابدأ من جديد.", en: "That's everything on this topic. Go back or start over." },
  "chat.back": { ar: "رجوع", en: "Back" },
  "chat.restart": { ar: "من البداية", en: "Start over" },

  // auth
  "auth.signin": { ar: "تسجيل الدخول", en: "Sign in" },
  "auth.signup": { ar: "إنشاء حساب", en: "Create account" },
  "auth.email": { ar: "البريد الإلكتروني", en: "Email" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.fullName": { ar: "الاسم الكامل", en: "Full name" },
  "auth.google": { ar: "المتابعة عبر جوجل", en: "Continue with Google" },

  // dashboard
  "dash.title": { ar: "حجوزاتي", en: "My bookings" },
  "dash.empty": { ar: "لا توجد حجوزات بعد.", en: "No bookings yet." },
  "dash.cancel": { ar: "إلغاء", en: "Cancel" },
  "dash.delete": { ar: "حذف", en: "Delete" },
  "status.pending": { ar: "قيد الانتظار", en: "Pending" },
  "status.confirmed": { ar: "مؤكد", en: "Confirmed" },
  "status.cancelled": { ar: "ملغي", en: "Cancelled" },

  // admin
  "admin.title": { ar: "لوحة تحكم المدير", en: "Admin dashboard" },
  "admin.subtitle": {
    ar: "تحكّم بكل محتوى الموقع باللغتين العربية والإنجليزية.",
    en: "Control every piece of site content in both Arabic and English.",
  },
  "admin.tab.content": { ar: "محتوى الصفحة", en: "Page content" },
  "admin.tab.testimonials": { ar: "آراء العملاء", en: "Testimonials" },
  "admin.tab.trips": { ar: "الرحلات والفنادق والطيران", en: "Trips, hotels & flights" },
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
  "admin.noAccess": {
    ar: "هذا الحساب لا يملك صلاحية الوصول للوحة التحكم.",
    en: "This account doesn't have admin access.",
  },
  "admin.checking": { ar: "جاري التحقق من صلاحيتك…", en: "Checking your access…" },
  "admin.loading": { ar: "جاري التحميل…", en: "Loading…" },
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
  /** Pick the Arabic value when available, otherwise fall back to English. */
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
