import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Trash2, Plus } from "lucide-react";
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
  { title: string; table: "tour_packages" | "destinations" | "hotels" | "flights"; fields: Field[] }
> = {
  tours: {
    title: "Tours",
    table: "tour_packages",
    fields: [
      { key: "slug", label: "Slug", type: "text" },
      { key: "title", label: "Title (EN)", type: "text" },
      { key: "title_ar", label: "العنوان (AR)", type: "text", dir: "rtl" },
      { key: "place", label: "Place (EN)", type: "text" },
      { key: "place_ar", label: "المكان (AR)", type: "text", dir: "rtl" },
      { key: "description", label: "Description (EN)", type: "area" },
      { key: "description_ar", label: "الوصف (AR)", type: "area", dir: "rtl" },
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
    fields: [
      { key: "slug", label: "Slug", type: "text" },
      { key: "name", label: "Name (EN)", type: "text" },
      { key: "name_ar", label: "الاسم (AR)", type: "text", dir: "rtl" },
      { key: "country", label: "Country (EN)", type: "text" },
      { key: "country_ar", label: "الدولة (AR)", type: "text", dir: "rtl" },
      { key: "region", label: "Region", type: "text" },
      { key: "description", label: "Description (EN)", type: "area" },
      { key: "description_ar", label: "الوصف (AR)", type: "area", dir: "rtl" },
      { key: "image_key", label: "Image key", type: "text" },
      { key: "featured", label: "Featured", type: "bool" },
    ],
  },
  hotels: {
    title: "Hotels",
    table: "hotels",
    fields: [
      { key: "name", label: "Name (EN)", type: "text" },
      { key: "name_ar", label: "الاسم (AR)", type: "text", dir: "rtl" },
      { key: "city", label: "City (EN)", type: "text" },
      { key: "city_ar", label: "المدينة (AR)", type: "text", dir: "rtl" },
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
    fields: [
      { key: "airline", label: "Airline (EN)", type: "text" },
      { key: "airline_ar", label: "شركة الطيران (AR)", type: "text", dir: "rtl" },
      { key: "flight_no", label: "Flight no.", type: "text" },
      { key: "from_city", label: "From (EN)", type: "text" },
      { key: "from_city_ar", label: "من (AR)", type: "text", dir: "rtl" },
      { key: "to_city", label: "To (EN)", type: "text" },
      { key: "to_city_ar", label: "إلى (AR)", type: "text", dir: "rtl" },
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
    onSuccess: invalidate,
  });
  const delM = useMutation({
    mutationFn: (input: { table: (typeof ENTITIES)[EntityKey]["table"]; id: string }) => remove({ data: input }),
    onSuccess: invalidate,
  });

  const [entity, setEntity] = useState<EntityKey>("tours");
  const [creating, setCreating] = useState(false);
  const cfg = ENTITIES[entity];
  const rows = ((data?.[entity] ?? []) as unknown as Row[]) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(ENTITIES) as EntityKey[]).map((k) => (
          <button
            key={k}
            onClick={() => {
              setEntity(k);
              setCreating(false);
            }}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              entity === k ? "bg-ink text-background" : "border border-border text-ink hover:bg-muted"
            }`}
          >
            {ENTITIES[k].title}
          </button>
        ))}
      </div>

      <button
        onClick={() => setCreating((c) => !c)}
        className="flex items-center gap-1.5 rounded-md bg-coral px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-coral-dark"
      >
        <Plus className="size-3.5" /> {t("admin.add")}
      </button>

      {creating && (
        <ItemForm
          key={`new-${entity}`}
          fields={cfg.fields}
          initial={emptyRow(cfg.fields)}
          onSave={(row) => {
            saveM.mutate({ entity, row });
            setCreating(false);
          }}
        />
      )}

      {isLoading && <p className="text-sm text-muted-foreground">{t("admin.loading")}</p>}
      {rows.map((row) => (
        <ItemForm
          key={String(row["id"])}
          fields={cfg.fields}
          initial={row}
          onSave={(next) => saveM.mutate({ entity, row: { ...next, id: row["id"] } })}
          onDelete={() => delM.mutate({ table: cfg.table, id: String(row["id"]) })}
        />
      ))}
    </div>
  );
}

function ItemForm({
  fields,
  initial,
  onSave,
  onDelete,
}: {
  fields: Field[];
  initial: Row;
  onSave: (row: Row) => void;
  onDelete?: () => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState<Row>(() => {
    const r: Row = {};
    for (const f of fields) {
      const v = initial[f.key];
      r[f.key] = f.type === "num" ? Number(v ?? 0) : f.type === "bool" ? Boolean(v) : ((v as string) ?? "");
    }
    return r;
  });
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const heading =
    String(form["title"] ?? form["name"] ?? form["airline"] ?? "") || String(form["slug"] ?? "New item");

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h4 className="mb-3 text-sm font-extrabold text-ink">{heading}</h4>
      <div className="grid gap-3 md:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className={f.type === "area" ? "block md:col-span-2" : "block"}>
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground">{f.label}</span>
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
                className="mt-2 size-4 accent-[var(--coral)]"
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
