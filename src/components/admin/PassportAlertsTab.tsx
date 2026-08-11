import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Bell, CheckCircle2, MessageSquareText, Pencil, Trash2 } from "lucide-react";
import {
  deletePassportAlert,
  listPassportAlerts,
  markPassportSmsSent,
  savePassportAlert,
  type PassportAlert,
} from "@/lib/passport-alerts.functions";

const input = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

function todayMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysUntil(date: string) {
  const target = new Date(`${date}T00:00:00`);
  return Math.ceil((target.getTime() - todayMidnight().getTime()) / 86400000);
}

function defaultMessage(name: string, expiresOn: string) {
  return `Hello ${name}, your passport expires on ${expiresOn}. Please renew it before your travel period ends. Arkan Travel`;
}

function emptyForm() {
  return {
    id: undefined as string | undefined,
    traveler_name: "",
    phone: "",
    email: "",
    passport_number: "",
    passport_country: "",
    passport_image_url: "",
    expires_on: "",
    reminder_days_before: 30,
    sms_message: "",
    notes: "",
  };
}

function statusFor(alert: PassportAlert) {
  const days = daysUntil(alert.expires_on);
  if (days < 0) return { label: "Expired", className: "bg-destructive/10 text-destructive" };
  if (alert.sms_sent_at) return { label: "SMS sent", className: "bg-mint text-ink" };
  if (days <= alert.reminder_days_before) return { label: "Send SMS", className: "bg-coral text-primary-foreground" };
  return { label: `${days} days left`, className: "bg-muted text-muted-foreground" };
}

export function PassportAlertsTab() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listPassportAlerts);
  const save = useServerFn(savePassportAlert);
  const remove = useServerFn(deletePassportAlert);
  const markSent = useServerFn(markPassportSmsSent);
  const [form, setForm] = useState(emptyForm);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["admin-passport-alerts"],
    queryFn: () => fetchAll(),
  });

  const saveM = useMutation({
    mutationFn: (payload: ReturnType<typeof emptyForm>) =>
      save({
        data: {
          ...payload,
          reminder_days_before: Number(payload.reminder_days_before),
          sms_message: payload.sms_message || defaultMessage(payload.traveler_name, payload.expires_on),
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-passport-alerts"] });
      setForm(emptyForm());
    },
  });

  const delM = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-passport-alerts"] }),
  });

  const sentM = useMutation({
    mutationFn: (id: string) => markSent({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-passport-alerts"] }),
  });

  const counts = useMemo(() => {
    const due = alerts.filter((a) => !a.sms_sent_at && daysUntil(a.expires_on) <= a.reminder_days_before).length;
    const expired = alerts.filter((a) => daysUntil(a.expires_on) < 0).length;
    return { due, expired, active: alerts.length - expired };
  }, [alerts]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveM.mutate(form);
  }

  function edit(alert: PassportAlert) {
    setForm({
      id: alert.id,
      traveler_name: alert.traveler_name,
      phone: alert.phone,
      email: alert.email ?? "",
      passport_number: alert.passport_number ?? "",
      passport_country: alert.passport_country ?? "",
      passport_image_url: alert.passport_image_url ?? "",
      expires_on: alert.expires_on,
      reminder_days_before: alert.reminder_days_before,
      sms_message: alert.sms_message ?? defaultMessage(alert.traveler_name, alert.expires_on),
      notes: alert.notes ?? "",
    });
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading passport alerts...</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-2xl font-extrabold text-ink">{counts.due}</p>
          <p className="mt-1 text-xs text-muted-foreground">Need SMS now</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-2xl font-extrabold text-ink">{counts.active}</p>
          <p className="mt-1 text-xs text-muted-foreground">Active passports</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-2xl font-extrabold text-ink">{counts.expired}</p>
          <p className="mt-1 text-xs text-muted-foreground">Expired passports</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          {alerts.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No passport alerts yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">Traveler</th>
                  <th className="px-4 py-3 text-start">Passport</th>
                  <th className="px-4 py-3 text-start">Expires</th>
                  <th className="px-4 py-3 text-start">Reminder</th>
                  <th className="px-4 py-3 text-start">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => {
                  const status = statusFor(alert);
                  const message = alert.sms_message || defaultMessage(alert.traveler_name, alert.expires_on);
                  return (
                    <tr key={alert.id} className="border-t border-border align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{alert.traveler_name}</p>
                        <p className="text-xs text-muted-foreground">{alert.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {alert.passport_number || "-"}
                        {alert.passport_country && <span className="block text-xs">{alert.passport_country}</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {alert.expires_on}
                        <span className="block text-xs">{daysUntil(alert.expires_on)} days</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{alert.reminder_days_before} days before</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`sms:${encodeURIComponent(alert.phone)}?&body=${encodeURIComponent(message)}`}
                            className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
                            aria-label="Open SMS"
                            title="Open SMS"
                          >
                            <MessageSquareText className="size-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => sentM.mutate(alert.id)}
                            className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
                            aria-label="Mark SMS sent"
                            title="Mark SMS sent"
                          >
                            <CheckCircle2 className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => edit(alert)}
                            className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
                            aria-label="Edit passport alert"
                            title="Edit"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => delM.mutate(alert.id)}
                            className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
                            aria-label="Delete passport alert"
                            title="Delete"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <form onSubmit={submit} className="h-fit space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <Bell className="size-4" /> {form.id ? "Edit passport alert" : "Add passport alert"}
          </h2>
          <input
            className={input}
            required
            placeholder="Traveler name"
            value={form.traveler_name}
            onChange={(e) => setForm({ ...form, traveler_name: e.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={input}
              required
              placeholder="Phone for SMS"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className={input}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={input}
              placeholder="Passport number"
              value={form.passport_number}
              onChange={(e) => setForm({ ...form, passport_number: e.target.value })}
            />
            <input
              className={input}
              placeholder="Passport country"
              value={form.passport_country}
              onChange={(e) => setForm({ ...form, passport_country: e.target.value })}
            />
          </div>
          <input
            className={input}
            type="url"
            placeholder="Passport image or scan URL"
            value={form.passport_image_url}
            onChange={(e) => setForm({ ...form, passport_image_url: e.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={input}
              type="date"
              required
              value={form.expires_on}
              onChange={(e) => {
                const expires_on = e.target.value;
                setForm((current) => ({
                  ...current,
                  expires_on,
                  sms_message:
                    current.sms_message || current.traveler_name ? defaultMessage(current.traveler_name, expires_on) : "",
                }));
              }}
            />
            <input
              className={input}
              type="number"
              min={0}
              max={730}
              value={form.reminder_days_before}
              onChange={(e) => setForm({ ...form, reminder_days_before: Number(e.target.value) })}
              aria-label="Reminder days before expiry"
            />
          </div>
          <textarea
            className={`${input} min-h-24`}
            placeholder="SMS message"
            value={form.sms_message}
            onChange={(e) => setForm({ ...form, sms_message: e.target.value })}
          />
          <textarea
            className={`${input} min-h-20`}
            placeholder="Internal notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saveM.isPending}
              className="flex-1 rounded-md bg-coral px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-coral-dark"
            >
              {form.id ? "Save changes" : "Save alert"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(emptyForm())}
                className="rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
