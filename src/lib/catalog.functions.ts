import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
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
  const supabase = publicClient();
  const [destinations, tours] = await Promise.all([
    supabase.from("destinations").select("*").order("featured", { ascending: false }).limit(4),
    supabase.from("tour_packages").select("*").order("featured", { ascending: false }).limit(3),
  ]);
  if (destinations.error) throw destinations.error;
  if (tours.error) throw tours.error;
  return { destinations: destinations.data, tours: tours.data };
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
