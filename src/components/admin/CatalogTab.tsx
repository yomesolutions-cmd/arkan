import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Trash2, Plus, Pencil } from "lucide-react";
import {
  listCatalog,
  saveTour,
  saveDestination,
  saveHotel,
  saveFlight,
  deleteCatalogItem,
} from "@/lib/catalog-admin.functions";
import { useI18n } from "@/lib/i18n";

type FieldType = "text" | "area" | "num" | "bool";
type Field = { key: string; label: string; type: FieldType; dir?: "ltr" | "rtl" };
type Row = Record<string, unknown>;
type EntityKey = "tours" | "destinations" | "hotels" | "flights";

const ENTITIES: Record<
  EntityKey,
  {
    title: string;
    table: "tour_packages" | "destinations" | "hotels" | "flights";
    fields: Field[];
    columns: { key: string; label: string; fallback?: string; format?: (value: unknown, row: Row) => string }[];
  }
> = {
  tours: {
    title: "Tours",
    table: "tour_packages",
    columns: [
      { key: "title", label: "Title", fallback: "title_ar" },
      { key: "place", label: "Place", fallback: "place_ar" },
      { key: "days", label: "Days" },
      { key: "price", label: "Price", format: (v) => `$${Number(v ?? 0).toLocaleString()}` },
      { key: "rating", label: "Rating" },
      { key: "featured", label: "Featured", format: (v) => (v ? "Yes" : "No") },
    ],
    fields: [
      { key: "slug", label: "Slug", type: "text" },
      { key: "title", label: "Title (EN)", type: "text" },
      { key: "title_ar", label: "Title (AR)", type: "text", dir: "rtl" },
      { key: "place", label: "Place (EN)", type: "text" },
      { key: "place_ar", label: "Place (AR)", type: "text", dir: "rtl" },
      { key: "description", label: "Description (EN)", type: "area" },
      { key: "description_ar", label: "Description (AR)", type: "area", dir: "rtl" },
      { key: "days", label: "Days", type: "num" },
      { key: "nights", label: "Nights", type: "num" },
      { key: "min_people", label: "Min people", type: "num" },
      { key: "max_people", label: "Max people", type: "num" },
      { key: "price", label: "Price", type: "num" },
      { key: "rating", label: "Rating", type: "num" },
      { key: "category", label: "Category", type: "text" },
      { key: "image_key", label: "Image key", type: "text" },
      { key: "featured", label: "Featured", type: "bool" },
    ],
  },
  destinations: {
    title: "Destinations",
    table: "destinations",
    columns: [
      { key: "name", label: "Name", fallback: "name_ar" },
      { key: "country", label: "Country", fallback: "country_ar" },
      { key: "region", label: "Region" },
      { key: "slug", label: "Slug" },
      { key: "featured", label: "Featured", format: (v) => (v ? "Yes" : "No") },
    ],
    fields: [
      { key: "slug", label: "Slug", type: "text" },
      { key: "name", label: "Name (EN)", type: "text" },
      { key: "name_ar", label: "Name (AR)", type: "text", dir: "rtl" },
      { key: "country", label: "Country (EN)", type: "text" },
      { key: "country_ar", label: "Country (AR)", type: "text", dir: "rtl" },
      { key: "region", label: "Region", type: "text" },
      { key: "description", label: "Description (EN)", type: "area" },
      { key: "description_ar", label: "Description (AR)", type: "area", dir: "rtl" },
      { key: "image_key", label: "Image key", type: "text" },
      { key: "featured", label: "Featured", type: "bool" },
    ],
  },
  hotels: {
    title: "Hotels",
    table: "hotels",
    columns: [
      { key: "name", label: "Name", fallback: "name_ar" },
      { key: "city", label: "City", fallback: "city_ar" },
      { key: "country", label: "Country" },
      { key: "stars", label: "Stars" },
      { key: "price_per_night", label: "Night", format: (v) => `$${Number(v ?? 0).toLocaleString()}` },
    ],
    fields: [
      { key: "name", label: "Name (EN)", type: "text" },
      { key: "name_ar", label: "Name (AR)", type: "text", dir: "rtl" },
      { key: "city", label: "City (EN)", type: "text" },
      { key: "city_ar", label: "City (AR)", type: "text", dir: "rtl" },
      { key: "country", label: "Country", type: "text" },
      { key: "stars", label: "Stars", type: "num" },
      { key: "rating", label: "Rating", type: "num" },
      { key: "price_per_night", label: "Price / night", type: "num" },
      { key: "image_key", label: "Image key", type: "text" },
    ],
  },
  flights: {
    title: "Flights",
    table: "flights",
    columns: [
      { key: "airline", label: "Airline", fallback: "airline_ar" },
      { key: "flight_no", label: "Flight" },
      { key: "from_city", label: "From", fallback: "from_city_ar" },
      { key: "to_city", label: "To", fallback: "to_city_ar" },
      { key: "depart_at", label: "Depart" },
      { key: "price", label: "Price", format: (v) => `$${Number(v ?? 0).toLocaleString()}` },
    ],
    fields: [
      { key: "airline", label: "Airline (EN)", type: "text" },
      { key: "airline_ar", label: "Airline (AR)", type: "text", dir: "rtl" },
      { key: "flight_no", label: "Flight no.", type: "text" },
      { key: "from_city", label: "From (EN)", type: "text" },
      { key: "from_city_ar", label: "From (AR)", type: "text", dir: "rtl" },
      { key: "to_city", label: "To (EN)", type: "text" },
      { key: "to_city_ar", label: "To (AR)", type: "text", dir: "rtl" },
      { key: "depart_at", label: "Depart at (ISO)", type: "text" },
      { key: "arrive_at", label: "Arrive at (ISO)", type: "text" },
      { key: "stops", label: "Stops", type: "num" },
      { key: "cabin", label: "Cabin", type: "text" },
      { key: "price", label: "Price", type: "num" },
    ],
  },
};

