import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getHomeContent } from "@/lib/catalog.functions";
import { imageFor } from "@/lib/images";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin,
  Flag,
  CalendarDays,
  User,
  Search,
  Star,
  ShieldCheck,
  Headphones,
  Wallet,
  Clock,
  Quote,
  Phone,
  Mail,
  Menu,
  X,
  Facebook,
  Instagram,
  Send,
  ArrowRight,
} from "lucide-react";

import logo from "@/assets/arkan-logo.png.asset.json";
import hero from "@/assets/hero.jpg";
import dest1 from "@/assets/dest-1.jpg";
import dest2 from "@/assets/dest-2.jpg";
import dest3 from "@/assets/dest-3.jpg";
import dest4 from "@/assets/dest-4.jpg";
import about from "@/assets/about.jpg";

const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => getHomeContent(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(homeQuery);
  },
  errorComponent: () => (
    <div className="p-16 text-center text-sm text-muted-foreground">
      Could not load content right now. Please refresh.
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Arkan Travel — Discover the Most Engaging Places" },
      {
        name: "description",
        content:
          "Arkan Travel and Tourism Agency: flights, hotels and curated tour packages worldwide, arranged end to end with comfort and safety.",
      },
      { property: "og:title", content: "Arkan Travel — Discover the Most Engaging Places" },
      {
        property: "og:description",
        content:
          "Flights, hotels and curated tour packages worldwide with Arkan Travel. Comfort and safety, every trip.",
      },
    ],
  }),
  component: Index,
});

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Tours", href: "#packages" },
  { label: "Destinations", href: "#destinations" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const features = [
  { icon: Wallet, title: "Best Price Guarantee", text: "Transparent fares with no hidden fees on any booking." },
  { icon: ShieldCheck, title: "Safe & Trusted", text: "Licensed agency with fully insured trips and partners." },
  { icon: Headphones, title: "24/7 Support", text: "Our travel experts stay with you before and during travel." },
  { icon: Clock, title: "Fast Booking", text: "Confirm flights, hotels and visas in a single conversation." },
];

const testimonials = [
  {
    name: "Layla H.",
    role: "Family trip to Istanbul",
    text: "Everything from the visa to the hotel transfers was handled. We only had to enjoy the trip.",
  },
  {
    name: "Omar K.",
    role: "Honeymoon in Maldives",
    text: "They found a resort far better than what we expected for our budget. Flawless organisation.",
  },
  {
    name: "Sara M.",
    role: "Business travel",
    text: "Flights rescheduled twice at the last minute and Arkan handled it within the hour.",
  },
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(homeQuery);
  const destinations = data.destinations;
  const packages = data.tours;

  const [dest, setDest] = useState("");
  const [activity, setActivity] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: u }) => setSignedIn(Boolean(u.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(Boolean(session)));
    return () => sub.subscription.unsubscribe();
  }, []);

  function submitSearch() {
    navigate({
      to: "/search",
      search: {
        type: "tours" as const,
        sort: "price_asc" as const,
        ...(dest.trim() ? { q: dest.trim() } : {}),
        ...(activity.trim() ? { category: activity.trim() } : {}),
        ...(date ? { date } : {}),
        ...(Number(guests) > 0 ? { guests: Number(guests) } : {}),
      },
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground" id="home">
      {/* Top bar */}
      <div className="hidden bg-ink text-background/85 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 text-xs">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Phone className="size-3.5 text-brand" /> +90 000 000 00 00
            </span>
            <span className="flex items-center gap-2">
              <Mail className="size-3.5 text-brand" /> info@arkantravel.com
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="opacity-80">راحة وأمان</span>
            <Facebook className="size-3.5" />
            <Instagram className="size-3.5" />
            <Send className="size-3.5" />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <a href="#home" className="flex items-center">
            <img src={logo.url} alt="Arkan Travel logo" className="h-14 w-auto" width={160} height={160} />
          </a>
          <nav className="hidden items-center gap-10 lg:flex">
            {navLinks.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className={`text-[0.95rem] font-medium transition-colors hover:text-coral ${
                  i === 0 ? "text-coral" : "text-ink"
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            {signedIn ? (
              <Link
                to="/dashboard"
                className="hidden rounded-md bg-coral px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-coral-dark sm:inline-flex"
              >
                My bookings
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  search={{ redirect: "/dashboard" }}
                  className="hidden text-[0.95rem] font-medium text-ink hover:text-coral md:inline"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  search={{ redirect: "/dashboard" }}
                  className="hidden rounded-md bg-coral px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-coral-dark sm:inline-flex"
                >
                  Sign Up
                </Link>
              </>
            )}
            <button
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-md border border-border p-2 lg:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-border bg-background px-6 py-4 lg:hidden">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-sm font-semibold text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="topo relative overflow-hidden">
        {/* decorative shapes */}
        <div className="pointer-events-none absolute -left-16 -top-16 size-40 rounded-full bg-coral" />
        <div className="pointer-events-none absolute right-24 top-24 size-36 rounded-full bg-sun" />
        <div className="pointer-events-none absolute -bottom-24 left-1/2 size-56 -translate-x-1/2 rounded-full bg-brand" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-28 pt-16 lg:grid-cols-2 lg:pb-36">
          <div>
            <p className="eyebrow -rotate-3">Natural beauty</p>
            <h1 className="mt-4 max-w-xl text-5xl font-extrabold leading-[1.05] text-ink md:text-6xl lg:text-[4.25rem]">
              Discover the most engaging places
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground">
              Less planning, more travelling — flights, hotels, visas and tours arranged by Arkan Travel.
            </p>
          </div>

          <div className="relative">
            <div className="blob relative mx-auto aspect-square w-full max-w-xl">
              <img
                src={hero}
                alt="Turquoise coastline at golden hour"
                width={1920}
                height={1088}
                className="size-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Search card */}
        <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-6 pb-24">
          <div className="rounded-xl bg-card p-6 shadow-[0_30px_70px_-45px_var(--ink)] md:p-7">
            <div className="grid gap-6 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <Field icon={MapPin} label="Destination" placeholder="Where are you going?" value={dest} onChange={setDest} />
              <Field icon={Flag} label="Activity" placeholder="City, Beach, Culture…" value={activity} onChange={setActivity} />
              <Field icon={CalendarDays} label="Dates" placeholder="" type="date" value={date} onChange={setDate} />
              <Field icon={User} label="Guest" placeholder="2" type="number" value={guests} onChange={setGuests} />
              <button
                aria-label="Search"
                onClick={submitSearch}
                className="mt-auto flex h-14 items-center justify-center rounded-md bg-coral px-7 text-primary-foreground transition-colors hover:bg-coral-dark"
              >
                <Search className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section id="destinations" className="section-pad mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow -rotate-2">Top destinations</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">Places travellers love most</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Curated cities and islands with vetted hotels, local guides and flexible itineraries.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((d) => (
            <Link
              to="/search"
              search={{ type: "tours" as const, sort: "price_asc" as const, q: d.name }}
              key={d.id}
              className="card-lift group relative block overflow-hidden rounded-2xl"
            >
              <img
                src={imageFor(d.image_key)}
                alt={`${d.name}, ${d.country}`}
                loading="lazy"
                width={800}
                height={1000}
                className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-sun">{d.country}</p>
                <h3 className="mt-1 text-xl font-bold text-background">{d.name}</h3>
                <p className="text-xs text-background/75">{d.tour_count} tours available</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="topo">
        <div className="section-pad mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="eyebrow -rotate-2">Tour packages</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">Trips ready when you are</h2>
          </div>

          <div className="mt-12 grid gap-7 md:grid-cols-3">
            {packages.map((p) => (
              <article key={p.id} className="card-lift overflow-hidden rounded-2xl bg-card">
                <div className="relative">
                  <img
                    src={imageFor(p.image_key)}
                    alt={p.title}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="h-56 w-full object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-md bg-coral px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {p.days} days / {p.nights} nights
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-coral" /> {p.place}
                  </div>
                  <h3 className="mt-2 text-lg font-bold leading-snug">{p.title}</h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="size-3.5" /> {p.min_people}-{p.max_people} people
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="size-3.5 fill-sun text-sun" /> {p.rating}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                    <p className="text-sm text-muted-foreground">
                      from <span className="text-xl font-extrabold text-ink">${Number(p.price).toLocaleString()}</span>
                    </p>
                    <Link
                      to="/search"
                      search={{ type: "tours" as const, sort: "price_asc" as const, q: p.place }}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-coral transition-all hover:gap-2.5"
                    >
                      Book now <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About / why */}
      <section id="about" className="section-pad mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative">
            <div className="pointer-events-none absolute -left-6 -top-6 size-24 rounded-full bg-sun" />
            <div className="blob relative aspect-[4/3] w-full">
              <img
                src={about}
                alt="Travellers at the airport gate"
                loading="lazy"
                width={1200}
                height={900}
                className="size-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 right-2 rounded-xl bg-coral px-7 py-5 text-primary-foreground shadow-lg">
              <p className="text-3xl font-extrabold">12+</p>
              <p className="text-xs font-medium opacity-90">years of guiding travellers</p>
            </div>
          </div>
          <div>
            <p className="eyebrow -rotate-2">Why Arkan Travel</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">Comfort and safety on every journey</h2>
            <p className="mt-5 text-muted-foreground">
              From the first enquiry to the flight home, one team handles your tickets, hotels, transfers and paperwork
              — so nothing is left to chance.
            </p>
            <div className="mt-9 grid gap-6 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <f.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ink">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:grid-cols-4">
          {[
            ["18k+", "Happy travellers"],
            ["140+", "Destinations"],
            ["320+", "Tour packages"],
            ["4.9", "Average rating"],
          ].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-4xl font-extrabold text-sun">{v}</p>
              <p className="mt-1 text-sm text-background/70">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-pad mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="eyebrow -rotate-2">Testimonials</p>
          <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">What our travellers say</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl bg-mint p-8">
              <Quote className="size-7 text-coral" />
              <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">"{t.text}"</blockquote>
              <figcaption className="mt-6">
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA / contact */}
      <section id="contact" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand px-8 py-16 text-center text-primary-foreground md:px-16">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-sun/40" />
          <div className="pointer-events-none absolute -bottom-14 -left-8 size-40 rounded-full bg-coral/40" />
          <div className="relative">
            <p className="script text-primary-foreground">Let's go</p>
            <h2 className="mt-2 text-4xl font-extrabold md:text-5xl">Ready to plan your next trip?</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm opacity-90">
              Tell us where you want to go and we'll come back with a full itinerary and price within 24 hours.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                className="flex-1 rounded-md bg-background px-6 py-4 text-sm text-foreground outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-coral px-8 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-coral-dark"
              >
                Request a quote
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="topo">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
          <div>
            <img src={logo.url} alt="Arkan Travel logo" loading="lazy" width={160} height={160} className="h-16 w-auto" />
            <p className="mt-4 text-sm text-muted-foreground">
              Arkan Travel and Tourism Agency — flights, hotels, visas and tours. راحة وأمان.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-coral">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold">Services</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Flight tickets</li>
              <li>Hotel reservations</li>
              <li>Visa assistance</li>
              <li>Group tours</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-coral" /> +90 000 000 00 00
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-coral" /> info@arkantravel.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-coral" /> Istanbul, Türkiye
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Arkan Travel. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-bold text-ink">
        <Icon className="size-4 text-coral" />
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-3 h-8 w-full border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}
