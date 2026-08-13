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

export type ExtractedPassportInfo = {
  traveler_name: string | null;
  passport_number: string | null;
  passport_country: string | null;
  expires_on: string | null;
  confidence: "low" | "medium" | "high";
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

const extractInput = z.object({
  image_data_url: z.string().startsWith("data:image/").max(7_000_000),
});

function parseJsonObject(text: string) {
  const trimmed = text.trim();
  const match = trimmed.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : trimmed) as Partial<ExtractedPassportInfo>;
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const dmy = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (!dmy) return null;
  const [, dd, mm, yy] = dmy;
  const year = yy.length === 2 ? `20${yy}` : yy;
  return `${year}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function asText(value: unknown, max = 160) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function normalizeInfo(parsed: Partial<ExtractedPassportInfo>) {
  return {
    traveler_name: asText(parsed.traveler_name),
    passport_number: asText(parsed.passport_number, 80),
    passport_country: asText(parsed.passport_country, 120),
    expires_on: normalizeDate(parsed.expires_on),
    confidence:
      parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
        ? parsed.confidence
        : "low",
  } satisfies ExtractedPassportInfo;
}

function splitDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data.");
  return { mimeType: match[1], base64: match[2] };
}

const passportPrompt =
  "Extract visible passport details for an admin form. Return only JSON with traveler_name, passport_number, passport_country, expires_on as YYYY-MM-DD, and confidence as low, medium, or high. Use null for anything unreadable.";

async function extractWithOpenAI(imageDataUrl: string, key: string) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env["OPENAI_PASSPORT_MODEL"] || "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: passportPrompt },
            { type: "input_image", image_url: imageDataUrl },
          ],
        },
      ],
      max_output_tokens: 400,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI extraction failed: ${body.slice(0, 300)}`);
  }

  const result = await response.json();
  const outputText =
    result.output_text ??
    result.output?.flatMap((item: { content?: { text?: string }[] }) => item.content ?? [])
      .map((content: { text?: string }) => content.text)
      .filter(Boolean)
      .join("\n") ??
    "";
  return normalizeInfo(parseJsonObject(outputText));
}

async function extractWithGemini(imageDataUrl: string, key: string) {
  const { mimeType, base64 } = splitDataUrl(imageDataUrl);
  const model = process.env["GEMINI_PASSPORT_MODEL"] || "gemini-3.6-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: base64 } },
            { text: passportPrompt },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini extraction failed: ${body.slice(0, 300)}`);
  }

  const result = await response.json();
  const outputText =
    result.candidates?.flatMap((candidate: { content?: { parts?: { text?: string }[] } }) => candidate.content?.parts ?? [])
      .map((part: { text?: string }) => part.text)
      .filter(Boolean)
      .join("\n") ?? "";
  return normalizeInfo(parseJsonObject(outputText));
}

export const extractPassportInfoFromImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => extractInput.parse(input))
  .handler(async ({ data }) => {
    const openAIKey = process.env["OPENAI_API_KEY"];
    const geminiKey = process.env["GEMINI_API_KEY"];
    const failures: string[] = [];

    if (openAIKey) {
      try {
        return await extractWithOpenAI(data.image_data_url, openAIKey);
      } catch (error) {
        failures.push(error instanceof Error ? error.message : "OpenAI extraction failed.");
      }
    } else {
      failures.push("OPENAI_API_KEY is not configured.");
    }

    if (geminiKey) {
      try {
        return await extractWithGemini(data.image_data_url, geminiKey);
      } catch (error) {
        failures.push(error instanceof Error ? error.message : "Gemini extraction failed.");
      }
    } else {
      failures.push("GEMINI_API_KEY is not configured.");
    }

    throw new Error(failures.join(" "));
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
      : context.supabase
          .from("passport_alerts")
          .insert(context.userId ? { ...payload, created_by: context.userId } : payload);
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
