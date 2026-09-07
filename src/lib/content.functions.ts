import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/integrations/supabase/config";
import type { Database } from "@/integrations/supabase/types";

export type SiteContentRow = {
  id: string;
  section: string;
  data_en: Record<string, string>;
  data_ar: Record<string, string>;
};

export type Testimonial = {
  id: string;
  name_en: string;
  name_ar: string;
  image_url: string | null;
  role_en: string;
  role_ar: string;
  quote_en: string;
  quote_ar: string;
  rating: number;
  sort_order: number;
  is_active: boolean;
};

const CONTENT_COLS = "id, section, data_en, data_ar";
const TESTIMONIAL_COLS_BASE =
  "id, name_en, name_ar, role_en, role_ar, quote_en, quote_ar, rating, sort_order, is_active";
const TESTIMONIAL_COLS =
  "id, name_en, name_ar, image_url, role_en, role_ar, quote_en, quote_ar, rating, sort_order, is_active";

type TestimonialWithoutImage = Omit<Testimonial, "image_url">;

function withDefaultImageUrl(rows: TestimonialWithoutImage[]): Testimonial[] {
  return rows.map((row) => ({ ...row, image_url: null }));
}

const FALLBACK_SITE_CONTENT = {
  sections: {
    hero: {
      en: {
        eyebrow: "Explore the world",
        title: "Find your next unforgettable journey",
        subtitle: "Handpicked tours, flights and hotels across the world, curated by Arkan Travel.",
        cta: "Start searching",
      },
      ar: {
        eyebrow: "اكتشف العالم",
        title: "ابحث عن رحلتك القادمة التي لا تنسى",
        subtitle: "رحلات وطيران وفنادق مختارة بعناية حول العالم من أركان للسفر.",
        cta: "ابدأ البحث",
      },
    },
    about: {
      en: {
        eyebrow: "About us",
        title: "Travel made simple, warm and personal",
        body: "Arkan Travel has been crafting journeys for over a decade. From family holidays to business trips, our team handles every detail so you can simply enjoy the ride.",
        stat1_value: "12k+",
        stat1_label: "Happy travellers",
        stat2_value: "85",
        stat2_label: "Destinations",
        stat3_value: "4.9",
        stat3_label: "Average rating",
      },
      ar: {
        eyebrow: "من نحن",
        title: "سفر بسيط ودافئ وشخصي",
        body: "تصنع أركان للسفر الرحلات المميزة منذ أكثر من عشر سنوات. من العطلات العائلية إلى رحلات العمل، يتولى فريقنا كل التفاصيل لتستمتع أنت فقط بالرحلة.",
        stat1_value: "+12 ألف",
        stat1_label: "مسافر سعيد",
        stat2_value: "85",
        stat2_label: "وجهة",
        stat3_value: "4.9",
        stat3_label: "متوسط التقييم",
      },
    },
    testimonials_header: {
      en: {
        eyebrow: "Testimonials",
        title: "What our travellers say",
        subtitle: "Real words from people who travelled with Arkan.",
      },
      ar: {
        eyebrow: "آراء العملاء",
        title: "ماذا يقول مسافرونا",
        subtitle: "كلمات حقيقية من أشخاص سافروا مع أركان.",
      },
    },
    newsletter: {
      en: {
        title: "Get travel deals in your inbox",
        subtitle: "Subscribe for handpicked offers. No spam, unsubscribe anytime.",
        cta: "Subscribe",
        placeholder: "Your email address",
      },
      ar: {
        title: "احصل على عروض السفر في بريدك",
        subtitle: "اشترك لتصلك عروض مختارة. بدون رسائل مزعجة، ويمكنك إلغاء الاشتراك في أي وقت.",
        cta: "اشترك",
        placeholder: "بريدك الإلكتروني",
      },
    },
  },
  testimonials: [
    {
      id: "00000000-0000-4000-8000-000000000201",
      name_en: "Sarah Malik",
      name_ar: "سارة مالك",
      image_url: null,
      role_en: "Family trip to Istanbul",
      role_ar: "رحلة عائلية إلى إسطنبول",
      quote_en: "Everything was organised perfectly. The hotel was beautiful and the guide was so kind to our kids.",
      quote_ar: "كان كل شيء منظما بشكل مثالي. الفندق كان جميلا والمرشد كان لطيفا جدا مع أطفالنا.",
      rating: 5,
      sort_order: 1,
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8000-000000000202",
      name_en: "Omar Haddad",
      name_ar: "عمر حداد",
      image_url: null,
      role_en: "Business travel",
      role_ar: "سفر عمل",
      quote_en: "Booked a last-minute flight and got a better price than anywhere else. Support answered in minutes.",
      quote_ar: "حجزت رحلة في اللحظة الأخيرة وحصلت على سعر أفضل من أي مكان آخر. خدمة العملاء ردت خلال دقائق.",
      rating: 5,
      sort_order: 2,
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8000-000000000203",
      name_en: "Lina Kassem",
      name_ar: "لينا قاسم",
      image_url: null,
      role_en: "Honeymoon in the Maldives",
      role_ar: "شهر عسل في المالديف",
      quote_en: "The Maldives package was a dream. Every detail was handled and we just enjoyed ourselves.",
      quote_ar: "باقة المالديف كانت حلما. تم الاعتناء بكل التفاصيل واستمتعنا بالرحلة فقط.",
      rating: 5,
      sort_order: 3,
      is_active: true,
    },
  ] satisfies Testimonial[],
};

