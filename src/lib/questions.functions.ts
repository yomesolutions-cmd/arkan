import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type QuestionNode = {
  id: string;
  parent_id: string | null;
  label: string;
  label_ar: string;
  answer: string | null;
  answer_ar: string | null;
  sort_order: number;
  is_active: boolean;
};

const COLUMNS = "id, parent_id, label, label_ar, answer, answer_ar, sort_order, is_active";

/** Public read: active question tree for the chat box. */
export const listPublicQuestions = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await client
    .from("question_nodes")
    .select(COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as QuestionNode[];
});

/** Is the signed-in caller an admin? */
export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw error;
    return { isAdmin: Boolean(data) };
  });

/** Admin read: full tree including inactive nodes. */
export const listAllQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("question_nodes")
      .select(COLUMNS)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as QuestionNode[];
  });

const createSchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
  label: z.string().trim().min(1).max(200),
  label_ar: z.string().trim().max(200).default(""),
  answer: z.string().trim().max(4000).nullable().optional(),
  answer_ar: z.string().trim().max(4000).nullable().optional(),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const createQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("question_nodes")
      .insert({
        parent_id: data.parent_id ?? null,
        label: data.label,
        label_ar: data.label_ar,
        answer: data.answer || null,
        answer_ar: data.answer_ar || null,
        sort_order: data.sort_order,
      })
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return row as QuestionNode;
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  label: z.string().trim().min(1).max(200).optional(),
  label_ar: z.string().trim().max(200).optional(),
  answer: z.string().trim().max(4000).nullable().optional(),
  answer_ar: z.string().trim().max(4000).nullable().optional(),
  sort_order: z.number().int().min(0).max(9999).optional(),
  is_active: z.boolean().optional(),
});

export const updateQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const patch: {
      label?: string;
      label_ar?: string;
      answer?: string | null;
      answer_ar?: string | null;
      sort_order?: number;
      is_active?: boolean;
    } = {};
    if (data.label !== undefined) patch.label = data.label;
    if (data.label_ar !== undefined) patch.label_ar = data.label_ar;
    if (data.answer !== undefined) patch.answer = data.answer || null;
    if (data.answer_ar !== undefined) patch.answer_ar = data.answer_ar || null;
    if (data.sort_order !== undefined) patch.sort_order = data.sort_order;
    if (data.is_active !== undefined) patch.is_active = data.is_active;
    const { data: row, error } = await context.supabase
      .from("question_nodes")
      .update(patch)
      .eq("id", data.id)
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return row as QuestionNode;
  });

export const deleteQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("question_nodes").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
