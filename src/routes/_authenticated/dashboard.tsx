import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CalendarDays, Users, Plane, Hotel, Map, Trash2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listMyBookings, updateBooking, deleteBooking } from "@/lib/bookings.functions";
import logo from "@/assets/arkan-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My bookings dashboard — Arkan Travel" },
      {
        name: "description",
        content: "View, update and cancel your Arkan Travel flight, hotel and tour reservations in one place.",
      },
      { property: "og:title", content: "My bookings — Arkan Travel" },
      { property: "og:description", content: "Manage every Arkan Travel reservation from one dashboard." },
    ],
  }),
  component: Dashboard,
});

const typeIcon = { flight: Plane, hotel: Hotel, tour: Map } as const;

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchBookings = useServerFn(listMyBookings);
  const patch = useServerFn(updateBooking);
  const remove = useServerFn(deleteBooking);
  const [email, setEmail] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => fetchBookings(),
  });

  const cancelM = useMutation({
    mutationFn: (id: string) => patch({ data: { id, status: "cancelled" as const } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: "/dashboard" }, replace: true });
  }

  const visible = bookings.filter((b) => filter === "all" || b.status === filter);
  const upcoming = bookings.filter((b) => b.status !== "cancelled").length;
  const spend = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + Number(b.total_price), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/">
            <img src={logo.url} alt="Arkan Travel logo" className="h-12 w-auto" width={160} height={160} />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/search" search={{ type: "tours" }} className="font-medium text-ink hover:text-coral">
              Search trips
            </Link>
            <Link to="/amin" className="font-medium text-ink hover:text-coral">
              Admin
            </Link>
            <span className="hidden text-muted-foreground sm:inline">{email}</span>
            <button onClick={signOut} className="rounded-md border border-border px-4 py-2 font-semibold hover:bg-muted">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="eyebrow -rotate-2">Your account</p>
        <h1 className="mt-2 text-4xl font-extrabold text-ink">My bookings</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Active bookings", String(upcoming)],
            ["Total bookings", String(bookings.length)],
            ["Value booked", `$${spend.toLocaleString()}`],
          ].map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-mint p-6">
              <p className="text-3xl font-extrabold text-ink">{v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {(["all", "pending", "confirmed", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition-colors ${
                filter === f ? "bg-coral text-primary-foreground" : "bg-muted text-ink hover:bg-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading your bookings…</p>}
          {!isLoading && visible.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">No bookings here yet.</p>
              <Link
                to="/search"
                search={{ type: "tours" }}
                className="mt-4 inline-flex rounded-md bg-coral px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-coral-dark"
              >
                Find a trip
              </Link>
            </div>
          )}
          {visible.map((b) => {
            const Icon = typeIcon[b.item_type];
            return (
              <article
                key={b.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-48 flex-1">
                  <h2 className="text-base font-bold text-ink">{b.title}</h2>
                  <p className="text-xs text-muted-foreground">{b.subtitle}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" /> {b.travel_date ?? "Dates flexible"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" /> {b.guests} guest{b.guests > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-ink">${Number(b.total_price).toLocaleString()}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-[0.7rem] font-semibold capitalize ${
                      b.status === "cancelled"
                        ? "bg-muted text-muted-foreground"
                        : b.status === "confirmed"
                          ? "bg-accent text-accent-foreground"
                          : "bg-sun/30 text-ink"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {b.status !== "cancelled" && (
                    <button
                      onClick={() => cancelM.mutate(b.id)}
                      className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                    >
                      <XCircle className="size-3.5" /> Cancel
                    </button>
                  )}
                  <button
                    onClick={() => deleteM.mutate(b.id)}
                    aria-label="Delete booking"
                    className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
