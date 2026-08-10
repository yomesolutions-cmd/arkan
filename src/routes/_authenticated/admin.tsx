import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { amIAdmin } from "@/lib/questions.functions";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ContentTab } from "@/components/admin/ContentTab";
import { TestimonialsTab } from "@/components/admin/TestimonialsTab";
import { CatalogTab } from "@/components/admin/CatalogTab";
import { QuestionsTab } from "@/components/admin/QuestionsTab";
import { SubscribersTab, ChatLogsTab, UsersTab } from "@/components/admin/ListsTab";
import logo from "@/assets/arkan-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/admin")({
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
  { id: "content", key: "admin.tab.content" },
  { id: "testimonials", key: "admin.tab.testimonials" },
  { id: "trips", key: "admin.tab.trips" },
  { id: "questions", key: "admin.tab.questions" },
  { id: "chatlogs", key: "admin.tab.chatlogs" },
  { id: "subscribers", key: "admin.tab.subscribers" },
  { id: "users", key: "admin.tab.users" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const checkAdmin = useServerFn(amIAdmin);
  const { data: adminInfo, isLoading: checking } = useQuery({
    queryKey: ["am-i-admin"],
    queryFn: () => checkAdmin(),
  });
  const isAdmin = adminInfo?.isAdmin ?? false;
  const [tab, setTab] = useState<TabId>("content");

  if (checking) return <p className="p-10 text-sm text-muted-foreground">{t("admin.checking")}</p>;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-extrabold text-ink">{t("admin.onlyAdmins")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("admin.noAccess")}</p>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="mt-6 rounded-md bg-coral px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-coral-dark"
          >
            {t("nav.dashboard")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/">
            <img src={logo.url} alt="Arkan Travel logo" className="h-12 w-auto" width={160} height={160} />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link to="/dashboard" className="text-sm font-semibold text-ink hover:text-coral">
              {t("nav.dashboard")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-extrabold text-ink">{t("admin.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("admin.subtitle")}</p>

        <nav className="mt-8 flex flex-wrap gap-2">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                tab === tb.id
                  ? "bg-coral text-primary-foreground"
                  : "border border-border text-ink hover:border-coral hover:text-coral"
              }`}
            >
              {t(tb.key)}
            </button>
          ))}
        </nav>

        <section className="mt-8">
          {tab === "content" && <ContentTab />}
          {tab === "testimonials" && <TestimonialsTab />}
          {tab === "trips" && <CatalogTab />}
          {tab === "questions" && <QuestionsTab />}
          {tab === "chatlogs" && <ChatLogsTab />}
          {tab === "subscribers" && <SubscribersTab />}
          {tab === "users" && <UsersTab />}
        </section>
      </main>
    </div>
  );
}