function publicClient() {
  const key = SUPABASE_PUBLISHABLE_KEY;
  return createClient<Database>(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/* ------------------------------- public reads ------------------------------ */

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = publicClient();
    const content = await supabase.from("site_content").select(CONTENT_COLS);
    let testimonialRows: Testimonial[] = [];
    const testimonials = await supabase
      .from("testimonials")
      .select(TESTIMONIAL_COLS)
      .eq("is_active", true)
      .order("sort_order");
    if (content.error) throw content.error;
    if (testimonials.error) {
      const fallback = await supabase
        .from("testimonials")
        .select(TESTIMONIAL_COLS_BASE)
        .eq("is_active", true)
        .order("sort_order");
      if (fallback.error) throw fallback.error;
      testimonialRows = withDefaultImageUrl((fallback.data ?? []) as TestimonialWithoutImage[]);
    } else {
      testimonialRows = (testimonials.data ?? []) as Testimonial[];
    }
    const sections: Record<string, { en: Record<string, string>; ar: Record<string, string> }> = {};
    for (const row of (content.data ?? []) as SiteContentRow[]) {
      sections[row.section] = { en: row.data_en ?? {}, ar: row.data_ar ?? {} };
    }
    return { sections, testimonials: testimonialRows };
  } catch (error) {
    console.error("[Supabase] Falling back to bundled site content.", error);
    return FALLBACK_SITE_CONTENT;
  }
});

export const subscribeEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ email: z.string().email().max(200), locale: z.enum(["ar", "en"]).default("ar") }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { error } = await supabase
      .from("subscribers")
      .insert({ email: data.email.toLowerCase(), locale: data.locale });
    // duplicate email is still a success from the visitor's point of view
    if (error && !error.message.toLowerCase().includes("duplicate")) throw error;
    return { ok: true };
  });

export const logChatClick = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        session_id: z.string().uuid(),
        node_id: z.string().uuid().nullable().optional(),
        node_label: z.string().max(300),
        locale: z.enum(["ar", "en"]).default("ar"),
        depth: z.number().int().min(0).max(50).default(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { error } = await supabase.from("chat_logs").insert({
      session_id: data.session_id,
      node_id: data.node_id ?? null,
      node_label: data.node_label,
      locale: data.locale,
      depth: data.depth,
    });
    if (error) throw error;
    return { ok: true };
  });

