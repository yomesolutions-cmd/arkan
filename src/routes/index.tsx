import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getHomeContent } from "@/lib/catalog.functions";
import { getSiteContent, subscribeEmail } from "@/lib/content.functions";
import { imageFor } from "@/lib/images";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
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
  Plane,
  Hotel,
  Facebook,
  Instagram,
  Send,
  ArrowRight,
} from "lucide-react";

import logo from "@/assets/arkan-logo.png.asset.json";
import hero from "@/assets/hero.jpg";
import about from "@/assets/about.jpg";

const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => getHomeContent(),
});

const contentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(homeQuery);
    void context.queryClient.ensureQueryData(contentQuery);
  },
  errorComponent: () => (
    <div className="p-16 text-center text-sm text-muted-foreground">
      Could not load content right now. Please refresh.
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Arkan Travel — رحلات وطيران وفنادق | Tours, Flights & Hotels" },
      {
        name: "description",
        content:
          "Arkan Travel and Tourism Agency: flights, hotels and curated tour packages worldwide, in Arabic and English.",
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
  { key: "nav.home", href: "#home" },
  { key: "nav.tours", href: "#packages" },
  { key: "nav.destinations", href: "#destinations" },
  { key: "nav.about", href: "#about" },
  { key: "nav.contact", href: "#contact" },
] as const;

const features = [
  { icon: Wallet, title: "feat.price.title", text: "feat.price.text" },
  { icon: ShieldCheck, title: "feat.safe.title", text: "feat.safe.text" },
  { icon: Headphones, title: "feat.support.title", text: "feat.support.text" },
  { icon: Clock, title: "feat.fast.title", text: "feat.fast.text" },
] as const;

const heroServices = [
  { icon: Plane, label: "hero.service.flights" },
  { icon: Hotel, label: "hero.service.hotels" },
  { icon: Flag, label: "hero.service.tours" },
  { icon: ShieldCheck, label: "hero.service.visa" },
] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "A";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return `${first}${second ?? ""}`.toUpperCase();
}

