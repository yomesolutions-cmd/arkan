import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Trash2, Plus, Eye, EyeOff, Pencil } from "lucide-react";
import {
  listTestimonials,
  saveTestimonial,
  deleteTestimonial,
  type Testimonial,
} from "@/lib/content.functions";
import { useI18n } from "@/lib/i18n";

function messageFromError(error: unknown) {
  return error instanceof Error ? error.message : "Could not save. Please sign in as an admin and try again.";
}

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
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    qc.invalidateQueries({ queryKey: ["home-content"] });
  };

  const saveM = useMutation({
    mutationFn: (row: Testimonial) => {
      const { id, ...rest } = row;
      return save({ data: id ? { id, ...rest } : rest });
    },
    onSuccess: () => {
      invalidate();
      setEditing(null);
      setCreating(false);
    },
  });
  const delM = useMutation({ mutationFn: (id: string) => remove({ data: { id } }), onSuccess: invalidate });

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-ink">Testimonials</h2>
          <p className="text-sm text-muted-foreground">{data.length} rows</p>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          className="flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-brand-dark"
        >
          <Plus className="size-3.5" /> {t("admin.add")}
        </button>
      </div>

      {(creating || editing) && (
        <TestimonialForm
          key={editing?.id ?? "new"}
          row={editing ?? { ...blank, sort_order: data.length + 1 }}
          title={editing ? "Update testimonial" : "Add testimonial"}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(r) => saveM.mutate(r)}
          saving={saveM.isPending}
          error={saveM.error}
        />
      )}

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Quote</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td className="px-4 py-5 text-muted-foreground" colSpan={7}>
                    {t("admin.loading")}
                  </td>
                </tr>
              )}
              {!isLoading && data.length === 0 && (
                <tr>
                  <td className="px-4 py-5 text-muted-foreground" colSpan={7}>
                    {t("admin.empty")}
                  </td>
                </tr>
              )}
              {data.map((row) => (
                <tr key={row.id} className="align-top hover:bg-muted/40">
                  <td className="px-4 py-3 font-semibold text-ink">
                    {row.name_en || row.name_ar || "Untitled"}
                    {row.name_ar && <div className="mt-1 text-xs font-normal text-muted-foreground">{row.name_ar}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.role_en || row.role_ar || "-"}</td>
                  <td className="max-w-sm px-4 py-3 text-muted-foreground">
                    <span className="line-clamp-2">{row.quote_en || row.quote_ar || "-"}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.rating}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        row.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {row.is_active ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(row);
                          setCreating(false);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-ink hover:bg-muted"
                      >
                        <Pencil className="size-3.5" /> Update
                      </button>
                      <button
                        onClick={() => delM.mutate(row.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                      >
                        <Trash2 className="size-3.5" /> {t("admin.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TestimonialForm({
  row,
  title,
  saving,
  error,
  onSave,
  onCancel,
}: {
  row: Testimonial;
  title: string;
  saving: boolean;
  error: unknown;
  onSave: (r: Testimonial) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState<Testimonial>(row);
  const set = <K extends keyof Testimonial>(k: K, v: Testimonial[K]) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => setForm(row), [row]);

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-ink">{title}</h3>
        <button onClick={onCancel} className="rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
          Close
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Text label="Name (EN)" dir="ltr" value={form.name_en} onChange={(v) => set("name_en", v)} />
        <Text label="Name (AR)" dir="rtl" value={form.name_ar} onChange={(v) => set("name_ar", v)} />
        <Text label="Image URL" dir="ltr" value={form.image_url ?? ""} onChange={(v) => set("image_url", v)} />
        <Text label="Role (EN)" dir="ltr" value={form.role_en} onChange={(v) => set("role_en", v)} />
        <Text label="Role (AR)" dir="rtl" value={form.role_ar} onChange={(v) => set("role_ar", v)} />
        <Area label="Quote (EN)" dir="ltr" value={form.quote_en} onChange={(v) => set("quote_en", v)} />
        <Area label="Quote (AR)" dir="rtl" value={form.quote_ar} onChange={(v) => set("quote_ar", v)} />
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
          disabled={saving}
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-background disabled:opacity-50"
        >
          <Save className="size-3.5" /> {saving ? "Saving..." : t("admin.save")}
        </button>
        {error && <p className="basis-full text-sm text-destructive">{messageFromError(error)}</p>}
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
      <span className="mb-1 block text-[10px] uppercase text-muted-foreground">{label}</span>
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
    <label className="block md:col-span-2">
      <span className="mb-1 block text-[10px] uppercase text-muted-foreground">{label}</span>
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
      <span className="mb-1 block text-[10px] uppercase text-muted-foreground">{label}</span>
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