/* -------------------------------- admin: content -------------------------------- */

export const listSiteContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("site_content").select(CONTENT_COLS).order("section");
    if (error) throw error;
    return (data ?? []) as SiteContentRow[];
  });

export const saveSiteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        section: z.string().min(1).max(60),
        data_en: z.record(z.string(), z.string().max(4000)),
        data_ar: z.record(z.string(), z.string().max(4000)),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("site_content")
      .upsert({ section: data.section, data_en: data.data_en, data_ar: data.data_ar }, { onConflict: "section" })
      .select(CONTENT_COLS)
      .single();
    if (error) throw error;
    return row as SiteContentRow;
  });

/* ----------------------------- admin: testimonials ---------------------------- */

export const listTestimonials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("testimonials").select(TESTIMONIAL_COLS).order("sort_order");
    if (error) {
      const fallback = await context.supabase.from("testimonials").select(TESTIMONIAL_COLS_BASE).order("sort_order");
      if (fallback.error) throw fallback.error;
      return withDefaultImageUrl((fallback.data ?? []) as TestimonialWithoutImage[]);
    }
    return (data ?? []) as Testimonial[];
  });

const testimonialInput = z.object({
  id: z.string().uuid().optional(),
  name_en: z.string().trim().min(1).max(120),
  name_ar: z.string().trim().max(120).default(""),
  image_url: z.string().trim().url().max(1000).nullable().optional().or(z.literal("")),
  role_en: z.string().trim().max(160).default(""),
  role_ar: z.string().trim().max(160).default(""),
  quote_en: z.string().trim().min(1).max(1200),
  quote_ar: z.string().trim().max(1200).default(""),
  rating: z.number().min(1).max(5).default(5),
  sort_order: z.number().int().min(0).max(9999).default(0),
  is_active: z.boolean().default(true),
});

export const saveTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => testimonialInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = { ...data, image_url: data.image_url || null };
    const q = id
      ? context.supabase.from("testimonials").update(rest).eq("id", id).select(TESTIMONIAL_COLS).single()
      : context.supabase.from("testimonials").insert(rest).select(TESTIMONIAL_COLS).single();
    const { data: row, error } = await q;
    if (error && error.message.toLowerCase().includes("image_url")) {
      const { image_url, ...withoutImageUrl } = rest;
      const fallback = id
        ? context.supabase.from("testimonials").update(withoutImageUrl).eq("id", id).select(TESTIMONIAL_COLS_BASE).single()
        : context.supabase.from("testimonials").insert(withoutImageUrl).select(TESTIMONIAL_COLS_BASE).single();
      const { data: fallbackRow, error: fallbackError } = await fallback;
      if (fallbackError) throw fallbackError;
      return { ...fallbackRow, image_url: null } as Testimonial;
    }
    if (error) throw error;
    return row as Testimonial;
  });

export const deleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("testimonials").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* --------------------------- admin: subscribers / logs -------------------------- */

export const listSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("subscribers")
      .select("id, email, locale, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return data ?? [];
  });

export const deleteSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("subscribers").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const listChatLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_logs")
      .select("id, session_id, node_label, locale, depth, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return data ?? [];
  });

/* ---------------------------------- admin: users -------------------------------- */

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profiles, bookings, roles] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("id, full_name, email, phone, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      context.supabase.from("bookings").select("user_id, total_price, status"),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    if (profiles.error) throw profiles.error;
    const counts = new Map<string, number>();
    for (const b of bookings.data ?? []) counts.set(b.user_id, (counts.get(b.user_id) ?? 0) + 1);
    const adminIds = new Set((roles.data ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    return (profiles.data ?? []).map((p) => ({
      ...p,
      bookings: counts.get(p.id) ?? 0,
      is_admin: adminIds.has(p.id),
    }));
  });