function Index() {
  const { t, lang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(homeQuery);
  const { data: site } = useSuspenseQuery(contentQuery);
  const destinations = data.destinations;
  const packages = data.tours;
  const testimonials = site.testimonials;

  const sec = (name: string) => site.sections[name]?.[lang] ?? site.sections[name]?.en ?? {};
  const heroC = sec("hero");
  const aboutC = sec("about");
  const testiC = sec("testimonials_header");
  const newsC = sec("newsletter");

  const ar = lang === "ar";
  const L = (en: string | null | undefined, arv: string | null | undefined) =>
    ar ? (arv?.trim() ? arv : (en ?? "")) : (en?.trim() ? en : (arv ?? ""));
  const activeTestimonial = testimonials[testimonialIndex % testimonials.length] ?? testimonials[0];
  const featuredTestimonials = testimonials.slice(0, 6);

  const [dest, setDest] = useState("");
  const [activity, setActivity] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");

  const subscribe = useServerFn(subscribeEmail);
  const [email, setEmail] = useState("");
  const [newsState, setNewsState] = useState<"idle" | "ok" | "error">("idle");

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
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <a href="#home" className="flex items-center">
            <img src={logo.url} alt="Arkan Travel logo" className="h-12 w-auto md:h-14" width={160} height={160} />
          </a>
          <nav className="hidden items-center gap-2 rounded-full border border-border/80 bg-background/80 p-1 shadow-sm lg:flex">
            {navLinks.map((l, i) => (
              <a
                key={l.key}
                href={l.href}
                className={`rounded-full px-4 py-2 text-[0.9rem] font-semibold transition-colors hover:bg-brand-soft hover:text-brand ${
                  i === 0 ? "bg-brand-soft text-brand" : "text-ink"
                }`}
              >
                {t(l.key)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3 md:gap-4">
            <LanguageToggle />
            {signedIn ? (
              <>
                <Link to="/amin" className="hidden text-[0.95rem] font-semibold text-ink hover:text-brand md:inline">
                  {t("nav.admin")}
                </Link>
                <Link
                  to="/dashboard"
                  className="hidden rounded-full bg-coral px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-coral/20 transition-colors hover:bg-coral-dark sm:inline-flex"
                >
                  {t("nav.myBookings")}
                </Link>
              </>
            ) : (
              <Link
                to="/auth"
                search={{ redirect: "/dashboard" }}
                aria-label={t("nav.login")}
                title={t("nav.login")}
                className="hidden size-11 items-center justify-center rounded-full bg-coral text-primary-foreground shadow-lg shadow-coral/20 transition-colors hover:bg-coral-dark sm:inline-flex"
              >
                <User className="size-5" />
              </Link>
            )}
            <button
              aria-label={t("nav.menu")}
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-full border border-border bg-background p-2.5 text-ink lg:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-border bg-background px-6 py-4 shadow-lg lg:hidden">
            {navLinks.map((l) => (
              <a
                key={l.key}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-semibold text-ink hover:bg-brand-soft hover:text-brand"
              >
                {t(l.key)}
              </a>
            ))}
            {signedIn && (
              <Link
                to="/amin"
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-sm font-semibold text-ink"
              >
                {t("nav.admin")}
              </Link>
            )}
            {!signedIn && (
              <Link
                to="/auth"
                search={{ redirect: "/dashboard" }}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 text-sm font-semibold text-ink"
              >
                <User className="size-4 text-coral" />
                {t("nav.login")}
              </Link>
            )}
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="topo relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-24 pt-10 md:pt-14 lg:grid-cols-[0.95fr_1.05fr] lg:pb-32">
          <div className="relative z-10">
            <p className="eyebrow -rotate-2">{heroC["eyebrow"]}</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl md:text-6xl lg:text-[4.35rem]">
              {heroC["title"]}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground md:text-lg">{heroC["subtitle"]}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {heroServices.map((service) => (
                <span
                  key={service.label}
                  className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-background/80 px-4 py-2 text-sm font-semibold text-ink shadow-sm"
                >
                  <service.icon className="size-4 text-brand" />
                  {t(service.label)}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-xl overflow-hidden rounded-[2rem] shadow-[0_35px_90px_-45px_var(--ink)] sm:aspect-[5/4] lg:aspect-[4/5]">
              <img
                src={hero}
                alt="Turquoise coastline at golden hour"
                width={1920}
                height={1088}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-background/5" />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-background/20 bg-background/88 p-4 shadow-lg backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand">{t("hero.badge")}</p>
                    <p className="mt-1 text-sm font-extrabold text-ink sm:text-base">{t("hero.badgeText")}</p>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-coral text-primary-foreground">
                    <ShieldCheck className="size-5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search card */}
        <div className="relative z-10 mx-auto -mt-12 max-w-6xl px-6 pb-24">
          <div className="rounded-2xl border border-border/80 bg-card/95 p-4 shadow-[0_35px_90px_-55px_var(--ink)] backdrop-blur md:p-5">
            <div className="grid gap-3 md:grid-cols-[1.25fr_1.05fr_0.95fr_0.8fr_auto]">
              <Field
                icon={MapPin}
                label={t("search.destination")}
                placeholder={t("search.destinationPh")}
                value={dest}
                onChange={setDest}
              />
              <Field
                icon={Flag}
                label={t("search.activity")}
                placeholder={t("search.activityPh")}
                value={activity}
                onChange={setActivity}
              />
              <Field icon={CalendarDays} label={t("search.dates")} placeholder="" type="date" value={date} onChange={setDate} />
              <Field icon={User} label={t("search.guests")} placeholder="2" type="number" value={guests} onChange={setGuests} />
              <button
                aria-label={t("search.action")}
                onClick={submitSearch}
                className="mt-auto flex h-14 items-center justify-center gap-2 rounded-xl bg-coral px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-coral/20 transition-colors hover:bg-coral-dark md:px-7"
              >
                <Search className="size-5" />
                <span className="md:hidden lg:inline">{t("search.action")}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section id="destinations" className="section-pad mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow -rotate-2">{t("sec.destinations.eyebrow")}</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-extrabold md:text-5xl">{t("sec.destinations.title")}</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">{t("sec.destinations.text")}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((d) => (
            <Link
              to="/search"
              search={{ type: "tours" as const, sort: "price_asc" as const, q: d.name }}
              key={d.id}
              className="card-lift group relative block overflow-hidden rounded-2xl bg-ink"
            >
              <img
                src={imageFor(d.image_key)}
                alt={`${d.name}, ${d.country}`}
                loading="lazy"
                width={800}
                height={1000}
                className="h-80 w-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="inline-flex items-center rounded-full bg-background/15 px-3 py-1 text-xs font-semibold text-background backdrop-blur">
                  {L(d.country, d.country_ar)}
                </span>
                <h3 className="mt-3 text-2xl font-extrabold text-background">{L(d.name, d.name_ar)}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-background/75">
                  <MapPin className="size-3.5 text-sun" />
                  {d.region}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="topo">
        <div className="section-pad mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="eyebrow -rotate-2">{t("sec.packages.eyebrow")}</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold md:text-5xl">{t("sec.packages.title")}</h2>
          </div>

          <div className="mt-12 grid gap-7 md:grid-cols-3">
            {packages.map((p) => (
              <article key={p.id} className="card-lift overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
                <div className="relative overflow-hidden">
                  <img
                    src={imageFor(p.image_key)}
                    alt={L(p.title, p.title_ar)}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="h-60 w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                  <span className="absolute start-4 top-4 rounded-full bg-coral px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg">
                    {p.days} {t("card.days")} / {p.nights} {t("card.nights")}
                  </span>
                  <span className="absolute bottom-4 end-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-bold text-ink backdrop-blur">
                    <Star className="size-3.5 fill-sun text-sun" /> {p.rating}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-brand" /> {L(p.place, p.place_ar)}
                  </div>
                  <h3 className="mt-2 min-h-14 text-xl font-extrabold leading-snug text-ink">{L(p.title, p.title_ar)}</h3>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="size-3.5 text-coral" /> {p.min_people}-{p.max_people} {t("card.people")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-brand" /> {p.days + p.nights} {t("card.tripLength")}
                    </span>
                  </div>
                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-border pt-5">
                    <p className="text-sm text-muted-foreground">
                      <span className="block text-xs font-bold uppercase tracking-widest text-brand">{t("card.from")}</span>
                      <span className="text-2xl font-extrabold text-ink">${Number(p.price).toLocaleString()}</span>
                    </p>
                    <Link
                      to="/search"
                      search={{ type: "tours" as const, sort: "price_asc" as const, q: p.place }}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-background transition-colors hover:bg-brand"
                    >
                      {t("search.book")} <ArrowRight className="size-4 rtl:rotate-180" />
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
            <div className="pointer-events-none absolute -start-6 -top-6 size-24 rounded-full bg-sun" />
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
            <div className="absolute -bottom-4 end-2 rounded-xl bg-coral px-7 py-5 text-primary-foreground shadow-lg">
              <p className="text-3xl font-extrabold">{aboutC["stat1_value"]}</p>
              <p className="text-xs font-medium opacity-90">{aboutC["stat1_label"]}</p>
            </div>
          </div>
          <div>
            <p className="eyebrow -rotate-2">{aboutC["eyebrow"]}</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">{aboutC["title"]}</h2>
            <p className="mt-5 text-muted-foreground">{aboutC["body"]}</p>
            <div className="mt-9 grid gap-6 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <f.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold">{t(f.title)}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t(f.text)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ink">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:grid-cols-3">
          {[
            [aboutC["stat1_value"], aboutC["stat1_label"]],
            [aboutC["stat2_value"], aboutC["stat2_label"]],
            [aboutC["stat3_value"], aboutC["stat3_label"]],
          ].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-4xl font-extrabold text-sun">{v}</p>
              <p className="mt-1 text-sm text-background/70">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {activeTestimonial && (
        <section className="testimonial-showcase topo section-pad overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="eyebrow -rotate-2">{testiC["eyebrow"]}</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">{testiC["title"]}</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">{testiC["subtitle"]}</p>
          </div>
          <div className="relative mx-auto mt-12 min-h-[26rem] max-w-5xl md:min-h-[31rem]">
            {featuredTestimonials.map((tm, i) => {
              const name = L(tm.name_en, tm.name_ar);
              const active = tm.id === activeTestimonial.id;
              return (
                <button
                  key={tm.id}
                  type="button"
                  onClick={() => setTestimonialIndex(i)}
                  aria-label={`Show review from ${name}`}
                  className={`testimonial-avatar testimonial-avatar-${i} ${active ? "is-active" : ""}`}
                >
                  <span className="testimonial-avatar-inner">{initials(name)}</span>
                </button>
              );
            })}

            <figure className="testimonial-card relative mx-auto max-w-xl rounded-xl bg-card px-8 py-10 text-center shadow-[0_30px_70px_-45px_var(--ink)] md:max-w-2xl md:px-16 md:py-12">
              <blockquote className="mx-auto max-w-xl text-base font-medium leading-8 text-ink md:text-lg">
                {L(activeTestimonial.quote_en, activeTestimonial.quote_ar)}
              </blockquote>
              <figcaption className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <span className="flex size-20 items-center justify-center rounded-full bg-sun text-xl font-extrabold text-ink shadow-lg ring-4 ring-background">
                  {initials(L(activeTestimonial.name_en, activeTestimonial.name_ar))}
                </span>
                <span className="text-center sm:text-start">
                  <span className="block text-base font-extrabold text-ink">
                    {L(activeTestimonial.name_en, activeTestimonial.name_ar)}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {L(activeTestimonial.role_en, activeTestimonial.role_ar)}
                  </span>
                </span>
              </figcaption>
              <Quote className="pointer-events-none absolute bottom-7 end-8 size-24 text-coral/10 md:size-36" />
            </figure>
            <div className="testimonial-stack testimonial-stack-1" />
            <div className="testimonial-stack testimonial-stack-2" />

            {testimonials.length > 1 && (
              <div className="absolute inset-x-0 bottom-2 flex justify-center gap-3 md:bottom-8">
                {testimonials.slice(0, 5).map((tm, i) => (
                  <button
                    key={tm.id}
                    type="button"
                    onClick={() => setTestimonialIndex(i)}
                    aria-label={`Show testimonial ${i + 1}`}
                    className={`size-2.5 rounded-full transition-all ${
                      i === testimonialIndex ? "w-7 bg-coral" : "bg-coral/25 hover:bg-coral/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          </div>
        </section>
      )}

      {/* Newsletter / contact */}
      <section id="contact" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand px-8 py-16 text-center text-primary-foreground md:px-16">
          <div className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-sun/40" />
          <div className="pointer-events-none absolute -bottom-14 -start-8 size-40 rounded-full bg-coral/40" />
          <div className="relative">
            <h2 className="mt-2 text-4xl font-extrabold md:text-5xl">{newsC["title"]}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm opacity-90">{newsC["subtitle"]}</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await subscribe({ data: { email, locale: lang } });
                  setNewsState("ok");
                  setEmail("");
                } catch {
                  setNewsState("error");
                }
              }}
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={newsC["placeholder"]}
                className="flex-1 rounded-md bg-background px-6 py-4 text-sm text-foreground outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-coral px-8 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-coral-dark"
              >
                {newsC["cta"]}
              </button>
            </form>
            {newsState !== "idle" && (
              <p className="mt-3 text-sm font-semibold">
                {newsState === "ok" ? t("news.success") : t("news.error")}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="topo">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
          <div>
            <img src={logo.url} alt="Arkan Travel logo" loading="lazy" width={160} height={160} className="h-16 w-auto" />
            <p className="mt-4 text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold">{t("footer.company")}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {navLinks.map((l) => (
                <li key={l.key}>
                  <a href={l.href} className="hover:text-coral">
                    {t(l.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold">{t("footer.services")}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>{t("footer.svc1")}</li>
              <li>{t("footer.svc2")}</li>
              <li>{t("footer.svc3")}</li>
              <li>{t("footer.svc4")}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold">{t("footer.contact")}</h3>
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
          © {new Date().getFullYear()} Arkan Travel. {t("footer.rights")}
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
    <label className="block rounded-xl border border-border/80 bg-background px-4 py-3 transition-colors focus-within:border-brand">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <Icon className="size-4 text-brand" />
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-7 w-full border-none bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted-foreground"
      />
    </label>
  );
}
