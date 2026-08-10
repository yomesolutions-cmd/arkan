import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Plus } from "lucide-react";
import { listSiteContent, saveSiteContent, type SiteContentRow } from "@/lib/content.functions";
import { useI18n } from "@/lib/i18n";

export function ContentTab() {
  const fetchAll = useServerFn(listSiteContent);
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-site-content"], queryFn: () => fetchAll() });
  const { t } = useI18n();

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("admin.loading")}</p>;
  if (!data.length) return <p className="text-sm text-muted-foreground">{t("admin.empty")}</p>;

  return (
    <div className="space-y-6">
      {data.map((row) => (
        <SectionEditor key={row.id} row={row} />
      ))}
    </div>
  );
}

function SectionEditor({ row }: { row: SiteContentRow }) {
  const qc = useQueryClient();
  const { t } = useI18n();
  const save = useServerFn(saveSiteContent);

  const keys = useMemo(
    () => Array.from(new Set([...Object.keys(row.data_en ?? {}), ...Object.keys(row.data_ar ?? {})])).sort(),
    [row],
  );

  const [en, setEn] = useState<Record<string, string>>(row.data_en ?? {});
  const [ar, setAr] = useState<Record<string, string>>(row.data_ar ?? {});
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    setEn(row.data_en ?? {});
    setAr(row.data_ar ?? {});
  }, [row]);

  const mut = useMutation({
    mutationFn: () => save({ data: { section: row.section, data_en: en, data_ar: ar } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-site-content"] }),
  });

  const allKeys = Array.from(new Set([...keys, ...Object.keys(en), ...Object.keys(ar)]));

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-lg font-extrabold capitalize text-ink">{row.section.replace(/_/g, " ")}</h3>

      <div className="mt-4 space-y-4">
        {allKeys.map((k) => (
          <div key={k} className="grid gap-2 md:grid-cols-[140px_1fr_1fr]">
            <label className="pt-2 text-xs font-semibold text-muted-foreground">{k}</label>
            <Field
              label={t("admin.english")}
              value={en[k] ?? ""}
              dir="ltr"
              onChange={(v) => setEn((p) => ({ ...p, [k]: v }))}
            />
            <Field
              label={t("admin.arabic")}
              value={ar[k] ?? ""}
              dir="rtl"
              onChange={(v) => setAr((p) => ({ ...p, [k]: v }))}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-background disabled:opacity-40"
        >
          <Save className="size-3.5" /> {mut.isSuccess && !mut.isPending ? t("admin.saved") : t("admin.save")}
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const k = newKey.trim();
            if (!k) return;
            setEn((p) => ({ ...p, [k]: "" }));
            setAr((p) => ({ ...p, [k]: "" }));
            setNewKey("");
          }}
          className="flex gap-2"
        >
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="new_field_key"
            className="rounded-md border border-border bg-background px-3 py-2 text-xs"
          />
          <button className="flex items-center gap-1.5 rounded-md border border-coral px-3 py-2 text-xs font-semibold text-coral hover:bg-coral hover:text-primary-foreground">
            <Plus className="size-3.5" /> {t("admin.add")}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  dir,
  onChange,
}: {
  label: string;
  value: string;
  dir: "ltr" | "rtl";
  onChange: (v: string) => void;
}) {
  const long = value.length > 60;
  return (
    <div>
      <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      {long ? (
        <textarea
          dir={dir}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      ) : (
        <input
          dir={dir}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}
