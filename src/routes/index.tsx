import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Facebook,
  Flag,
  Headphones,
  Hotel,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Plane,
  Quote,
  Search,
  Send,
  ShieldCheck,
  Star,
  Ticket,
  User,
  Wallet,
  X,
} from "lucide-react";

import { LanguageToggle } from "@/components/LanguageToggle";
import { getHomeContent } from "@/lib/catalog.functions";
import { getSiteContent, subscribeEmail } from "@/lib/content.functions";
import { getAdminUrl } from "@/lib/domains";
import { useI18n } from "@/lib/i18n";
import { imageFor } from "@/lib/images";
import { supabase } from "@/integrations/supabase/client";

import about from "@/assets/about.jpg";
import hero from "@/assets/hero.jpg";

const logoUrl = `${import.meta.env.BASE_URL}arkan-logo.png`;

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
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-sm text-muted-foreground">
      Could not load Arkan Travel right now. Please refresh.
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Arkan Travel | Tours, Flights, Hotels and Visas" },
      {
        name: "description",
        content:
          "Arkan Travel creates curated tours, flight tickets, hotel stays and visa support for families, groups and business travelers.",
      },
      { property: "og:title", content: "Arkan Travel" },
      {
        property: "og:description",
        content: "Curated trips, flights, hotels and visa support with comfort and safety from Arkan Travel.",
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

const services = [
  { icon: Plane, key: "hero.service.flights", text: "service.flights.text", type: "flights" as const },
  { icon: Hotel, key: "hero.service.hotels", text: "service.hotels.text", type: "hotels" as const },
  { icon: Ticket, key: "hero.service.tours", text: "service.tours.text", type: "tours" as const },
  { icon: ShieldCheck, key: "hero.service.visa", text: "service.visa.text", type: "tours" as const },
] as const;

const features = [
  { icon: Wallet, title: "feat.price.title", text: "feat.price.text" },
  { icon: ShieldCheck, title: "feat.safe.title", text: "feat.safe.text" },
  { icon: Headphones, title: "feat.support.title", text: "feat.support.text" },
  { icon: Clock, title: "feat.fast.title", text: "feat.fast.text" },
] as const;

const planningSteps = [
  ["01", "steps.pick.title", "steps.pick.text"],
  ["02", "steps.confirm.title", "steps.confirm.text"],
  ["03", "steps.travel.title", "steps.travel.text"],
] as const;

const DEFAULT_TESTIMONIAL_IMAGE = "/testimonials/default-avatar.svg";

function testimonialImage(imageUrl: string | null | undefined) {
  return imageUrl?.trim() || DEFAULT_TESTIMONIAL_IMAGE;
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
  const ar = lang === "ar";
  const pick = (en: string | null | undefined, arv: string | null | undefined) =>
    ar ? (arv?.trim() ? arv : (en ?? "")) : (en?.trim() ? en : (arv ?? ""));

  const sec = (name: string) => site.sections[name]?.[lang] ?? site.sections[name]?.en ?? {};
  const heroC = sec("hero");
  const aboutC = sec("about");
  const testiC = sec("testimonials_header");
  const newsC = sec("newsletter");

  const activeTestimonial = testimonials[testimonialIndex % testimonials.length] ?? testimonials[0];
  const featuredTestimonials = testimonials.slice(0, 4);
  const heroTitle = heroC["title"] || t("hero.title");
  const heroSubtitle = heroC["subtitle"] || t("hero.subtitle");

  const [dest, setDest] = useState("");
  const [activity, setActivity] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");

  const subscribe = useServerFn(subscribeEmail);
  const [email, setEmail] = useState("");
  const [newsState, setNewsState] = useState<"idle" | "ok" | "error">("idle");

  const firstDestination = destinations[0];
  const heroStats = useMemo(
    () => [
      [aboutC["stat1_value"] || "12+", aboutC["stat1_label"] || t("stats.years")],
      [aboutC["stat2_value"] || "80+", aboutC["stat2_label"] || t("stats.destinations")],
      [aboutC["stat3_value"] || "24/7", aboutC["stat3_label"] || t("stats.support")],
    ],
    [aboutC, t],
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: u }) => setSignedIn(Boolean(u.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(Boolean(session)));
    return () => sub.subscription.unsubscribe();
  }, []);

  function submitSearch(type: "tours" | "flights" | "hotels" = "tours") {
    navigate({
      to: "/search",
      search: {
        type,
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
      <div className="hidden bg-ink text-background/80 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-xs">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <PhoneIcon /> +90 000 000 00 00
            </span>
            <span className="flex items-center gap-2">
              <Mail className="size-3.5 text-sun" /> info@arkantravel.com
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>{t("topbar.promise")}</span>
            <Facebook className="size-3.5" />
            <Instagram className="size-3.5" />
            <Send className="size-3.5" />
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <a href="#home" className="flex items-center">
            <img src={logoUrl} alt="Arkan Travel logo" className="h-12 w-auto md:h-14" width={160} height={160} />
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((l) => (
              <a key={l.key} href={l.href} className="text-sm font-bold text-ink transition-colors hover:text-brand">
                {t(l.key)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <a
              href={getAdminUrl("/amin")}
              className="hidden rounded-md border border-border px-4 py-2 text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand md:inline-flex"
            >
              {t("nav.admin")}
            </a>
            {!signedIn && (
              <Link
                to="/auth"
                search={{ redirect: "/dashboard" }}
                className="hidden rounded-md bg-coral px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-coral-dark sm:inline-flex"
              >
                {t("nav.login")}
              </Link>
            )}
            <button
              aria-label={t("nav.menu")}
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-md border border-border p-2.5 text-ink lg:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-border bg-background px-6 py-4 lg:hidden">
            {navLinks.map((l) => (
              <a
                key={l.key}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-bold text-ink hover:bg-brand-soft hover:text-brand"
              >
                {t(l.key)}
              </a>
            ))}
            <a
              href={getAdminUrl("/amin")}
              onClick={() => setMenuOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-bold text-ink hover:bg-brand-soft hover:text-brand"
            >
              {t("nav.admin")}
            </a>
          </nav>
        )}
      </header>

      <section className="relative min-h-[720px] overflow-hidden bg-ink text-background">
        <img src={hero} alt="Arkan Travel hero destination" className="absolute inset-0 size-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/20 rtl:bg-gradient-to-l" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-36 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pt-28">
          <div className="max-w-2xl">
            <p className="eyebrow text-sun">{heroC["eyebrow"] || t("hero.eyebrow")}</p>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.04] text-background md:text-7xl">{heroTitle}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-background/80 md:text-lg">{heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => submitSearch("tours")}
                className="inline-flex items-center gap-2 rounded-md bg-coral px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-coral-dark"
              >
                {t("hero.cta")} <ArrowRight className="size-4 rtl:rotate-180" />
              </button>
              <a
                href="#packages"
                className="inline-flex items-center gap-2 rounded-md border border-background/35 px-6 py-3 text-sm font-bold text-background transition-colors hover:bg-background hover:text-ink"
              >
                {t("hero.secondary")}
              </a>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-3">
              {heroStats.map(([value, label]) => (
                <div key={label} className="border-s border-background/25 ps-4">
                  <p className="text-3xl font-extrabold text-sun">{value}</p>
                  <p className="mt-1 text-xs font-semibold text-background/70">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {firstDestination && (
            <div className="hidden self-end lg:block">
              <div className="ms-auto max-w-sm rounded-lg bg-background p-3 text-ink shadow-2xl">
                <img
                  src={imageFor(firstDestination.image_key)}
                  alt={pick(firstDestination.name, firstDestination.name_ar)}
                  className="h-72 w-full rounded-md object-cover"
                />
                <div className="p-4">
                  <p className="text-xs font-bold uppercase text-brand">{t("hero.featured")}</p>
                  <h2 className="mt-1 text-2xl font-extrabold">{pick(firstDestination.name, firstDestination.name_ar)}</h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4 text-coral" /> {pick(firstDestination.country, firstDestination.country_ar)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-1/2 px-6">
          <div className="mx-auto max-w-6xl rounded-lg bg-card p-4 text-foreground shadow-[0_30px_80px_-35px_var(--ink)] md:p-6">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
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
                onClick={() => submitSearch("tours")}
                className="flex h-14 items-center justify-center rounded-md bg-brand px-7 text-primary-foreground transition-colors hover:bg-brand-dark md:mt-auto"
              >
                <Search className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-7xl px-6 pt-32">
        <div className="grid gap-5 md:grid-cols-4">
          {services.map((service) => (
            <button
              key={service.key}
              onClick={() => submitSearch(service.type)}
              className="group rounded-lg border border-border bg-card p-6 text-start shadow-sm transition hover:-translate-y-1 hover:border-brand hover:shadow-xl"
            >
              <span className="flex size-12 items-center justify-center rounded-md bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-primary-foreground">
                <service.icon className="size-6" />
              </span>
              <h2 className="mt-5 text-xl font-extrabold text-ink">{t(service.key)}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(service.text)}</p>
            </button>
          ))}
        </div>
      </section>

      <section id="destinations" className="section-pad topo">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle eyebrow={t("sec.destinations.eyebrow")} title={t("sec.destinations.title")} text={t("sec.destinations.text")} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((d) => (
              <Link
                to="/search"
                search={{ type: "tours" as const, sort: "price_asc" as const, q: d.name }}
                key={d.id}
                className="card-lift group relative block overflow-hidden rounded-lg bg-ink"
              >
                <img
                  src={imageFor(d.image_key)}
                  alt={`${pick(d.name, d.name_ar)}, ${pick(d.country, d.country_ar)}`}
                  loading="lazy"
                  className="h-80 w-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="inline-flex items-center rounded-md bg-background px-3 py-1 text-xs font-bold text-ink">
                    {pick(d.country, d.country_ar)}
                  </span>
                  <h3 className="mt-3 text-2xl font-extrabold text-background">{pick(d.name, d.name_ar)}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-background/75">
                    <MapPin className="size-3.5 text-sun" />
                    {d.region}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="section-pad mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="eyebrow">{t("sec.packages.eyebrow")}</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold md:text-5xl">{t("sec.packages.title")}</h2>
        </div>

        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {packages.map((p) => (
            <article key={p.id} className="card-lift overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="relative overflow-hidden">
                <img
                  src={imageFor(p.image_key)}
                  alt={pick(p.title, p.title_ar)}
                  loading="lazy"
                  className="h-64 w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <span className="absolute start-4 top-4 rounded-md bg-coral px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg">
                  {p.days} {t("card.days")} / {p.nights} {t("card.nights")}
                </span>
                <span className="absolute bottom-4 end-4 inline-flex items-center gap-1.5 rounded-md bg-background px-3 py-1.5 text-xs font-bold text-ink">
                  <Star className="size-3.5 fill-sun text-sun" /> {p.rating}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <MapPin className="size-3.5 text-brand" /> {pick(p.place, p.place_ar)}
                </div>
                <h3 className="mt-2 min-h-14 text-xl font-extrabold leading-snug text-ink">{pick(p.title, p.title_ar)}</h3>
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
                    <span className="block text-xs font-bold uppercase text-brand">{t("card.from")}</span>
                    <span className="text-2xl font-extrabold text-ink">${Number(p.price).toLocaleString()}</span>
                  </p>
                  <Link
                    to="/search"
                    search={{ type: "tours" as const, sort: "price_asc" as const, q: p.place }}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-background transition-colors hover:bg-brand"
                  >
                    {t("search.book")} <ArrowRight className="size-4 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="section-pad bg-ink text-background">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-sun">{aboutC["eyebrow"] || t("sec.why.eyebrow")}</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">{aboutC["title"] || t("sec.why.title")}</h2>
            <p className="mt-5 max-w-xl leading-8 text-background/75">{aboutC["body"] || t("about.body")}</p>
            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-background/10 text-sun">
                    <f.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-background">{t(f.title)}</h3>
                    <p className="mt-1 text-sm leading-6 text-background/65">{t(f.text)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img src={about} alt="Arkan Travel advisors" loading="lazy" className="aspect-[4/3] w-full rounded-lg object-cover" />
            <div className="absolute bottom-6 start-6 max-w-xs rounded-lg bg-background p-5 text-ink shadow-2xl">
              <p className="text-xs font-bold uppercase text-brand">{t("about.badge")}</p>
              <p className="mt-2 text-2xl font-extrabold">{t("about.badgeText")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad topo">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle eyebrow={t("steps.eyebrow")} title={t("steps.title")} text={t("steps.text")} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {planningSteps.map(([number, title, text]) => (
              <div key={number} className="rounded-lg border border-border bg-card p-7 shadow-sm">
                <span className="text-5xl font-extrabold text-brand-soft">{number}</span>
                <h3 className="mt-4 text-xl font-extrabold text-ink">{t(title)}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {activeTestimonial && (
        <section className="section-pad mx-auto max-w-7xl px-6">
          <SectionTitle
            eyebrow={testiC["eyebrow"] || t("testimonials.eyebrow")}
            title={testiC["title"] || t("testimonials.title")}
            text={testiC["subtitle"] || t("testimonials.text")}
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {featuredTestimonials.map((tm, i) => (
                <button
                  key={tm.id}
                  type="button"
                  onClick={() => setTestimonialIndex(i)}
                  className={`flex items-center gap-4 rounded-lg border p-4 text-start transition ${
                    tm.id === activeTestimonial.id ? "border-coral bg-brand-soft" : "border-border bg-card hover:border-brand"
                  }`}
                >
                  <img
                    src={testimonialImage(tm.image_url)}
                    alt={pick(tm.name_en, tm.name_ar)}
                    className="size-14 rounded-md object-cover"
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_TESTIMONIAL_IMAGE;
                    }}
                  />
                  <span>
                    <span className="block font-extrabold text-ink">{pick(tm.name_en, tm.name_ar)}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{pick(tm.role_en, tm.role_ar)}</span>
                  </span>
                </button>
              ))}
            </div>
            <figure className="relative rounded-lg bg-ink p-8 text-background md:p-12">
              <Quote className="size-12 text-sun" />
              <blockquote className="mt-6 text-xl font-semibold leading-10 md:text-2xl">
                {pick(activeTestimonial.quote_en, activeTestimonial.quote_ar)}
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <img
                  src={testimonialImage(activeTestimonial.image_url)}
                  alt={pick(activeTestimonial.name_en, activeTestimonial.name_ar)}
                  className="size-16 rounded-md object-cover"
                  onError={(event) => {
                    event.currentTarget.src = DEFAULT_TESTIMONIAL_IMAGE;
                  }}
                />
                <span>
                  <span className="block font-extrabold">{pick(activeTestimonial.name_en, activeTestimonial.name_ar)}</span>
                  <span className="mt-1 block text-sm text-background/65">
                    {pick(activeTestimonial.role_en, activeTestimonial.role_ar)}
                  </span>
                </span>
              </figcaption>
            </figure>
          </div>
        </section>
      )}

      <section id="contact" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid overflow-hidden rounded-lg bg-brand text-primary-foreground lg:grid-cols-[1fr_0.85fr]">
          <div className="p-8 md:p-12">
            <p className="eyebrow text-sun">{newsC["eyebrow"] || t("newsletter.eyebrow")}</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">{newsC["title"] || t("newsletter.title")}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 opacity-90">{newsC["subtitle"] || t("newsletter.text")}</p>
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
              className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={newsC["placeholder"] || t("newsletter.placeholder")}
                className="flex-1 rounded-md bg-background px-5 py-4 text-sm text-foreground outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-coral px-7 py-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-coral-dark"
              >
                {newsC["cta"] || t("newsletter.cta")}
              </button>
            </form>
            {newsState !== "idle" && (
              <p className="mt-3 text-sm font-bold">{newsState === "ok" ? t("news.success") : t("news.error")}</p>
            )}
          </div>
          <div className="bg-ink p-8 md:p-12">
            <h3 className="text-2xl font-extrabold">{t("contact.title")}</h3>
            <div className="mt-8 space-y-5 text-sm text-background/75">
              <p className="flex items-center gap-3">
                <PhoneIcon /> +90 000 000 00 00
              </p>
              <p className="flex items-center gap-3">
                <Mail className="size-4 text-sun" /> info@arkantravel.com
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="size-4 text-sun" /> Istanbul, Turkiye
              </p>
            </div>
            <div className="mt-8 flex gap-3">
              {[Facebook, Instagram, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#home"
                  className="flex size-10 items-center justify-center rounded-md bg-background/10 text-background transition-colors hover:bg-brand"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
          <div>
            <img src={logoUrl} alt="Arkan Travel logo" loading="lazy" width={160} height={160} className="h-16 w-auto" />
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{t("footer.tagline")}</p>
          </div>
          <FooterList title={t("footer.company")} items={navLinks.map((l) => [t(l.key), l.href] as const)} />
          <div>
            <h3 className="text-sm font-bold text-ink">{t("footer.services")}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>{t("footer.svc1")}</li>
              <li>{t("footer.svc2")}</li>
              <li>{t("footer.svc3")}</li>
              <li>{t("footer.svc4")}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">{t("footer.contact")}</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-coral" /> info@arkantravel.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-coral" /> Istanbul, Turkiye
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
    <label className="block rounded-md border border-border bg-background px-4 py-3 transition-colors focus-within:border-brand">
      <span className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
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

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-4xl font-extrabold text-ink md:text-5xl">{title}</h2>
      </div>
      {text && <p className="max-w-md text-sm leading-7 text-muted-foreground">{text}</p>}
    </div>
  );
}

function FooterList({ title, items }: { title: string; items: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map(([label, href]) => (
          <li key={href}>
            <a href={href} className="hover:text-coral">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PhoneIcon() {
  return <Headphones className="size-3.5 text-sun" />;
}
