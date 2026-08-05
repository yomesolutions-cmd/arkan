import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plane,
  Hotel,
  Compass,
  MapPin,
  CalendarDays,
  Users,
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
} from "lucide-react";

import logo from "@/assets/arkan-logo.png.asset.json";
import hero from "@/assets/hero.jpg";
import dest1 from "@/assets/dest-1.jpg";
import dest2 from "@/assets/dest-2.jpg";
import dest3 from "@/assets/dest-3.jpg";
import dest4 from "@/assets/dest-4.jpg";
import about from "@/assets/about.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arkan Travel — Flights, Hotels & Tour Packages" },
      {
        name: "description",
        content:
          "Arkan Travel and Tourism Agency: book flights, hotels and curated tour packages worldwide with comfort and safety.",
      },
      { property: "og:title", content: "Arkan Travel — Flights, Hotels & Tour Packages" },
      {
        property: "og:description",
        content:
          "Book flights, hotels and curated tour packages worldwide with Arkan Travel. Comfort and safety, every trip.",
      },
    ],
  }),
  component: Index,
});

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Destinations", href: "#destinations" },
  { label: "Packages", href: "#packages" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const destinations = [
  { name: "Istanbul", country: "Türkiye", tours: 24, img: dest1 },
  { name: "Dubai", country: "UAE", tours: 18, img: dest2 },
  { name: "Maldives", country: "Indian Ocean", tours: 12, img: dest3 },
  { name: "Paris", country: "France", tours: 16, img: dest4 },
];

const packages = [
  {
    title: "Bosphorus & Cappadocia Escape",
    place: "Türkiye",
    days: "6 days / 5 nights",
    people: "2-12 people",
    price: "$740",
    rating: "4.9",
    img: dest1,
  },
  {
    title: "Dubai City Lights & Desert",
    place: "United Arab Emirates",
    days: "5 days / 4 nights",
    people: "2-10 people",
    price: "$890",
    rating: "4.8",
    img: dest2,
  },
  {
    title: "Maldives Overwater Retreat",
    place: "Maldives",
    days: "7 days / 6 nights",
    people: "2 people",
    price: "$1,650",
    rating: "5.0",
    img: dest3,
  },
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

const searchTabs = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "tours", label: "Tours", icon: Compass },
];

