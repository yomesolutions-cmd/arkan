import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Everything an admin needs to manage the travel catalog, bilingual. */

export const listCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [tours, destinations, hotels, flights] = await Promise.all([
      context.supabase.from("tour_packages").select("*").order("created_at", { ascending: false }),
      context.supabase.from("destinations").select("*").order("created_at", { ascending: false }),
      context.supabase.from("hotels").select("*").order("created_at", { ascending: false }),
      context.supabase.from("flights").select("*").order("depart_at", { ascending: true }),
    ]);
    if (tours.error) throw tours.error;
    if (destinations.error) throw destinations.error;
    if (hotels.error) throw hotels.error;
    if (flights.error) throw flights.error;
    return {
      tours: tours.data ?? [],
      destinations: destinations.data ?? [],
      hotels: hotels.data ?? [],
      flights: flights.data ?? [],
    };
  });

const tourInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(200),
  title_ar: z.string().trim().max(200).default(""),
  place: z.string().trim().min(1).max(120),
  place_ar: z.string().trim().max(120).default(""),
  description: z.string().trim().max(2000).default(""),
  description_ar: z.string().trim().max(2000).default(""),
  days: z.number().int().min(1).max(90).default(5),
  nights: z.number().int().min(0).max(90).default(4),
  min_people: z.number().int().min(1).max(99).default(2),
  max_people: z.number().int().min(1).max(999).default(12),
  price: z.number().min(0).max(1000000),
  rating: z.number().min(0).max(5).default(4.8),
  category: z.string().trim().max(60).default("City"),
  image_key: z.string().trim().max(60).default("dest1"),
  featured: z.boolean().default(false),
});

export const saveTour = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => tourInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { error } = id
      ? await context.supabase.from("tour_packages").update(rest).eq("id", id)
      : await context.supabase.from("tour_packages").insert(rest);
    if (error) throw error;
    return { ok: true };
  });

const destinationInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  name_ar: z.string().trim().max(120).default(""),
  country: z.string().trim().min(1).max(120),
  country_ar: z.string().trim().max(120).default(""),
  region: z.string().trim().max(80).default("Other"),
  description: z.string().trim().max(2000).default(""),
  description_ar: z.string().trim().max(2000).default(""),
  image_key: z.string().trim().max(60).default("dest1"),
  featured: z.boolean().default(false),
});

export const saveDestination = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => destinationInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { error } = id
      ? await context.supabase.from("destinations").update(rest).eq("id", id)
      : await context.supabase.from("destinations").insert(rest);
    if (error) throw error;
    return { ok: true };
  });

const hotelInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(160),
  name_ar: z.string().trim().max(160).default(""),
  city: z.string().trim().min(1).max(120),
  city_ar: z.string().trim().max(120).default(""),
  country: z.string().trim().min(1).max(120),
  stars: z.number().int().min(1).max(5).default(4),
  rating: z.number().min(0).max(5).default(4.5),
  price_per_night: z.number().min(0).max(100000),
  image_key: z.string().trim().max(60).default("dest2"),
  amenities: z.array(z.string().max(60)).max(20).default([]),
});

export const saveHotel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => hotelInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { error } = id
      ? await context.supabase.from("hotels").update(rest).eq("id", id)
      : await context.supabase.from("hotels").insert(rest);
    if (error) throw error;
    return { ok: true };
  });

const flightInput = z.object({
  id: z.string().uuid().optional(),
  airline: z.string().trim().min(1).max(120),
  airline_ar: z.string().trim().max(120).default(""),
  flight_no: z.string().trim().min(1).max(20),
  from_city: z.string().trim().min(1).max(120),
  from_city_ar: z.string().trim().max(120).default(""),
  to_city: z.string().trim().min(1).max(120),
  to_city_ar: z.string().trim().max(120).default(""),
  depart_at: z.string().min(1),
  arrive_at: z.string().min(1),
  stops: z.number().int().min(0).max(5).default(0),
  cabin: z.string().trim().max(40).default("Economy"),
  price: z.number().min(0).max(1000000),
});

export const saveFlight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => flightInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { error } = id
      ? await context.supabase.from("flights").update(rest).eq("id", id)
      : await context.supabase.from("flights").insert(rest);
    if (error) throw error;
    return { ok: true };
  });

export const deleteCatalogItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        table: z.enum(["tour_packages", "destinations", "hotels", "flights"]),
        id: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from(data.table).delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
