import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { type ReactNode, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { amIAdmin } from "@/lib/questions.functions";

export const Route = createFileRoute("/amin")({
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
  const checkAdmin = useServerFn(amIAdmin);
  const [tab, setTab] = useState<TabId>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [authState, setAuthState] = useState<"checking" | "signed-out" | "signed-in" | "error">("checking");
  const [authError, setAuthError] = useState<string | null>(null);

  const active = TABS.find((x) => x.id === tab)!;
  const {
    data: adminAccess,
    isLoading: adminLoading,
    error: adminError,
  } = useQuery({
    queryKey: ["admin-access", authState],
    queryFn: () => checkAdmin(),
    enabled: authState === "signed-in",
    retry: false,
  });

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | undefined;

    const setSessionState = (session: unknown) => {
      if (!mounted) return;
      setAuthError(null);
      setAuthState(session ? "signed-in" : "signed-out");
    };

    const setSessionError = (error: unknown) => {
      console.error("Could not initialize admin authentication", error);
      if (!mounted) return;
      setAuthError(error instanceof Error ? error.message : "Unknown authentication error");
      setAuthState("error");
    };

    supabase.auth
      .getSession()
      .then(({ data }) => setSessionState(data.session))
      .catch(setSessionError);

    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSessionState(session);
      });
      subscription = data.subscription;
    } catch (error) {
      setSessionError(error);
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (authState === "checking" || (authState === "signed-in" && adminLoading)) {
    return <AdminState title={t("admin.checking")} />;
  }

  if (authState === "signed-out") {
    return (
      <AdminState
        title={t("admin.onlyAdmins")}
        body="Please sign in before opening the admin dashboard."
        action={
          <Link
            to="/auth"
            search={{ redirect: "/amin" }}
            className="inline-flex rounded-md bg-brand px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-brand-dark"
          >
            {t("auth.signin")}
          </Link>
        }
      />
    );
  }

  if (authState === "error") {
    return (
      <AdminState
        title="Authentication setup needs attention"
        body={`The admin panel could not connect to authentication in this deployment. ${authError ?? ""}`.trim()}
      />
    );
  }

  if (adminError || !adminAccess?.isAdmin) {
    return (
      <AdminState
        title={t("admin.noAccess")}
        body={
          adminError
            ? "Your login session could not be verified for this deployment. Sign out, sign in again, then reopen the admin dashboard."
            : undefined
        }
      />
    );
  }

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

function AdminState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="topo flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-[0_30px_70px_-45px_var(--ink)]">
        <img src={logo.url} alt="Arkan Travel logo" className="mx-auto h-14 w-auto" width={160} height={160} />
        <h1 className="mt-6 text-2xl font-extrabold text-ink">{title}</h1>
        {body && <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}

