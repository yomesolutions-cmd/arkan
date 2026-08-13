import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Quote,
  Plane,
  MessageSquare,
  Activity,
  Mail,
  ShieldCheck,
  Users as UsersIcon,
  Menu,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ContentTab } from "@/components/admin/ContentTab";
import { TestimonialsTab } from "@/components/admin/TestimonialsTab";
import { CatalogTab } from "@/components/admin/CatalogTab";
import { QuestionsTab } from "@/components/admin/QuestionsTab";
import { SubscribersTab, ChatLogsTab, UsersTab } from "@/components/admin/ListsTab";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { CalendarTab } from "@/components/admin/CalendarTab";
import { PassportAlertsTab } from "@/components/admin/PassportAlertsTab";
import logo from "@/assets/arkan-logo.png.asset.json";
import { getPublicUrl } from "@/lib/domains";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/amin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }

    const role = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (role.error || !role.data) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Control panel — Arkan Travel admin" },
      {
        name: "description",
        content:
          "Manage Arkan Travel page content, testimonials, trips, hotels, flights, subscribers, chat questions and users in Arabic and English.",
      },
      { property: "og:title", content: "Control panel — Arkan Travel admin" },
      {
        property: "og:description",
        content: "Bilingual control panel for Arkan Travel content, catalog and customers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "passports", label: "Passport alerts", icon: ShieldCheck },
  { id: "content", label: "Page content", icon: FileText },
  { id: "testimonials", label: "Testimonials", icon: Quote },
  { id: "trips", label: "Trips & catalog", icon: Plane },
  { id: "questions", label: "Chat questions", icon: MessageSquare },
  { id: "chatlogs", label: "Chat activity", icon: Activity },
  { id: "subscribers", label: "Subscribers", icon: Mail },
  { id: "users", label: "Users", icon: UsersIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>("overview");
  const [navOpen, setNavOpen] = useState(false);

  const active = TABS.find((x) => x.id === tab)!;

  return (
    <div className="min-h-screen bg-muted/40 lg:flex">
      <aside
        className={`${navOpen ? "block" : "hidden"} shrink-0 bg-ink p-4 text-background lg:block lg:w-64`}
      >
        <a href={getPublicUrl("/")} className="flex items-center gap-2 rounded-xl bg-background/10 p-3">
          <img src={logo.url} alt="Arkan Travel logo" className="h-9 w-auto" width={120} height={120} />
        </a>
        <nav className="mt-6 space-y-1">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={() => {
                setTab(tb.id);
                setNavOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                tab === tb.id ? "bg-brand text-primary-foreground" : "text-background/70 hover:bg-background/10"
              }`}
            >
              <tb.icon className="size-4" />
              {tb.label}
            </button>
          ))}
        </nav>
        <a
          href={getPublicUrl("/dashboard")}
          className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-background/70 hover:bg-background/10"
        >
          {t("dash.title")}
        </a>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-10 border-b border-border bg-background">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNavOpen((v) => !v)}
                aria-label="Toggle menu"
                className="rounded-md border border-border p-2 lg:hidden"
              >
                <Menu className="size-4" />
              </button>
              <h1 className="text-xl font-extrabold text-ink">
                {t("admin.title")} <span className="text-brand">{active.label}</span>
              </h1>
            </div>
            <LanguageToggle />
          </div>
        </header>

        <main className="px-6 py-8">
          {tab === "overview" && <OverviewTab />}
          {tab === "calendar" && <CalendarTab />}
          {tab === "passports" && <PassportAlertsTab />}
          {tab === "content" && <ContentTab />}
          {tab === "testimonials" && <TestimonialsTab />}
          {tab === "trips" && <CatalogTab />}
          {tab === "questions" && <QuestionsTab />}
          {tab === "chatlogs" && <ChatLogsTab />}
          {tab === "subscribers" && <SubscribersTab />}
          {tab === "users" && <UsersTab />}
        </main>
      </div>
    </div>
  );
}

