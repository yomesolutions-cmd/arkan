import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { listSubscribers, deleteSubscriber, listChatLogs, listUsers } from "@/lib/content.functions";
import { useI18n } from "@/lib/i18n";

function fmt(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function SubscribersTab() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const fetchAll = useServerFn(listSubscribers);
  const remove = useServerFn(deleteSubscriber);
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-subscribers"], queryFn: () => fetchAll() });
  const delM = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-subscribers"] }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("admin.loading")}</p>;
  if (!data.length) return <p className="text-sm text-muted-foreground">{t("admin.empty")}</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-start">Email</th>
            <th className="px-4 py-3 text-start">Language</th>
            <th className="px-4 py-3 text-start">Joined</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {data.map((s) => (
            <tr key={s.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium text-ink">{s.email}</td>
              <td className="px-4 py-3 uppercase text-muted-foreground">{s.locale}</td>
              <td className="px-4 py-3 text-muted-foreground">{fmt(s.created_at)}</td>
              <td className="px-4 py-3 text-end">
                <button
                  onClick={() => delM.mutate(s.id)}
                  aria-label="Delete subscriber"
                  className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
                >
                  <Trash2 className="size-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChatLogsTab() {
  const { t } = useI18n();
  const fetchAll = useServerFn(listChatLogs);
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-chat-logs"], queryFn: () => fetchAll() });

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("admin.loading")}</p>;
  if (!data.length) return <p className="text-sm text-muted-foreground">{t("admin.empty")}</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-start">Topic clicked</th>
            <th className="px-4 py-3 text-start">Level</th>
            <th className="px-4 py-3 text-start">Language</th>
            <th className="px-4 py-3 text-start">Session</th>
            <th className="px-4 py-3 text-start">When</th>
          </tr>
        </thead>
        <tbody>
          {data.map((l) => (
            <tr key={l.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium text-ink">{l.node_label}</td>
              <td className="px-4 py-3 text-muted-foreground">{l.depth}</td>
              <td className="px-4 py-3 uppercase text-muted-foreground">{l.locale}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.session_id.slice(0, 8)}</td>
              <td className="px-4 py-3 text-muted-foreground">{fmt(l.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UsersTab() {
  const { t } = useI18n();
  const fetchAll = useServerFn(listUsers);
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => fetchAll() });

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("admin.loading")}</p>;
  if (!data.length) return <p className="text-sm text-muted-foreground">{t("admin.empty")}</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-start">Name</th>
            <th className="px-4 py-3 text-start">Email</th>
            <th className="px-4 py-3 text-start">Phone</th>
            <th className="px-4 py-3 text-start">Bookings</th>
            <th className="px-4 py-3 text-start">Role</th>
            <th className="px-4 py-3 text-start">Joined</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr key={u.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium text-ink">{u.full_name ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.email ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.bookings}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.is_admin ? "Admin" : "Customer"}</td>
              <td className="px-4 py-3 text-muted-foreground">{fmt(u.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
