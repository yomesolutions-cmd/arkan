import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PassportAlert = {
  id: string;
  traveler_name: string;
  phone: string;
  email: string | null;
  passport_number: string | null;
  passport_country: string | null;
  passport_image_url: string | null;
  expires_on: string;
  reminder_days_before: number;
  sms_message: string | null;
  sms_sent_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const COLUMNS =
  "id, traveler_name, phone, email, passport_number, passport_country, passport_image_url, expires_on, reminder_days_before, sms_message, sms_sent_at, notes, created_at, updated_at";

const alertInput = z.object({
  id: z.string().uuid().optional(),
  traveler_name: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(3).max(40),
  email: z.string().trim().email().max(200).nullable().optional(),
  passport_number: z.string().trim().max(80).nullable().optional(),
  passport_country: z.string().trim().max(120).nullable().optional(),
  passport_image_url: z.string().trim().url().max(1000).nullable().optional().or(z.literal("")),
  expires_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reminder_days_before: z.number().int().min(0).max(730).default(30),
  sms_message: z.string().trim().max(500).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const listPassportAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("passport_alerts")
      .select(COLUMNS)
      .order("expires_on", { ascending: true });
    if (error) throw error;
    return (data ?? []) as PassportAlert[];
  });

export const savePassportAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => alertInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, passport_image_url, ...rest } = data;
    const payload = {
      ...rest,
      email: rest.email || null,
      passport_number: rest.passport_number || null,
      passport_country: rest.passport_country || null,
      passport_image_url: passport_image_url || null,
      sms_message: rest.sms_message || null,
      notes: rest.notes || null,
    };
    const q = id
      ? context.supabase.from("passport_alerts").update(payload).eq("id", id)
      : context.supabase.from("passport_alerts").insert({ ...payload, created_by: context.userId });
    const { error } = await q;
    if (error) throw error;
    return { ok: true };
  });

export const markPassportSmsSent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("passport_alerts")
      .update({ sms_sent_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deletePassportAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("passport_alerts").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