function Index() {
  const [tab, setTab] = useState("flights");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground" id="home">
      {/* Top bar */}
      <div className="hidden bg-ink text-background/90 lg:block">
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
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <a href="#home" className="flex items-center">
            <img src={logo.url} alt="Arkan Travel logo" className="h-14 w-auto" width={160} height={160} />
          </a>
          <nav className="hidden items-center gap-9 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-semibold text-ink transition-colors hover:text-brand-dark"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark sm:inline-flex"
            >
              Book Now
            </a>
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
      <section className="relative">
        <img
          src={hero}
          alt="Turquoise coastline at golden hour"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/25" />
        <div className="relative mx-auto max-w-7xl px-6 pb-40 pt-24 md:pt-32">
          <p className="eyebrow text-brand">Travel and Tourism Agency</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] text-background md:text-6xl">
            Explore the world with comfort and safety
          </h1>
          <p className="mt-5 max-w-xl text-base text-background/80 md:text-lg">
            Flights, hotels, visas and handcrafted tour packages — arranged end to end by the Arkan Travel team.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#packages"
              className="rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
            >
              Discover Packages
            </a>
            <a
              href="#about"
              className="rounded-full border border-background/40 px-7 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-background/10"
            >
              Why Arkan
            </a>
          </div>
        </div>
      </section>

      {/* Search widget */}
      <div className="relative z-10 mx-auto -mt-28 max-w-6xl px-6">
        <div className="rounded-2xl bg-card p-5 shadow-[0_30px_70px_-40px_var(--ink)] md:p-7">
          <div className="flex flex-wrap gap-2">
            {searchTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                  tab === t.id
                    ? "bg-brand text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-ink"
                }`}
              >
                <t.icon className="size-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Field icon={MapPin} label={tab === "flights" ? "From" : "Destination"} placeholder="Istanbul, TR" />
            <Field
              icon={tab === "flights" ? MapPin : CalendarDays}
              label={tab === "flights" ? "To" : "Check in"}
              placeholder={tab === "flights" ? "Dubai, AE" : "12 Aug 2026"}
            />
            <Field icon={CalendarDays} label="Departure" placeholder="12 Aug 2026" />
            <div className="flex items-end gap-3">
              <Field icon={Users} label="Guests" placeholder="2 adults" className="flex-1" />
              <button
                aria-label="Search"
                className="mb-0.5 rounded-xl bg-brand p-4 text-primary-foreground transition-colors hover:bg-brand-dark"
              >
                <Search className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Destinations */}
      <section id="destinations" className="section-pad mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Top destinations</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Places travellers love most</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Curated cities and islands with vetted hotels, local guides and flexible itineraries.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((d) => (
            <article key={d.name} className="card-lift group relative overflow-hidden rounded-2xl">
              <img
                src={d.img}
                alt={`${d.name}, ${d.country}`}
                loading="lazy"
                width={800}
                height={1000}
                className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand">{d.country}</p>
                <h3 className="mt-1 text-xl font-bold text-background">{d.name}</h3>
                <p className="text-xs text-background/75">{d.tours} tours available</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="bg-secondary">
        <div className="section-pad mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="eyebrow">Tour packages</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Trips ready when you are</h2>
          </div>

          <div className="mt-10 grid gap-7 md:grid-cols-3">
            {packages.map((p) => (
              <article key={p.title} className="card-lift overflow-hidden rounded-2xl bg-card">
                <div className="relative">
                  <img
                    src={p.img}
                    alt={p.title}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="h-56 w-full object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {p.days}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-brand" /> {p.place}
                  </div>
                  <h3 className="mt-2 text-lg font-bold leading-snug">{p.title}</h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" /> {p.people}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="size-3.5 fill-brand text-brand" /> {p.rating}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                    <p className="text-sm text-muted-foreground">
                      from <span className="text-xl font-bold text-ink">{p.price}</span>
                    </p>
                    <a
                      href="#contact"
                      className="rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-brand hover:text-primary-foreground"
                    >
                      Book Now
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About / why */}
      <section id="about" className="section-pad mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <img
              src={about}
              alt="Travellers at the airport gate"
              loading="lazy"
              width={1200}
              height={900}
              className="rounded-3xl object-cover"
            />
            <div className="absolute -bottom-6 -right-2 rounded-2xl bg-brand px-7 py-5 text-primary-foreground shadow-lg md:right-6">
              <p className="text-3xl font-extrabold">12+</p>
              <p className="text-xs font-medium opacity-90">years of guiding travellers</p>
            </div>
          </div>
          <div>
            <p className="eyebrow">Why Arkan Travel</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Comfort and safety on every journey</h2>
            <p className="mt-4 text-muted-foreground">
              From the first enquiry to the flight home, one team handles your tickets, hotels, transfers and paperwork
              — so nothing is left to chance.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
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
              <p className="text-3xl font-extrabold text-brand md:text-4xl">{v}</p>
              <p className="mt-1 text-sm text-background/70">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-pad mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="eyebrow">Testimonials</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">What our travellers say</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-card p-7">
              <Quote className="size-7 text-brand" />
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
        <div className="rounded-3xl bg-brand px-8 py-14 text-center text-primary-foreground md:px-16">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to plan your next trip?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-90">
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
              className="flex-1 rounded-full bg-background px-6 py-3.5 text-sm text-foreground outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Request a quote
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
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
                  <a href={l.href} className="hover:text-brand-dark">
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
                <Phone className="size-4 text-brand" /> +90 000 000 00 00
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-brand" /> info@arkantravel.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-brand" /> Istanbul, Türkiye
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
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={`block rounded-xl border border-border px-4 py-3 ${className}`}>
      <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="mt-1 flex items-center gap-2">
        <Icon className="size-4 text-brand" />
        <input
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/70"
        />
      </span>
    </label>
  );
}
