import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, ChevronRight, Plus, Trash2, Save, Eye, EyeOff } from "lucide-react";
import {
  listAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type QuestionNode,
} from "@/lib/questions.functions";
import { useI18n } from "@/lib/i18n";

type PatchInput = {
  id: string;
  label?: string;
  label_ar?: string;
  answer?: string | null;
  answer_ar?: string | null;
  is_active?: boolean;
};

export function QuestionsTab() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const fetchAll = useServerFn(listAllQuestions);
  const add = useServerFn(createQuestion);
  const patch = useServerFn(updateQuestion);
  const remove = useServerFn(deleteQuestion);

  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["question-tree-admin"],
    queryFn: () => fetchAll(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["question-tree-admin"] });
    qc.invalidateQueries({ queryKey: ["question-tree"] });
  };

  const addM = useMutation({
    mutationFn: (input: { parent_id: string | null; label: string; label_ar: string; sort_order: number }) =>
      add({ data: input }),
    onSuccess: invalidate,
  });
  const patchM = useMutation({ mutationFn: (input: PatchInput) => patch({ data: input }), onSuccess: invalidate });
  const delM = useMutation({ mutationFn: (id: string) => remove({ data: { id } }), onSuccess: invalidate });

  const byParent = useMemo(() => {
    const map = new Map<string | null, QuestionNode[]>();
    for (const n of nodes) {
      const arr = map.get(n.parent_id) ?? [];
      arr.push(n);
      map.set(n.parent_id, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.sort_order - b.sort_order);
    return map;
  }, [nodes]);

  const [newRoot, setNewRoot] = useState("");
  const [newRootAr, setNewRootAr] = useState("");

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newRoot.trim()) return;
          addM.mutate({
            parent_id: null,
            label: newRoot.trim(),
            label_ar: newRootAr.trim(),
            sort_order: (byParent.get(null)?.length ?? 0) + 1,
          });
          setNewRoot("");
          setNewRootAr("");
        }}
        className="flex flex-wrap gap-2"
      >
        <input
          value={newRoot}
          onChange={(e) => setNewRoot(e.target.value)}
          placeholder="New main topic (EN)"
          className="min-w-48 flex-1 rounded-md border border-border bg-card px-4 py-3 text-sm"
        />
        <input
          dir="rtl"
          value={newRootAr}
          onChange={(e) => setNewRootAr(e.target.value)}
          placeholder="الموضوع الرئيسي (AR)"
          className="min-w-48 flex-1 rounded-md border border-border bg-card px-4 py-3 text-sm"
        />
        <button className="flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-brand-dark">
          <Plus className="size-4" /> {t("admin.add")}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">{t("admin.loading")}</p>}
        {(byParent.get(null) ?? []).map((n) => (
          <NodeRow
            key={n.id}
            node={n}
            depth={0}
            byParent={byParent}
            onAdd={(parent_id, label, label_ar, sort_order) =>
              addM.mutate({ parent_id, label, label_ar, sort_order })
            }
            onPatch={(input) => patchM.mutate(input)}
            onDelete={(id) => delM.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
}

function NodeRow({
  node,
  depth,
  byParent,
  onAdd,
  onPatch,
  onDelete,
}: {
  node: QuestionNode;
  depth: number;
  byParent: Map<string | null, QuestionNode[]>;
  onAdd: (parentId: string, label: string, labelAr: string, sortOrder: number) => void;
  onPatch: (input: PatchInput) => void;
  onDelete: (id: string) => void;
}) {
  const children = byParent.get(node.id) ?? [];
  const [open, setOpen] = useState(depth === 0);
  const [label, setLabel] = useState(node.label);
  const [labelAr, setLabelAr] = useState(node.label_ar ?? "");
  const [answer, setAnswer] = useState(node.answer ?? "");
  const [answerAr, setAnswerAr] = useState(node.answer_ar ?? "");
  const [child, setChild] = useState("");
  const [childAr, setChildAr] = useState("");

  const dirty =
    label !== node.label ||
    labelAr !== (node.label_ar ?? "") ||
    answer !== (node.answer ?? "") ||
    answerAr !== (node.answer_ar ?? "");

  return (
    <div style={{ marginInlineStart: depth * 20 }} className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setOpen((o) => !o)} aria-label="Toggle children" className="rounded p-1 hover:bg-muted">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (EN)"
          className="min-w-40 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-ink"
        />
        <input
          dir="rtl"
          value={labelAr}
          onChange={(e) => setLabelAr(e.target.value)}
          placeholder="العنوان (AR)"
          className="min-w-40 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-ink"
        />
        <button
          onClick={() => onPatch({ id: node.id, is_active: !node.is_active })}
          title={node.is_active ? "Hide from chat" : "Show in chat"}
          className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
        >
          {node.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
        <button
          onClick={() => onDelete(node.id)}
          aria-label="Delete topic"
          className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={2}
          placeholder="Answer in English (leave empty if this topic only leads to sub-topics)"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <textarea
          dir="rtl"
          value={answerAr}
          onChange={(e) => setAnswerAr(e.target.value)}
          rows={2}
          placeholder="الإجابة بالعربية"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          disabled={!dirty}
          onClick={() =>
            onPatch({
              id: node.id,
              label: label.trim(),
              label_ar: labelAr.trim(),
              answer: answer.trim() || null,
              answer_ar: answerAr.trim() || null,
            })
          }
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-background disabled:opacity-40"
        >
          <Save className="size-3.5" /> Save
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!child.trim()) return;
            onAdd(node.id, child.trim(), childAr.trim(), children.length + 1);
            setChild("");
            setChildAr("");
            setOpen(true);
          }}
          className="flex flex-1 flex-wrap gap-2"
        >
          <input
            value={child}
            onChange={(e) => setChild(e.target.value)}
            placeholder="Sub-question (EN)"
            className="min-w-36 flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs"
          />
          <input
            dir="rtl"
            value={childAr}
            onChange={(e) => setChildAr(e.target.value)}
            placeholder="سؤال فرعي (AR)"
            className="min-w-36 flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs"
          />
          <button className="flex items-center gap-1.5 rounded-md border border-brand px-3 py-2 text-xs font-semibold text-brand hover:bg-brand hover:text-primary-foreground">
            <Plus className="size-3.5" /> Sub
          </button>
        </form>
      </div>

      {open && children.length > 0 && (
        <div className="mt-3 space-y-3">
          {children.map((c) => (
            <NodeRow
              key={c.id}
              node={c}
              depth={depth + 1}
              byParent={byParent}
              onAdd={onAdd}
              onPatch={onPatch}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
