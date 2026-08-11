import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Users, CalendarCheck, DollarSign, MessageSquare } from "lucide-react";
import { getAdminStats } from "@/lib/appointments.functions";

const PIE_COLORS = ["var(--color-coral)", "var(--color-sun)", "var(--color-ink)"];

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  tone: string;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl p-5 ${tone}`}>
      <span className="flex size-12 items-center justify-center rounded-xl bg-background/25">
        <Icon className="size-6" />
      </span>
      <div>
        <p className="text-2xl font-extrabold leading-none">{value}</p>
        <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wide opacity-80">{label}</p>
      </div>
    </div>
  );
}

export function OverviewTab() {
  const fetchStats = useServerFn(getAdminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchStats() });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading analytics…</p>;
  const t = data.totals;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={String(t.users)} icon={Users} tone="bg-ink text-background" />
        <StatCard
          label="Total bookings"
          value={String(t.bookings)}
          icon={CalendarCheck}
          tone="bg-coral text-primary-foreground"
        />
        <StatCard label="Value booked" value={`$${t.revenue.toLocaleString()}`} icon={DollarSign} tone="bg-mint text-ink" />
        <StatCard label="Chat interactions" value={String(t.chats)} icon={MessageSquare} tone="bg-sun/60 text-ink" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Pending bookings", t.pending],
          ["Confirmed bookings", t.confirmed],
          ["Newsletter subscribers", t.subscribers],
          ["Upcoming appointments", t.appointments],
        ].map(([l, v]) => (
          <div key={String(l)} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-2xl font-extrabold text-ink">{String(v)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{String(l)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-sm font-bold text-ink">New users & bookings (6 months)</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis allowDecimals={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="var(--color-ink)" strokeWidth={2} />
                <Line type="monotone" dataKey="bookings" stroke="var(--color-coral)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold text-ink">Bookings by type</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.byType} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>
                  {data.byType.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-bold text-ink">Top chat topics</h2>
        {data.topTopics.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No chat activity yet.</p>
        ) : (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topTopics}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis allowDecimals={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-coral)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
