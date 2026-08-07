import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

const createSchema = z.object({
  item_type: z.enum(["flight", "hotel", "tour"]),
  item_id: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(160),
  subtitle: z.string().trim().max(200).optional(),
  travel_date: z.string().max(20).optional(),
  guests: z.number().int().min(1).max(20).default(1),
  total_price: z.number().min(0).max(1000000).default(0),
  notes: z.string().trim().max(1000).optional(),
});

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("bookings")
      .insert({
        user_id: context.userId,
        item_type: data.item_type,
        item_id: data.item_id ?? null,
        title: data.title,
        subtitle: data.subtitle ?? null,
        travel_date: data.travel_date || null,
        guests: data.guests,
        total_price: data.total_price,
        notes: data.notes ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
  travel_date: z.string().max(20).nullable().optional(),
  guests: z.number().int().min(1).max(20).optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const updateBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { id } = data;
    const patch: Record<string, unknown> = {};
    if (data.status !== undefined) patch["status"] = data.status;
    if (data.travel_date !== undefined) patch["travel_date"] = data.travel_date;
    if (data.guests !== undefined) patch["guests"] = data.guests;
    if (data.notes !== undefined) patch["notes"] = data.notes;
    const { data: row, error } = await context.supabase
      .from("bookings")
      .update(patch)
      .eq("id", id)
      .eq("user_id", context.userId)
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("bookings")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
