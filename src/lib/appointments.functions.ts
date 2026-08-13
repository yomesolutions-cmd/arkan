import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Appointment = {
  id: string;
  title: string;
  customer_name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  starts_at: string;
  duration_min: number;
  kind: string;
  status: "scheduled" | "done" | "cancelled";
};

const COLS = "id, title, customer_name, phone, email, notes, starts_at, duration_min, kind, status";

export const listAppointments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("appointments")
      .select(COLS)
      .order("starts_at", { ascending: true })
      .limit(1000);
    if (error) throw error;
    return (data ?? []) as Appointment[];
  });

const appointmentInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(160),
  customer_name: z.string().trim().max(160).default(""),
  phone: z.string().trim().max(40).nullable().default(null),
  email: z.string().trim().max(200).nullable().default(null),
  notes: z.string().trim().max(2000).nullable().default(null),
  starts_at: z.string().min(4).max(40),
  duration_min: z.number().int().min(15).max(1440).default(60),
  kind: z.string().trim().max(60).default("consultation"),
  status: z.enum(["scheduled", "done", "cancelled"]).default("scheduled"),
});

export const saveAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => appointmentInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const payload = { ...rest, starts_at: new Date(rest.starts_at).toISOString() };
    const q = id
      ? context.supabase.from("appointments").update(payload).eq("id", id).select(COLS).single()
      : context.supabase
          .from("appointments")
          .insert(context.userId ? { ...payload, created_by: context.userId } : payload)
          .select(COLS)
          .single();
    const { data: row, error } = await q;
    if (error) throw error;
    return row as Appointment;
  });

export const deleteAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("appointments").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profiles, bookings, subs, logs, appts] = await Promise.all([
      context.supabase.from("profiles").select("id, created_at"),
      context.supabase.from("bookings").select("id, total_price, status, item_type, created_at"),
      context.supabase.from("subscribers").select("id, created_at"),
      context.supabase.from("chat_logs").select("id, node_label, created_at"),
      context.supabase.from("appointments").select("id, status, starts_at"),
    ]);
    if (profiles.error) throw profiles.error;

    const users = profiles.data ?? [];
    const bk = bookings.data ?? [];
    const revenue = bk.filter((b) => b.status !== "cancelled").reduce((s, b) => s + Number(b.total_price), 0);

    const months: { key: string; label: string; users: number; bookings: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString(undefined, { month: "short" }),
        users: 0,
        bookings: 0,
      });
    }
    const bump = (iso: string | null, field: "users" | "bookings") => {
      if (!iso) return;
      const d = new Date(iso);
      const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) m[field] += 1;
    };
    for (const u of users) bump(u.created_at, "users");
    for (const b of bk) bump(b.created_at, "bookings");

    const byType = (["flight", "hotel", "tour"] as const).map((t) => ({
      name: t,
      value: bk.filter((b) => b.item_type === t).length,
    }));

    const topics = new Map<string, number>();
    for (const l of logs.data ?? []) topics.set(l.node_label, (topics.get(l.node_label) ?? 0) + 1);
    const topTopics = [...topics.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    const upcoming = (appts.data ?? []).filter(
      (a) => a.status === "scheduled" && new Date(a.starts_at).getTime() >= Date.now(),
    ).length;

    return {
      totals: {
        users: users.length,
        bookings: bk.length,
        pending: bk.filter((b) => b.status === "pending").length,
        confirmed: bk.filter((b) => b.status === "confirmed").length,
        revenue,
        subscribers: (subs.data ?? []).length,
        chats: (logs.data ?? []).length,
        appointments: upcoming,
      },
      months: months.map(({ label, users: u, bookings: b }) => ({ label, users: u, bookings: b })),
      byType,
      topTopics,
    };
  });
