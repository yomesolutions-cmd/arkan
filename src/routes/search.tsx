import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Plane, Hotel, Map, Star, Clock, MapPin, Users } from "lucide-react";
import { searchCatalog } from "@/lib/catalog.functions";
import { createBooking } from "@/lib/bookings.functions";
import { supabase } from "@/integrations/supabase/client";
import { imageFor } from "@/lib/images";
import logo from "@/assets/arkan-logo.png.asset.json";

type SearchType = "tours" | "flights" | "hotels";
type Sort = "price_asc" | "price_desc" | "rating";

interface SearchParams {
  type: SearchType;
  q?: string;
  from?: string;
  to?: string;
  date?: string;
  guests?: number;
  maxPrice?: number;
  category?: string;
  stars?: number;
  stops?: number;
  cabin?: string;
  sort?: Sort;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): SearchParams => {
    const type = (["tours", "flights", "hotels"] as const).includes(s["type"] as SearchType)
      ? (s["type"] as SearchType)
      : "tours";
    const sort = (["price_asc", "price_desc", "rating"] as const).includes(s["sort"] as Sort)
      ? (s["sort"] as Sort)
      : "price_asc";
    return {
      type,
      sort,
      ...(str(s["q"]) ? { q: str(s["q"])! } : {}),
      ...(str(s["from"]) ? { from: str(s["from"])! } : {}),
      ...(str(s["to"]) ? { to: str(s["to"])! } : {}),
      ...(str(s["date"]) ? { date: str(s["date"])! } : {}),
      ...(num(s["guests"]) ? { guests: num(s["guests"])! } : {}),
      ...(num(s["maxPrice"]) ? { maxPrice: num(s["maxPrice"])! } : {}),
      ...(str(s["category"]) ? { category: str(s["category"])! } : {}),
      ...(num(s["stars"]) ? { stars: num(s["stars"])! } : {}),
      ...(s["stops"] !== undefined && Number.isFinite(Number(s["stops"]))
        ? { stops: Number(s["stops"]) }
        : {}),
      ...(str(s["cabin"]) ? { cabin: str(s["cabin"])! } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Search flights, hotels and tours — Arkan Travel" },
      {
        name: "description",
        content:
          "Search Arkan Travel for flights, hotels and tour packages, filter by price, rating and stops, and book in one click.",
      },
      { property: "og:title", content: "Search trips — Arkan Travel" },
      {
        property: "og:description",
        content: "Filter flights, hotels and tour packages and book instantly with Arkan Travel.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const params = Route.useSearch();
  const navigate = useNavigate();
  const runSearch = useServerFn(searchCatalog);
  const book = useServerFn(createBooking);
  const [signedIn, setSignedIn] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["search", params],
    queryFn: () =>
      runSearch({
        data: {
          type: params.type,
          sort: params.sort ?? "price_asc",
          ...(params.q ? { q: params.q } : {}),
          ...(params.from ? { from: params.from } : {}),
          ...(params.to ? { to: params.to } : {}),
          ...(params.maxPrice ? { maxPrice: params.maxPrice } : {}),
          ...(params.category ? { category: params.category } : {}),
          ...(params.stars ? { stars: params.stars } : {}),
          ...(params.stops !== undefined ? { stops: params.stops } : {}),
          ...(params.cabin ? { cabin: params.cabin } : {}),
        },
      }),
  });

  const bookM = useMutation({
    mutationFn: (input: {
      item_type: "flight" | "hotel" | "tour";
      item_id: string;
      title: string;
      subtitle: string;
      total_price: number;
    }) =>
      book({
        data: {
          ...input,
          guests: params.guests ?? 2,
          ...(params.date ? { travel_date: params.date } : {}),
        },
      }),
    onSuccess: (row) => setBooked(row.id),
  });

  function setParam(patch: Partial<Record<keyof SearchParams, string | number | undefined>>) {
    navigate({
      to: "/search",
      search: (prev: Record<string, unknown>) => {
        const next: Record<string, unknown> = { ...prev, ...patch };
        for (const k of Object.keys(next)) if (next[k] === undefined || next[k] === "") delete next[k];
        return next as unknown as SearchParams;
      },
    });
  }

  const tabs: { key: SearchType; label: string; icon: typeof Plane }[] = [
    { key: "tours", label: "Tours", icon: Map },
    { key: "flights", label: "Flights", icon: Plane },
    { key: "hotels", label: "Hotels", icon: Hotel },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/">
            <img src={logo.url} alt="Arkan Travel logo" className="h-12 w-auto" width={160} height={160} />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {signedIn ? (
              <Link to="/dashboard" className="font-semibold text-coral">
                My bookings
              </Link>
            ) : (
              <Link to="/auth" search={{ redirect: "/dashboard" }} className="font-semibold text-coral">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Search bar */}
      <section className="topo border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setParam({ type: t.key })}
                className={`flex items-center gap-2 rounded-t-lg px-5 py-3 text-sm font-semibold ${
                  params.type === t.key ? "bg-card text-coral" : "bg-card/50 text-ink hover:bg-card"
                }`}
              >
                <t.icon className="size-4" /> {t.label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 rounded-b-xl rounded-tr-xl bg-card p-6 md:grid-cols-4">
            {params.type === "flights" ? (
              <>
                <Input label="From" value={params.from ?? ""} onChange={(v) => setParam({ from: v })} placeholder="Istanbul" />
                <Input label="To" value={params.to ?? ""} onChange={(v) => setParam({ to: v })} placeholder="Dubai" />
              </>
            ) : (
              <Input
                label={params.type === "hotels" ? "City" : "Destination"}
                value={params.q ?? ""}
                onChange={(v) => setParam({ q: v })}
                placeholder="Where are you going?"
              />
            )}
            <Input
              label="Travel date"
              type="date"
              value={params.date ?? ""}
              onChange={(v) => setParam({ date: v })}
              placeholder=""
            />
            <Input
              label="Guests"
              type="number"
              value={String(params.guests ?? 2)}
              onChange={(v) => setParam({ guests: Number(v) || 1 })}
              placeholder="2"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className="space-y-6 rounded-2xl bg-mint p-6">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-ink">Filters</h2>

          <div>
            <label className="text-xs font-bold text-ink">Max price (${params.maxPrice ?? 2000})</label>
            <input
              type="range"
              min={50}
              max={2000}
              step={50}
              value={params.maxPrice ?? 2000}
              onChange={(e) => setParam({ maxPrice: Number(e.target.value) })}
              className="mt-2 w-full accent-coral"
            />
          </div>

          {params.type === "tours" && (
            <Select
              label="Category"
              value={params.category ?? ""}
              onChange={(v) => setParam({ category: v || undefined })}
              options={["", "City", "Beach", "Culture", "Adventure"]}
            />
          )}
          {params.type === "hotels" && (
            <Select
              label="Minimum stars"
              value={String(params.stars ?? "")}
              onChange={(v) => setParam({ stars: v ? Number(v) : undefined })}
              options={["", "3", "4", "5"]}
            />
          )}
          {params.type === "flights" && (
            <>
              <Select
                label="Max stops"
                value={params.stops !== undefined ? String(params.stops) : ""}
                onChange={(v) => setParam({ stops: v === "" ? undefined : Number(v) })}
                options={["", "0", "1", "2"]}
              />
              <Select
                label="Cabin"
                value={params.cabin ?? ""}
                onChange={(v) => setParam({ cabin: v || undefined })}
                options={["", "Economy", "Business"]}
              />
            </>
          )}

          <Select
            label="Sort by"
            value={params.sort ?? "price_asc"}
            onChange={(v) => setParam({ sort: v as Sort })}
            options={["price_asc", "price_desc", "rating"]}
            labels={{ price_asc: "Price: low to high", price_desc: "Price: high to low", rating: "Top rated" }}
          />

          <button
            onClick={() => navigate({ to: "/search", search: { type: params.type, sort: "price_asc" } })}
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-xs font-semibold hover:bg-muted"
          >
            Reset filters
          </button>
        </aside>

        {/* Results */}
        <section>
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-extrabold text-ink">
              {isLoading
                ? "Searching…"
                : `${(data?.tours.length ?? 0) + (data?.hotels.length ?? 0) + (data?.flights.length ?? 0)} ${params.type} found`}
            </h1>
          </div>

          {booked && (
            <div className="mt-4 rounded-xl bg-accent p-4 text-sm text-accent-foreground">
              Booking request created.{" "}
              <Link to="/dashboard" className="font-bold underline">
                View it in your dashboard
              </Link>
              .
            </div>
          )}
          {bookM.isError && (
            <p className="mt-4 text-sm text-destructive">Could not create the booking. Please try again.</p>
          )}

          <div className="mt-6 space-y-4">
            {data?.tours.map((t) => (
              <article key={t.id} className="card-lift flex flex-col gap-5 rounded-2xl bg-card p-5 sm:flex-row">
                <img
                  src={imageFor(t.image_key)}
                  alt={t.title}
                  loading="lazy"
                  width={400}
                  height={300}
                  className="h-40 w-full rounded-xl object-cover sm:w-56"
                />
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-coral" /> {t.place} · {t.category}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-ink">{t.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" /> {t.days} days / {t.nights} nights
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" /> {t.min_people}-{t.max_people} people
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="size-3.5 fill-sun text-sun" /> {t.rating}
                    </span>
                  </div>
                </div>
                <BookBox
                  price={Number(t.price)}
                  unit="per person"
                  signedIn={signedIn}
                  pending={bookM.isPending}
                  onBook={() =>
                    bookM.mutate({
                      item_type: "tour",
                      item_id: t.id,
                      title: t.title,
                      subtitle: `${t.place} · ${t.days} days`,
                      total_price: Number(t.price) * (params.guests ?? 2),
                    })
                  }
                />
              </article>
            ))}

            {data?.hotels.map((h) => (
              <article key={h.id} className="card-lift flex flex-col gap-5 rounded-2xl bg-card p-5 sm:flex-row">
                <img
                  src={imageFor(h.image_key)}
                  alt={h.name}
                  loading="lazy"
                  width={400}
                  height={300}
                  className="h-40 w-full rounded-xl object-cover sm:w-56"
                />
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-coral" /> {h.city}, {h.country}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-ink">{h.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{"★".repeat(h.stars)} · {h.amenities.join(" · ")}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Star className="size-3.5 fill-sun text-sun" /> {h.rating} guest rating
                  </p>
                </div>
                <BookBox
                  price={Number(h.price_per_night)}
                  unit="per night"
                  signedIn={signedIn}
                  pending={bookM.isPending}
                  onBook={() =>
                    bookM.mutate({
                      item_type: "hotel",
                      item_id: h.id,
                      title: h.name,
                      subtitle: `${h.city}, ${h.country}`,
                      total_price: Number(h.price_per_night),
                    })
                  }
                />
              </article>
            ))}

            {data?.flights.map((f) => (
              <article key={f.id} className="card-lift flex flex-col gap-5 rounded-2xl bg-card p-5 sm:flex-row sm:items-center">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Plane className="size-5" />
                </span>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-ink">
                    {f.from_city} → {f.to_city}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {f.airline} {f.flight_no} · {f.cabin} · {f.stops === 0 ? "Direct" : `${f.stops} stop`}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    {new Date(f.depart_at).toLocaleString()} — {new Date(f.arrive_at).toLocaleTimeString()}
                  </p>
                </div>
                <BookBox
                  price={Number(f.price)}
                  unit="per seat"
                  signedIn={signedIn}
                  pending={bookM.isPending}
                  onBook={() =>
                    bookM.mutate({
                      item_type: "flight",
                      item_id: f.id,
                      title: `${f.from_city} → ${f.to_city}`,
                      subtitle: `${f.airline} ${f.flight_no} · ${f.cabin}`,
                      total_price: Number(f.price) * (params.guests ?? 2),
                    })
                  }
                />
              </article>
            ))}

            {!isLoading &&
              (data?.tours.length ?? 0) + (data?.hotels.length ?? 0) + (data?.flights.length ?? 0) === 0 && (
                <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  Nothing matches these filters yet — try widening your price range or clearing the destination.
                </p>
              )}
          </div>
        </section>
      </div>
    </div>
  );
}

function BookBox({
  price,
  unit,
  signedIn,
  pending,
  onBook,
}: {
  price: number;
  unit: string;
  signedIn: boolean;
  pending: boolean;
  onBook: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-col items-end justify-center gap-2 border-border sm:border-l sm:pl-5">
      <p className="text-xl font-extrabold text-ink">${price.toLocaleString()}</p>
      <p className="text-[0.7rem] text-muted-foreground">{unit}</p>
      {signedIn ? (
        <button
          onClick={onBook}
          disabled={pending}
          className="rounded-md bg-coral px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-coral-dark disabled:opacity-60"
        >
          Book now
        </button>
      ) : (
        <Link
          to="/auth"
          search={{ redirect: "/dashboard" }}
          className="rounded-md border border-coral px-5 py-2.5 text-xs font-semibold text-coral hover:bg-coral hover:text-primary-foreground"
        >
          Sign in to book
        </Link>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-ink">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-coral"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-ink">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-coral"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? (o === "" ? "Any" : o)}
          </option>
        ))}
      </select>
    </label>
  );
}
