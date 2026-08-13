import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const channels = ["facebook", "whatsapp", "instagram", "website"] as const;
export type SocialChannel = (typeof channels)[number];

export type CrmLead = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  channel: SocialChannel;
  status: string;
  source_question_id: string | null;
  last_message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialConversation = {
  id: string;
  channel: SocialChannel;
  contact_name: string;
  contact_handle: string | null;
  status: string;
  lead_id: string | null;
  last_message: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
};

export type SocialMessage = {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  body: string;
  external_id: string | null;
  created_at: string;
};

const channelSchema = z.enum(channels);

const LEAD_COLS =
  "id, full_name, phone, email, channel, status, source_question_id, last_message, notes, created_at, updated_at";
const CONVERSATION_COLS =
  "id, channel, contact_name, contact_handle, status, lead_id, last_message, last_message_at, created_at, updated_at";
const MESSAGE_COLS = "id, conversation_id, direction, body, external_id, created_at";

export const listCrmDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [leads, conversations, messages] = await Promise.all([
      context.supabase.from("crm_leads").select(LEAD_COLS).order("created_at", { ascending: false }).limit(500),
      context.supabase
        .from("social_conversations")
        .select(CONVERSATION_COLS)
        .order("last_message_at", { ascending: false })
        .limit(500),
      context.supabase
        .from("social_messages")
        .select(MESSAGE_COLS)
        .order("created_at", { ascending: true })
        .limit(1000),
    ]);
    if (leads.error) throw leads.error;
    if (conversations.error) throw conversations.error;
    if (messages.error) throw messages.error;
    return {
      leads: (leads.data ?? []) as CrmLead[],
      conversations: (conversations.data ?? []) as SocialConversation[],
      messages: (messages.data ?? []) as SocialMessage[],
    };
  });

const leadInput = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().trim().max(160).default(""),
  phone: z.string().trim().max(60).nullable().optional().or(z.literal("")),
  email: z.string().trim().email().max(200).nullable().optional().or(z.literal("")),
  channel: channelSchema.default("website"),
  status: z.enum(["new", "contacted", "qualified", "won", "lost"]).default("new"),
  source_question_id: z.string().uuid().nullable().optional(),
  last_message: z.string().trim().max(1200).nullable().optional().or(z.literal("")),
  notes: z.string().trim().max(3000).nullable().optional().or(z.literal("")),
});

export const saveCrmLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => leadInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const payload = {
      ...rest,
      phone: rest.phone || null,
      email: rest.email || null,
      source_question_id: rest.source_question_id ?? null,
      last_message: rest.last_message || null,
      notes: rest.notes || null,
    };
    const query = id
      ? context.supabase.from("crm_leads").update(payload).eq("id", id).select(LEAD_COLS).single()
      : context.supabase.from("crm_leads").insert(payload).select(LEAD_COLS).single();
    const { data: row, error } = await query;
    if (error) throw error;
    return row as CrmLead;
  });

const conversationInput = z.object({
  id: z.string().uuid().optional(),
  channel: channelSchema.default("facebook"),
  contact_name: z.string().trim().max(160).default(""),
  contact_handle: z.string().trim().max(160).nullable().optional().or(z.literal("")),
  status: z.enum(["open", "pending", "closed"]).default("open"),
  lead_id: z.string().uuid().nullable().optional(),
  last_message: z.string().trim().max(1200).nullable().optional().or(z.literal("")),
});

export const saveSocialConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => conversationInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const payload = {
      ...rest,
      contact_handle: rest.contact_handle || null,
      lead_id: rest.lead_id ?? null,
      last_message: rest.last_message || null,
      last_message_at: new Date().toISOString(),
    };
    const query = id
      ? context.supabase.from("social_conversations").update(payload).eq("id", id).select(CONVERSATION_COLS).single()
      : context.supabase.from("social_conversations").insert(payload).select(CONVERSATION_COLS).single();
    const { data: row, error } = await query;
    if (error) throw error;
    return row as SocialConversation;
  });

const messageInput = z.object({
  conversation_id: z.string().uuid(),
  direction: z.enum(["inbound", "outbound"]).default("outbound"),
  body: z.string().trim().min(1).max(4000),
});

export const saveSocialMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => messageInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("social_messages")
      .insert(data)
      .select(MESSAGE_COLS)
      .single();
    if (error) throw error;
    await context.supabase
      .from("social_conversations")
      .update({
        last_message: data.body,
        last_message_at: new Date().toISOString(),
        status: data.direction === "inbound" ? "open" : "pending",
      })
      .eq("id", data.conversation_id);
    return row as SocialMessage;
  });

export const createLeadFromConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ conversation_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const conversation = await context.supabase
      .from("social_conversations")
      .select(CONVERSATION_COLS)
      .eq("id", data.conversation_id)
      .single();
    if (conversation.error) throw conversation.error;
    const c = conversation.data as SocialConversation;
    const lead = await context.supabase
      .from("crm_leads")
      .insert({
        full_name: c.contact_name || c.contact_handle || "Social lead",
        phone: c.channel === "whatsapp" ? c.contact_handle : null,
        channel: c.channel,
        status: "new",
        last_message: c.last_message,
        notes: `Created from ${c.channel} conversation.`,
      })
      .select(LEAD_COLS)
      .single();
    if (lead.error) throw lead.error;
    await context.supabase.from("social_conversations").update({ lead_id: lead.data.id }).eq("id", c.id);
    return lead.data as CrmLead;
  });
