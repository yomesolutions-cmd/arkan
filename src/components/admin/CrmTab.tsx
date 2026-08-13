import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Facebook,
  Instagram,
  MessageCircle,
  Send,
  UserPlus,
  Users,
  Inbox,
  Plus,
  Save,
} from "lucide-react";
import {
  createLeadFromConversation,
  listCrmDashboard,
  saveCrmLead,
  saveSocialConversation,
  saveSocialMessage,
  type CrmLead,
  type SocialChannel,
  type SocialConversation,
  type SocialMessage,
} from "@/lib/crm.functions";
import { useI18n } from "@/lib/i18n";

const CHANNELS: { id: SocialChannel | "all"; label: string; icon: typeof Inbox; color: string }[] = [
  { id: "all", label: "All", icon: Inbox, color: "bg-ink text-background" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "bg-blue-600 text-white" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "bg-emerald-600 text-white" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "bg-pink-600 text-white" },
  { id: "website", label: "Website", icon: Inbox, color: "bg-brand text-primary-foreground" },
];

const leadStatuses = ["new", "contacted", "qualified", "won", "lost"] as const;

function fmt(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function channelMeta(channel: SocialChannel | "all") {
  return CHANNELS.find((c) => c.id === channel) ?? CHANNELS[0];
}

export function CrmTab() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const fetchCrm = useServerFn(listCrmDashboard);
  const saveLead = useServerFn(saveCrmLead);
  const saveConversation = useServerFn(saveSocialConversation);
  const saveMessage = useServerFn(saveSocialMessage);
  const makeLead = useServerFn(createLeadFromConversation);

  const { data, isLoading, error } = useQuery({ queryKey: ["admin-crm"], queryFn: () => fetchCrm() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-crm"] });

  const leadM = useMutation({ mutationFn: (input: LeadFormState) => saveLead({ data: input }), onSuccess: invalidate });
  const convM = useMutation({
    mutationFn: (input: ConversationFormState) => saveConversation({ data: input }),
    onSuccess: invalidate,
  });
  const msgM = useMutation({
    mutationFn: (input: { conversation_id: string; direction: "inbound" | "outbound"; body: string }) =>
      saveMessage({ data: input }),
    onSuccess: invalidate,
  });
  const makeLeadM = useMutation({
    mutationFn: (conversation_id: string) => makeLead({ data: { conversation_id } }),
    onSuccess: invalidate,
  });

  const leads = data?.leads ?? [];
  const conversations = data?.conversations ?? [];
  const messages = data?.messages ?? [];

  const [channel, setChannel] = useState<SocialChannel | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [leadForm, setLeadForm] = useState<LeadFormState>(blankLead());
  const [conversationForm, setConversationForm] = useState<ConversationFormState>(blankConversation());

  const filteredConversations = useMemo(
    () => conversations.filter((c) => channel === "all" || c.channel === channel),
    [channel, conversations],
  );
  const selected = filteredConversations.find((c) => c.id === selectedId) ?? filteredConversations[0] ?? null;
  const selectedMessages = messages.filter((m) => m.conversation_id === selected?.id);

  const counts = {
    open: conversations.filter((c) => c.status === "open").length,
    leads: leads.length,
    newLeads: leads.filter((l) => l.status === "new").length,
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric icon={Inbox} label="Open inbox" value={counts.open} />
        <Metric icon={Users} label="Total leads" value={counts.leads} />
        <Metric icon={UserPlus} label="New leads" value={counts.newLeads} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div>
          <p className="text-base font-extrabold text-ink">Social CRM</p>
          <p className="text-xs text-muted-foreground">Messenger, WhatsApp, Instagram, leads, and follow-up activity.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setChannel(item.id)}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold ${
                  channel === item.id
                    ? "border-brand bg-brand text-primary-foreground"
                    : "border-border bg-background text-ink hover:bg-muted"
                }`}
              >
                <Icon className="size-3.5" /> {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {error instanceof Error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-extrabold text-ink">Social inbox</p>
          </div>
          <div className="grid min-h-[31rem] md:grid-cols-[18rem_1fr]">
            <div className="border-b border-border md:border-b-0 md:border-e">
              {isLoading && <p className="p-4 text-sm text-muted-foreground">{t("admin.loading")}</p>}
              {!isLoading && !filteredConversations.length && (
                <p className="p-4 text-sm text-muted-foreground">{t("admin.empty")}</p>
              )}
              {filteredConversations.map((conversation) => (
                <ConversationButton
                  key={conversation.id}
                  conversation={conversation}
                  active={selected?.id === conversation.id}
                  onClick={() => setSelectedId(conversation.id)}
                />
              ))}
            </div>
            <div className="flex min-h-[31rem] flex-col">
              {selected ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                    <div>
                      <p className="font-extrabold text-ink">{selected.contact_name || selected.contact_handle || "Visitor"}</p>
                      <p className="text-xs text-muted-foreground">{selected.contact_handle ?? channelMeta(selected.channel).label}</p>
                    </div>
                    <button
                      onClick={() => makeLeadM.mutate(selected.id)}
                      disabled={Boolean(selected.lead_id) || makeLeadM.isPending}
                      className="flex items-center gap-2 rounded-md border border-brand px-3 py-2 text-xs font-semibold text-brand hover:bg-brand hover:text-primary-foreground disabled:opacity-40"
                    >
                      <UserPlus className="size-3.5" /> {selected.lead_id ? "Lead linked" : "Make lead"}
                    </button>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto bg-muted/45 p-4">
                    {selectedMessages.map((message) => (
                      <p
                        key={message.id}
                        className={
                          message.direction === "outbound"
                            ? "ms-auto max-w-[80%] rounded-2xl rounded-se-sm bg-brand px-3 py-2 text-sm font-semibold text-primary-foreground"
                            : "max-w-[80%] rounded-2xl rounded-ss-sm border border-border bg-background px-3 py-2 text-sm text-ink"
                        }
                      >
                        {message.body}
                      </p>
                    ))}
                    {!selectedMessages.length && (
                      <p className="text-sm text-muted-foreground">No messages recorded yet.</p>
                    )}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!reply.trim()) return;
                      msgM.mutate({ conversation_id: selected.id, direction: "outbound", body: reply.trim() });
                      setReply("");
                    }}
                    className="flex gap-2 border-t border-border p-3"
                  >
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a reply or internal follow-up"
                      className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground">
                      <Send className="size-4" /> Send
                    </button>
                  </form>
                </>
              ) : (
                <p className="p-4 text-sm text-muted-foreground">Select a conversation.</p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <ConversationForm
            value={conversationForm}
            saving={convM.isPending}
            onChange={setConversationForm}
            onSubmit={() => {
              convM.mutate(conversationForm);
              setConversationForm(blankConversation());
            }}
          />
          <LeadForm
            value={leadForm}
            saving={leadM.isPending}
            onChange={setLeadForm}
            onSubmit={() => {
              leadM.mutate(leadForm);
              setLeadForm(blankLead());
            }}
          />
        </section>
      </div>

      <section className="overflow-x-auto rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-extrabold text-ink">Leads list</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">Client</th>
              <th className="px-4 py-3 text-start">Contact</th>
              <th className="px-4 py-3 text-start">Channel</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Last message</th>
              <th className="px-4 py-3 text-start">Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} onEdit={setLeadForm} />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Inbox; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">{value}</p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function ConversationButton({
  conversation,
  active,
  onClick,
}: {
  conversation: SocialConversation;
  active: boolean;
  onClick: () => void;
}) {
  const meta = channelMeta(conversation.channel);
  const Icon = meta.icon;
  return (
    <button
      onClick={onClick}
      className={`block w-full border-b border-border px-4 py-3 text-start hover:bg-muted ${
        active ? "bg-brand/10" : "bg-card"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`flex size-7 items-center justify-center rounded-full ${meta.color}`}>
          <Icon className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-ink">{conversation.contact_name || conversation.contact_handle}</p>
          <p className="truncate text-xs text-muted-foreground">{conversation.last_message ?? "No message yet"}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[0.68rem] font-semibold text-muted-foreground">
        <span className="uppercase">{conversation.status}</span>
        <span>{fmt(conversation.last_message_at)}</span>
      </div>
    </button>
  );
}

type ConversationFormState = {
  id?: string;
  channel: SocialChannel;
  contact_name: string;
  contact_handle: string;
  status: "open" | "pending" | "closed";
  lead_id?: string | null;
  last_message: string;
};

function blankConversation(): ConversationFormState {
  return { channel: "facebook", contact_name: "", contact_handle: "", status: "open", last_message: "" };
}

function ConversationForm({
  value,
  saving,
  onChange,
  onSubmit,
}: {
  value: ConversationFormState;
  saving: boolean;
  onChange: (value: ConversationFormState) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-ink">Add social chat</p>
        <Plus className="size-4 text-brand" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <select
          value={value.channel}
          onChange={(e) => onChange({ ...value, channel: e.target.value as SocialChannel })}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {CHANNELS.filter((c) => c.id !== "all").map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <select
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value as ConversationFormState["status"] })}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <input
        value={value.contact_name}
        onChange={(e) => onChange({ ...value, contact_name: e.target.value })}
        placeholder="Client name"
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        value={value.contact_handle}
        onChange={(e) => onChange({ ...value, contact_handle: e.target.value })}
        placeholder="@handle or phone"
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <textarea
        value={value.last_message}
        onChange={(e) => onChange({ ...value, last_message: e.target.value })}
        rows={3}
        placeholder="Last client message"
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <button className="mt-3 flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground">
        <Save className="size-4" /> {saving ? "Saving..." : "Save chat"}
      </button>
    </form>
  );
}

