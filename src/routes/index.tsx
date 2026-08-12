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

function Index() {
  const { t, lang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(homeQuery);
  const { data: site } = useSuspenseQuery(contentQuery);
  const destinations = data.destinations;
  const packages = data.tours;

  const sec = (name: string) => site.sections[name]?.[lang] ?? site.sections[name]?.en ?? {};
  const heroC = sec("hero");
  const aboutC = sec("about");
  const testiC = sec("testimonials_header");
  const newsC = sec("newsletter");

  const ar = lang === "ar";
  const L = (en: string | null | undefined, arv: string | null | undefined) =>
    ar ? (arv?.trim() ? arv : (en ?? "")) : (en?.trim() ? en : (arv ?? ""));

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
      <header className="sticky top-0 z-50 bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <a href="#home" className="flex items-center">
            <img src={logo.url} alt="Arkan Travel logo" className="h-14 w-auto" width={160} height={160} />
          </a>
          <nav className="hidden items-center gap-10 lg:flex">
            {navLinks.map((l, i) => (
              <a
                key={l.key}
                href={l.href}
                className={`text-[0.95rem] font-medium transition-colors hover:text-coral ${
                  i === 0 ? "text-coral" : "text-ink"
                }`}
              >
                {t(l.key)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            {signedIn ? (
              <>
                <Link to="/amin" className="hidden text-[0.95rem] font-medium text-ink hover:text-coral md:inline">
                  {t("nav.admin")}
                </Link>
                <Link
                  to="/dashboard"
                  className="hidden rounded-md bg-coral px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-coral-dark sm:inline-flex"
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
                className="hidden size-11 items-center justify-center rounded-full bg-coral text-primary-foreground transition-colors hover:bg-coral-dark sm:inline-flex"
              >
                <User className="size-5" />
              </Link>
            )}
            <button
              aria-label={t("nav.menu")}
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
                key={l.key}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-sm font-semibold text-ink"
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
        <div className="pointer-events-none absolute -start-16 -top-16 size-40 rounded-full bg-coral" />
        <div className="pointer-events-none absolute end-24 top-24 size-36 rounded-full bg-sun" />
        <div className="pointer-events-none absolute -bottom-24 left-1/2 size-56 -translate-x-1/2 rounded-full bg-brand" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-28 pt-16 lg:grid-cols-2 lg:pb-36">
          <div>
            <p className="eyebrow -rotate-3">{heroC["eyebrow"]}</p>
            <h1 className="mt-4 max-w-xl text-5xl font-extrabold leading-[1.05] text-ink md:text-6xl lg:text-[4.25rem]">
              {heroC["title"]}
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground">{heroC["subtitle"]}</p>
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
            <p className="eyebrow -rotate-2">{t("sec.destinations.eyebrow")}</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">{t("sec.destinations.title")}</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">{t("sec.destinations.text")}</p>
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
                <p className="text-xs font-semibold uppercase tracking-widest text-sun">
                  {L(d.country, d.country_ar)}
                </p>
                <h3 className="mt-1 text-xl font-bold text-background">{L(d.name, d.name_ar)}</h3>
                <p className="text-xs text-background/75">{d.region}</p>
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
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">{t("sec.packages.title")}</h2>
          </div>

          <div className="mt-12 grid gap-7 md:grid-cols-3">
            {packages.map((p) => (
              <article key={p.id} className="card-lift overflow-hidden rounded-2xl bg-card">
                <div className="relative">
                  <img
                    src={imageFor(p.image_key)}
                    alt={L(p.title, p.title_ar)}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="h-56 w-full object-cover"
                  />
                  <span className="absolute start-4 top-4 rounded-md bg-coral px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {p.days} {t("card.days")} / {p.nights} {t("card.nights")}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-coral" /> {L(p.place, p.place_ar)}
                  </div>
                  <h3 className="mt-2 text-lg font-bold leading-snug">{L(p.title, p.title_ar)}</h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="size-3.5" /> {p.min_people}-{p.max_people} {t("card.people")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="size-3.5 fill-sun text-sun" /> {p.rating}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                    <p className="text-sm text-muted-foreground">
                      {t("card.from")}{" "}
                      <span className="text-xl font-extrabold text-ink">${Number(p.price).toLocaleString()}</span>
                    </p>
                    <Link
                      to="/search"
                      search={{ type: "tours" as const, sort: "price_asc" as const, q: p.place }}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-coral transition-all hover:gap-2.5"
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
      {site.testimonials.length > 0 && (
        <section className="section-pad mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="eyebrow -rotate-2">{testiC["eyebrow"]}</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">{testiC["title"]}</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">{testiC["subtitle"]}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {site.testimonials.map((tm) => (
              <figure key={tm.id} className="rounded-2xl bg-mint p-8">
                <Quote className="size-7 text-coral" />
                <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {L(tm.quote_en, tm.quote_ar)}
                </blockquote>
                <figcaption className="mt-6">
                  <p className="text-sm font-bold">{L(tm.name_en, tm.name_ar)}</p>
                  <p className="text-xs text-muted-foreground">{L(tm.role_en, tm.role_ar)}</p>
                </figcaption>
              </figure>
            ))}
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
