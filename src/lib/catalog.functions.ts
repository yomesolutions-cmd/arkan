import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/integrations/supabase/config";
import type { Database } from "@/integrations/supabase/types";

type Destination = Database["public"]["Tables"]["destinations"]["Row"];
type TourPackage = Database["public"]["Tables"]["tour_packages"]["Row"];

const FALLBACK_DESTINATIONS: Destination[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "istanbul",
    name: "Istanbul",
    name_ar: "إسطنبول",
    country: "Türkiye",
    country_ar: "تركيا",
    region: "Europe / Asia",
    description: "A city where east and west meet: bazaars, palaces and the Bosphorus.",
    description_ar: "مدينة يلتقي فيها الشرق والغرب: أسواق، قصور، ومضيق البوسفور.",
    image_key: "dest1",
    featured: true,
    created_at: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "dubai",
    name: "Dubai",
    name_ar: "دبي",
    country: "United Arab Emirates",
    country_ar: "الإمارات",
    region: "Middle East",
    description: "Modern towers, golden desert and world-class shopping.",
    description_ar: "أبراج حديثة، صحراء ذهبية، وتسوق عالمي.",
    image_key: "dest2",
    featured: true,
    created_at: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    slug: "maldives",
    name: "Maldives",
    name_ar: "المالديف",
    country: "Indian Ocean",
    country_ar: "المحيط الهندي",
    region: "Islands",
    description: "Overwater villas, coral reefs and crystal-clear sea.",
    description_ar: "فلل فوق الماء، شعاب مرجانية، وبحر صاف لا ينسى.",
    image_key: "dest3",
    featured: true,
    created_at: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    slug: "paris",
    name: "Paris",
    name_ar: "باريس",
    country: "France",
    country_ar: "فرنسا",
    region: "Europe",
    description: "Romantic streets, museums and unforgettable food.",
    description_ar: "شوارع ساحرة، متاحف، وتجارب طعام أوروبية رائعة.",
    image_key: "dest4",
    featured: true,
    created_at: "2026-08-01T00:00:00.000Z",
  },
];

const FALLBACK_TOURS: TourPackage[] = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    slug: "bosphorus-cappadocia",
    title: "Bosphorus & Cappadocia Escape",
    title_ar: "هروب البوسفور وكابادوكيا",
    destination_id: FALLBACK_DESTINATIONS[0].id,
    place: "Türkiye",
    place_ar: "تركيا",
    days: 6,
    nights: 5,
    min_people: 2,
    max_people: 12,
    price: 740,
    rating: 4.9,
    category: "Culture",
    description: "Istanbul highlights plus a balloon sunrise in Cappadocia.",
    description_ar: "أبرز معالم إسطنبول مع شروق المناطيد في كابادوكيا.",
    image_key: "dest1",
    featured: true,
    created_at: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    slug: "dubai-city-desert",
    title: "Dubai City Lights & Desert",
    title_ar: "أضواء دبي والصحراء",
    destination_id: FALLBACK_DESTINATIONS[1].id,
    place: "United Arab Emirates",
    place_ar: "الإمارات العربية المتحدة",
    days: 5,
    nights: 4,
    min_people: 2,
    max_people: 10,
    price: 890,
    rating: 4.8,
    category: "City",
    description: "Burj Khalifa, marina cruise and an overnight desert camp.",
    description_ar: "برج خليفة، رحلة بحرية في المارينا، وليلة في مخيم صحراوي.",
    image_key: "dest2",
    featured: true,
    created_at: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    slug: "maldives-overwater",
    title: "Maldives Overwater Retreat",
    title_ar: "استجمام فوق مياه المالديف",
    destination_id: FALLBACK_DESTINATIONS[2].id,
    place: "Maldives",
    place_ar: "المالديف",
    days: 7,
    nights: 6,
    min_people: 2,
    max_people: 2,
    price: 1650,
    rating: 5,
    category: "Beach",
    description: "Private overwater villa with snorkelling and spa days.",
    description_ar: "فيلا خاصة فوق الماء مع سنوركلينغ وأيام سبا.",
    image_key: "dest3",
    featured: true,
    created_at: "2026-08-01T00:00:00.000Z",
  },
];