type LeadFormState = {
  id?: string;
  full_name: string;
  phone: string;
  email: string;
  channel: SocialChannel;
  status: "new" | "contacted" | "qualified" | "won" | "lost";
  source_question_id?: string | null;
  last_message: string;
  notes: string;
};

function blankLead(): LeadFormState {
  return { full_name: "", phone: "", email: "", channel: "website", status: "new", last_message: "", notes: "" };
}

function LeadForm({
  value,
  saving,
  onChange,
  onSubmit,
}: {
  value: LeadFormState;
  saving: boolean;
  onChange: (value: LeadFormState) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-ink">{value.id ? "Update lead" : "Add lead"}</p>
        <UserPlus className="size-4 text-brand" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={value.full_name}
          onChange={(e) => onChange({ ...value, full_name: e.target.value })}
          placeholder="Client name"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          placeholder="Phone"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          placeholder="Email"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          value={value.channel}
          onChange={(e) => onChange({ ...value, channel: e.target.value as SocialChannel })}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {CHANNELS.filter((c) => c.id !== "all").map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <select
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value as LeadFormState["status"] })}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2"
        >
          {leadStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <textarea
        value={value.last_message}
        onChange={(e) => onChange({ ...value, last_message: e.target.value })}
        rows={2}
        placeholder="Last message"
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <textarea
        value={value.notes}
        onChange={(e) => onChange({ ...value, notes: e.target.value })}
        rows={3}
        placeholder="Notes"
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Save className="size-4" /> {saving ? "Saving..." : "Save lead"}
        </button>
        {value.id && (
          <button
            type="button"
            onClick={() => onChange(blankLead())}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-muted"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

function LeadRow({ lead, onEdit }: { lead: CrmLead; onEdit: (lead: LeadFormState) => void }) {
  const meta = channelMeta(lead.channel);
  const Icon = meta.icon;
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3">
        <button
          onClick={() =>
            onEdit({
              id: lead.id,
              full_name: lead.full_name,
              phone: lead.phone ?? "",
              email: lead.email ?? "",
              channel: lead.channel,
              status: lead.status as LeadFormState["status"],
              source_question_id: lead.source_question_id,
              last_message: lead.last_message ?? "",
              notes: lead.notes ?? "",
            })
          }
          className="font-extrabold text-brand hover:underline"
        >
          {lead.full_name || "Unnamed lead"}
        </button>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{lead.phone || lead.email || "-"}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.color}`}>
          <Icon className="size-3" /> {meta.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold uppercase text-muted-foreground">
          {lead.status}
        </span>
      </td>
      <td className="max-w-md truncate px-4 py-3 text-muted-foreground">{lead.last_message ?? "-"}</td>
      <td className="px-4 py-3 text-muted-foreground">{fmt(lead.created_at)}</td>
    </tr>
  );
}