function emptyRow(fields: Field[]): Row {
  const r: Row = {};
  for (const f of fields) r[f.key] = f.type === "num" ? 0 : f.type === "bool" ? false : "";
  return r;
}

function displayValue(row: Row, column: (typeof ENTITIES)[EntityKey]["columns"][number]) {
  const value = row[column.key] ?? (column.fallback ? row[column.fallback] : undefined);
  if (column.format) return column.format(value, row);
  return value === undefined || value === null || value === "" ? "-" : String(value);
}

export function CatalogTab() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const fetchAll = useServerFn(listCatalog);
  const saveFns = {
    tours: useServerFn(saveTour),
    destinations: useServerFn(saveDestination),
    hotels: useServerFn(saveHotel),
    flights: useServerFn(saveFlight),
  };
  const remove = useServerFn(deleteCatalogItem);

  const { data, isLoading } = useQuery({ queryKey: ["admin-catalog"], queryFn: () => fetchAll() });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-catalog"] });
    qc.invalidateQueries({ queryKey: ["home-content"] });
  };

  const saveM = useMutation({
    mutationFn: ({ entity, row }: { entity: EntityKey; row: Row }) => saveFns[entity]({ data: row }),
    onSuccess: () => {
      invalidate();
      setCreating(false);
      setEditing(null);
    },
  });
  const delM = useMutation({
    mutationFn: (input: { table: (typeof ENTITIES)[EntityKey]["table"]; id: string }) => remove({ data: input }),
    onSuccess: invalidate,
  });

  const [entity, setEntity] = useState<EntityKey>("tours");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const cfg = ENTITIES[entity];
  const rows = (data?.[entity] ?? []) as unknown as Row[];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(ENTITIES) as EntityKey[]).map((k) => (
          <button
            key={k}
            onClick={() => {
              setEntity(k);
              setCreating(false);
              setEditing(null);
            }}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              entity === k ? "bg-ink text-background" : "border border-border text-ink hover:bg-muted"
            }`}
          >
            {ENTITIES[k].title}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-ink">{cfg.title}</h2>
          <p className="text-sm text-muted-foreground">{rows.length} rows</p>
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
        <ItemForm
          key={editing ? `${entity}-${editing["id"]}` : `new-${entity}`}
          title={editing ? `Update ${cfg.title.slice(0, -1)}` : `Add ${cfg.title.slice(0, -1)}`}
          fields={cfg.fields}
          initial={editing ?? emptyRow(cfg.fields)}
          saving={saveM.isPending}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(row) => saveM.mutate({ entity, row: editing ? { ...row, id: editing["id"] } : row })}
        />
      )}

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
              <tr>
                {cfg.columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 font-semibold">
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td className="px-4 py-5 text-muted-foreground" colSpan={cfg.columns.length + 1}>
                    {t("admin.loading")}
                  </td>
                </tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td className="px-4 py-5 text-muted-foreground" colSpan={cfg.columns.length + 1}>
                    {t("admin.empty")}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={String(row["id"])} className="align-top hover:bg-muted/40">
                  {cfg.columns.map((column, index) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 ${index === 0 ? "font-semibold text-ink" : "text-muted-foreground"}`}
                    >
                      <span className="line-clamp-2">{displayValue(row, column)}</span>
                    </td>
                  ))}
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
                        onClick={() => delM.mutate({ table: cfg.table, id: String(row["id"]) })}
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

function ItemForm({
  fields,
  initial,
  title,
  saving,
  onSave,
  onCancel,
}: {
  fields: Field[];
  initial: Row;
  title: string;
  saving: boolean;
  onSave: (row: Row) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState<Row>({});

  useEffect(() => {
    const next: Row = {};
    for (const f of fields) {
      const v = initial[f.key];
      next[f.key] = f.type === "num" ? Number(v ?? 0) : f.type === "bool" ? Boolean(v) : ((v as string) ?? "");
    }
    setForm(next);
  }, [fields, initial]);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-ink">{title}</h3>
        <button onClick={onCancel} className="rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
          Close
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className={f.type === "area" ? "block md:col-span-2" : "block"}>
            <span className="mb-1 block text-[10px] uppercase text-muted-foreground">{f.label}</span>
            {f.type === "area" ? (
              <textarea
                dir={f.dir ?? "ltr"}
                rows={3}
                value={String(form[f.key] ?? "")}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            ) : f.type === "bool" ? (
              <input
                type="checkbox"
                checked={Boolean(form[f.key])}
                onChange={(e) => set(f.key, e.target.checked)}
                className="mt-2 size-4 accent-[var(--brand)]"
              />
            ) : (
              <input
                dir={f.dir ?? "ltr"}
                type={f.type === "num" ? "number" : "text"}
                step="any"
                value={String(form[f.key] ?? "")}
                onChange={(e) => set(f.key, f.type === "num" ? Number(e.target.value) : e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            )}
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-background disabled:opacity-50"
        >
          <Save className="size-3.5" /> {saving ? "Saving..." : t("admin.save")}
        </button>
      </div>
    </div>
  );
}
