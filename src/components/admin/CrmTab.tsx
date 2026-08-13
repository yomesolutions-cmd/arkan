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
  Search,
  MoreHorizontal,
  PanelRightOpen,
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
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [leadForm, setLeadForm] = useState<LeadFormState>(blankLead());
  const [conversationForm, setConversationForm] = useState<ConversationFormState>(blankConversation());

  const filteredConversations = useMemo(
    () =>
      conversations.filter((c) => {
        const channelOk = channel === "all" || c.channel === channel;
        const term = search.trim().toLowerCase();
        const searchOk =
          !term ||
          c.contact_name.toLowerCase().includes(term) ||
          (c.contact_handle ?? "").toLowerCase().includes(term) ||
          (c.last_message ?? "").toLowerCase().includes(term);
        return channelOk && searchOk;
      }),
    [channel, conversations, search],
  );
  const selected = filteredConversations.find((c) => c.id === selectedId) ?? filteredConversations[0] ?? null;
  const selectedMessages = messages.filter((m) => m.conversation_id === selected?.id);
  const selectedLead = leads.find((lead) => lead.id === selected?.lead_id) ?? null;
  const activeMeta = channelMeta(channel);
  const ActiveIcon = activeMeta.icon;

  const counts = {
    open: conversations.filter((c) => c.status === "open").length,
    leads: leads.length,
    newLeads: leads.filter((l) => l.status === "new").length,
  };

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <ActiveIcon className="size-5" />
            <h2 className="text-base font-extrabold">{channel === "all" ? "Messenger" : activeMeta.label}</h2>
          </div>
          <div className="hidden items-center gap-2 text-xs font-semibold md:flex">
            <span>{counts.open} open</span>
            <span className="h-4 w-px bg-white/35" />
            <span>{counts.leads} leads</span>
            <span className="h-4 w-px bg-white/35" />
            <span>{counts.newLeads} new</span>
          </div>
        </div>

        <div className="grid min-h-[42rem] bg-background xl:grid-cols-[20rem_minmax(0,1fr)_20rem]">
          <aside className="border-b border-border bg-card xl:border-b-0 xl:border-e">
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <Avatar name="Admin" channel="website" />
                <div>
                  <p className="text-sm font-extrabold text-ink">Admin</p>
                  <p className="text-xs text-muted-foreground">Arkan Travel CRM</p>
                </div>
              </div>

              <label className="mt-4 flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                {CHANNELS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setChannel(item.id)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
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

            <div className="h-[30rem] overflow-y-auto xl:h-[34rem]">
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
          </aside>

          <main className="flex min-h-[34rem] flex-col bg-white">
            {selected ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={selected.contact_name || selected.contact_handle || "Visitor"} channel={selected.channel} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-ink">
                        {selected.contact_name || selected.contact_handle || "Visitor"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {selected.contact_handle ?? channelMeta(selected.channel).label} · {selected.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => makeLeadM.mutate(selected.id)}
                      disabled={Boolean(selected.lead_id) || makeLeadM.isPending}
                      className="flex items-center gap-2 rounded-md border border-brand px-3 py-2 text-xs font-semibold text-brand hover:bg-brand hover:text-primary-foreground disabled:opacity-40"
                    >
                      <UserPlus className="size-3.5" /> {selected.lead_id ? "Lead linked" : "Make lead"}
                    </button>
                    <button className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted" aria-label="Conversation options">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-5 py-5">
                  {selectedMessages.map((message) => (
                    <div key={message.id} className={message.direction === "outbound" ? "flex justify-end" : "flex justify-start"}>
                      <div
                        className={
                          message.direction === "outbound"
                            ? "max-w-[75%] rounded-2xl rounded-se-sm bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm"
                            : "max-w-[75%] rounded-2xl rounded-ss-sm border border-border bg-background px-4 py-2 text-sm text-ink shadow-sm"
                        }
                      >
                        <p>{message.body}</p>
                        <p className={`mt-1 text-[0.65rem] ${message.direction === "outbound" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {fmt(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {!selectedMessages.length && (
                    <div className="flex h-full items-center justify-center text-center">
                      <div>
                        <MessageCircle className="mx-auto size-10 text-muted-foreground/50" />
                        <p className="mt-2 text-sm font-semibold text-ink">No messages recorded yet</p>
                        <p className="text-xs text-muted-foreground">Send a reply below to start the timeline.</p>
                      </div>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!reply.trim()) return;
                    msgM.mutate({ conversation_id: selected.id, direction: "outbound", body: reply.trim() });
                    setReply("");
                  }}
                  className="flex items-center gap-2 border-t border-border bg-card p-3"
                >
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a message..."
                    className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
                  />
                  <button className="flex size-10 items-center justify-center rounded-full bg-brand text-primary-foreground hover:bg-brand-dark" aria-label="Send message">
                    <Send className="size-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex h-full min-h-[34rem] items-center justify-center text-center">
                <div>
                  <MessageCircle className="mx-auto size-12 text-muted-foreground/40" />
                  <p className="mt-3 text-base font-extrabold text-ink">Choose a chat</p>
                  <p className="text-sm text-muted-foreground">Select a conversation from the left sidebar to start messaging.</p>
                </div>
              </div>
            )}
          </main>

          <aside className="border-t border-border bg-card xl:border-s xl:border-t-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-extrabold text-ink">Client panel</p>
              <PanelRightOpen className="size-4 text-muted-foreground" />
            </div>
            <div className="space-y-4 p-4">
              {selected ? (
                <div className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={selected.contact_name || selected.contact_handle || "Visitor"} channel={selected.channel} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-ink">
                        {selected.contact_name || selected.contact_handle || "Visitor"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{selected.contact_handle ?? "-"}</p>
                    </div>
                  </div>
                  <dl className="mt-4 space-y-2 text-xs">
                    <Info label="Channel" value={channelMeta(selected.channel).label} />
                    <Info label="Status" value={selected.status} />
                    <Info label="Last message" value={fmt(selected.last_message_at)} />
                    <Info label="Lead" value={selectedLead ? selectedLead.status : selected.lead_id ? "Linked" : "Not linked"} />
                  </dl>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No conversation selected.</p>
              )}

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
            </div>
          </aside>
        </div>
      </section>

      {error instanceof Error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </p>
      )}

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

function Avatar({ name, channel }: { name: string; channel: SocialChannel }) {
  const meta = channelMeta(channel);
  const Icon = meta.icon;
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A";

  return (
    <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-extrabold text-background">
      {initials}
      <span className={`absolute -bottom-0.5 -end-0.5 flex size-5 items-center justify-center rounded-full ring-2 ring-card ${meta.color}`}>
        <Icon className="size-3" />
      </span>
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className="max-w-[9rem] text-end font-bold text-ink">{value}</dd>
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
