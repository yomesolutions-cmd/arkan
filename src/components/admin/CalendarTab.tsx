import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import {
  listAppointments,
  saveAppointment,
  deleteAppointment,
  type Appointment,
} from "@/lib/appointments.functions";

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const emptyForm = (date: string) => ({
  id: undefined as string | undefined,
  title: "",
  customer_name: "",
  phone: "",
  email: "",
  notes: "",
  date,
  time: "10:00",
  duration_min: 60,
  kind: "consultation",
  status: "scheduled" as Appointment["status"],
});

export function CalendarTab() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listAppointments);
  const save = useServerFn(saveAppointment);
  const remove = useServerFn(deleteAppointment);

  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => ymd(new Date()));
  const [form, setForm] = useState(() => emptyForm(ymd(new Date())));

  const { data: appointments = [] } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: () => fetchAll(),
  });

  const saveM = useMutation({
    mutationFn: (payload: Parameters<typeof save>[0]["data"]) => save({ data: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-appointments"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setForm(emptyForm(selected));
    },
  });
  const delM = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-appointments"] }),
  });

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const key = ymd(new Date(a.starts_at));
      map.set(key, [...(map.get(key) ?? []), a]);
    }
    return map;
  }, [appointments]);

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startOffset = monthStart.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)),
  ];

  const dayList = byDay.get(selected) ?? [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveM.mutate({
      id: form.id,
      title: form.title,
      customer_name: form.customer_name,
      phone: form.phone || null,
      email: form.email || null,
      notes: form.notes || null,
      starts_at: `${form.date}T${form.time}:00`,
      duration_min: Number(form.duration_min),
      kind: form.kind,
      status: form.status,
    });
  }

  const input = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="rounded-md border border-border p-2 hover:bg-muted"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <h2 className="text-lg font-extrabold text-ink">
            {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </h2>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="rounded-md border border-border p-2 hover:bg-muted"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.65rem] font-semibold uppercase text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} />;
            const key = ymd(d);
            const items = byDay.get(key) ?? [];
            const isSel = key === selected;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelected(key);
                  setForm((f) => ({ ...f, date: key }));
                }}
                className={`min-h-20 rounded-lg border p-1.5 text-start transition-colors ${
                  isSel ? "border-coral bg-coral/10" : "border-border hover:bg-muted"
                }`}
              >
                <span className="text-xs font-bold text-ink">{d.getDate()}</span>
                <span className="mt-1 block space-y-0.5">
                  {items.slice(0, 2).map((a) => (
                    <span
                      key={a.id}
                      className="block truncate rounded bg-coral px-1 py-0.5 text-[0.6rem] text-primary-foreground"
                    >
                      {new Date(a.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {a.title}
                    </span>
                  ))}
                  {items.length > 2 && (
                    <span className="block text-[0.6rem] text-muted-foreground">+{items.length - 2} more</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold text-ink">Appointments on {selected}</h3>
          {dayList.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Nothing booked this day.</p>}
          <ul className="mt-2 space-y-2">
            {dayList.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">
                    {new Date(a.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {a.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.customer_name || "—"} · {a.kind} · {a.duration_min} min · {a.status}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setForm({
                      id: a.id,
                      title: a.title,
                      customer_name: a.customer_name,
                      phone: a.phone ?? "",
                      email: a.email ?? "",
                      notes: a.notes ?? "",
                      date: ymd(new Date(a.starts_at)),
                      time: new Date(a.starts_at).toTimeString().slice(0, 5),
                      duration_min: a.duration_min,
                      kind: a.kind,
                      status: a.status,
                    })
                  }
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  Edit
                </button>
                <button
                  onClick={() => delM.mutate(a.id)}
                  aria-label="Delete appointment"
                  className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <form onSubmit={submit} className="h-fit space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          <Plus className="size-4" /> {form.id ? "Edit appointment" : "Register appointment"}
        </h2>
        <input
          className={input}
          placeholder="Title (e.g. Istanbul trip consultation)"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className={input}
          placeholder="Customer name"
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className={input}
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className={input}
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            className={input}
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            type="time"
            className={input}
            required
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min={15}
            step={15}
            className={input}
            value={form.duration_min}
            onChange={(e) => setForm({ ...form, duration_min: Number(e.target.value) })}
          />
          <select className={input} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
            <option value="consultation">Consultation</option>
            <option value="visit">Office visit</option>
            <option value="call">Phone call</option>
            <option value="departure">Departure</option>
          </select>
        </div>
        <select
          className={input}
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as Appointment["status"] })}
        >
          <option value="scheduled">Scheduled</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <textarea
          className={`${input} min-h-24`}
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saveM.isPending}
            className="flex-1 rounded-md bg-coral px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-coral-dark"
          >
            {form.id ? "Save changes" : "Add to calendar"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyForm(selected))}
              className="rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
