import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import {
  listTestimonials,
  saveTestimonial,
  deleteTestimonial,
  type Testimonial,
} from "@/lib/content.functions";
import { useI18n } from "@/lib/i18n";

const blank: Testimonial = {
  id: "",
  name_en: "",
  name_ar: "",
  image_url: "",
  role_en: "",
  role_ar: "",
  quote_en: "",
  quote_ar: "",
  rating: 5,
  sort_order: 0,
  is_active: true,
};

export function TestimonialsTab() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const fetchAll = useServerFn(listTestimonials);
  const save = useServerFn(saveTestimonial);
  const remove = useServerFn(deleteTestimonial);

  const { data = [], isLoading } = useQuery({ queryKey: ["admin-testimonials"], queryFn: () => fetchAll() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-testimonials"] });

  const saveM = useMutation({
    mutationFn: (row: Testimonial) => {
      const { id, ...rest } = row;
      return save({ data: id ? { id, ...rest } : rest });
    },
    onSuccess: invalidate,
  });
  const delM = useMutation({ mutationFn: (id: string) => remove({ data: { id } }), onSuccess: invalidate });

  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setCreating((c) => !c)}
        className="flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-brand-dark"
      >
        <Plus className="size-3.5" /> {t("admin.add")}
      </button>

      {creating && (
        <Row
          key="new"
          row={{ ...blank, sort_order: data.length + 1 }}
          onSave={(r) => {
            saveM.mutate(r);
            setCreating(false);
          }}
        />
      )}

      {isLoading && <p className="text-sm text-muted-foreground">{t("admin.loading")}</p>}
      {data.map((row) => (
        <Row key={row.id} row={row} onSave={(r) => saveM.mutate(r)} onDelete={() => delM.mutate(row.id)} />
      ))}
    </div>
  );
}

function Row({
  row,
  onSave,
  onDelete,
}: {
  row: Testimonial;
  onSave: (r: Testimonial) => void;
  onDelete?: () => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState<Testimonial>(row);
  const set = <K extends keyof Testimonial>(k: K, v: Testimonial[K]) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="grid gap-3 md:grid-cols-2">
        <Text label={`${t("admin.english")} — name`} dir="ltr" value={form.name_en} onChange={(v) => set("name_en", v)} />
        <Text label={`${t("admin.arabic")} — الاسم`} dir="rtl" value={form.name_ar} onChange={(v) => set("name_ar", v)} />
        <Text
          label="Image URL"
          dir="ltr"
          value={form.image_url ?? ""}
          onChange={(v) => set("image_url", v)}
        />
        <Text label={`${t("admin.english")} — role`} dir="ltr" value={form.role_en} onChange={(v) => set("role_en", v)} />
        <Text label={`${t("admin.arabic")} — الصفة`} dir="rtl" value={form.role_ar} onChange={(v) => set("role_ar", v)} />
        <Area label={`${t("admin.english")} — quote`} dir="ltr" value={form.quote_en} onChange={(v) => set("quote_en", v)} />
        <Area label={`${t("admin.arabic")} — الاقتباس`} dir="rtl" value={form.quote_ar} onChange={(v) => set("quote_ar", v)} />
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Num label="Rating" value={form.rating} onChange={(v) => set("rating", v)} />
        <Num label="Order" value={form.sort_order} onChange={(v) => set("sort_order", v)} />
        <button
          onClick={() => set("is_active", !form.is_active)}
          className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
          title="Visible on site"
        >
          {form.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
        <button
          onClick={() => onSave(form)}
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-background"
        >
          <Save className="size-3.5" /> {t("admin.save")}
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            <Trash2 className="size-3.5" /> {t("admin.delete")}
          </button>
        )}
      </div>
    </div>
  );
}

function Text({
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
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function Area({
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
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <textarea
        dir={dir}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block w-24">
      <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}