const FALLBACK_HOME_CONTENT = {
  destinations: FALLBACK_DESTINATIONS,
  tours: FALLBACK_TOURS,
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

export const getHomeContent = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = publicClient();
    const [destinations, tours] = await Promise.all([
      supabase.from("destinations").select("*").order("featured", { ascending: false }).limit(4),
      supabase.from("tour_packages").select("*").order("featured", { ascending: false }).limit(3),
    ]);
    if (destinations.error) throw destinations.error;
    if (tours.error) throw tours.error;
    return { destinations: destinations.data, tours: tours.data };
  } catch (error) {
    console.error("[Supabase] Falling back to bundled homepage catalog.", error);
    return FALLBACK_HOME_CONTENT;
  }
});

const searchSchema = z.object({
  type: z.enum(["tours", "flights", "hotels"]).default("tours"),
  q: z.string().max(120).optional(),
  from: z.string().max(120).optional(),
  to: z.string().max(120).optional(),
  maxPrice: z.number().min(0).max(100000).optional(),
  category: z.string().max(60).optional(),
  stars: z.number().min(1).max(5).optional(),
  stops: z.number().min(0).max(3).optional(),
  cabin: z.string().max(30).optional(),
  sort: z.enum(["price_asc", "price_desc", "rating"]).default("price_asc"),
});

export type SearchInput = z.infer<typeof searchSchema>;

function containsAny(term: string, columns: string[]) {
  const safeTerm = term.replace(/[,()]/g, " ").trim();
  return columns.map((column) => `${column}.ilike.%${safeTerm}%`).join(",");
}

export const searchCatalog = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => searchSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const asc = data.sort !== "price_desc";

    if (data.type === "flights") {
      let q = supabase.from("flights").select("*");
      if (data.from) q = q.or(containsAny(data.from, ["from_city", "from_city_ar"]));
      if (data.to) q = q.or(containsAny(data.to, ["to_city", "to_city_ar"]));
      if (data.q) q = q.or(containsAny(data.q, ["from_city", "from_city_ar", "to_city", "to_city_ar", "airline", "airline_ar"]));
      if (data.maxPrice) q = q.lte("price", data.maxPrice);
      if (data.cabin) q = q.eq("cabin", data.cabin);
      if (data.stops !== undefined) q = q.lte("stops", data.stops);
      const { data: rows, error } = await q.order("price", { ascending: asc }).limit(50);
      if (error) throw error;
      return { type: "flights" as const, flights: rows, hotels: [], tours: [] };
    }

    if (data.type === "hotels") {
      let q = supabase.from("hotels").select("*");
      const term = data.q || data.to;
      if (term) q = q.or(containsAny(term, ["city", "city_ar", "country", "name", "name_ar"]));
      if (data.maxPrice) q = q.lte("price_per_night", data.maxPrice);
      if (data.stars) q = q.gte("stars", data.stars);
      const { data: rows, error } =
        data.sort === "rating"
          ? await q.order("rating", { ascending: false }).limit(50)
          : await q.order("price_per_night", { ascending: asc }).limit(50);
      if (error) throw error;
      return { type: "hotels" as const, flights: [], hotels: rows, tours: [] };
    }

    let q = supabase.from("tour_packages").select("*");
    const term = data.q || data.to;
    if (term) q = q.or(containsAny(term, ["title", "title_ar", "place", "place_ar", "description", "description_ar"]));
    if (data.maxPrice) q = q.lte("price", data.maxPrice);
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, error } =
      data.sort === "rating"
        ? await q.order("rating", { ascending: false }).limit(50)
        : await q.order("price", { ascending: asc }).limit(50);
    if (error) throw error;
    return { type: "tours" as const, flights: [], hotels: [], tours: rows };
  });
