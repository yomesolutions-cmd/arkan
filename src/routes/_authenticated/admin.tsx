import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Save, Eye, EyeOff } from "lucide-react";
import {
  amIAdmin,
  listAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type QuestionNode,
} from "@/lib/questions.functions";
import logo from "@/assets/arkan-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Question builder admin — Arkan Travel" },
      {
        name: "description",
        content: "Build the hierarchical chat question tree that powers the Arkan Travel help chat box.",
      },
      { property: "og:title", content: "Question builder — Arkan Travel" },
      { property: "og:description", content: "Manage nested chat topics, sub-topics and answers." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkAdmin = useServerFn(amIAdmin);
  const fetchAll = useServerFn(listAllQuestions);
  const add = useServerFn(createQuestion);
  const patch = useServerFn(updateQuestion);
  const remove = useServerFn(deleteQuestion);

  const { data: adminInfo, isLoading: checking } = useQuery({
    queryKey: ["am-i-admin"],
    queryFn: () => checkAdmin(),
  });
  const isAdmin = adminInfo?.isAdmin ?? false;

  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["question-tree-admin"],
    queryFn: () => fetchAll(),
    enabled: isAdmin,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["question-tree-admin"] });
    qc.invalidateQueries({ queryKey: ["question-tree"] });
  };

  const addM = useMutation({
    mutationFn: (input: { parent_id: string | null; label: string; sort_order: number }) =>
      add({ data: input }),
    onSuccess: invalidate,
  });
  const patchM = useMutation({
    mutationFn: (input: { id: string; label?: string; answer?: string | null; is_active?: boolean; sort_order?: number }) =>
      patch({ data: input }),
    onSuccess: invalidate,
  });
  const delM = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: invalidate,
  });

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

  if (checking) {
    return <p className="p-10 text-sm text-muted-foreground">Checking your access…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-extrabold text-ink">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account doesn't have admin access to the question builder.
          </p>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="mt-6 rounded-md bg-coral px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-coral-dark"
          >
            Back to my bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/">
            <img src={logo.url} alt="Arkan Travel logo" className="h-12 w-auto" width={160} height={160} />
          </Link>
          <Link to="/dashboard" className="text-sm font-semibold text-ink hover:text-coral">
            My bookings
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="eyebrow -rotate-2">Admin</p>
        <h1 className="mt-2 text-4xl font-extrabold text-ink">Chat question builder</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Build unlimited levels of topics. A topic with children shows them as next choices; a topic with an
          answer replies in the chat.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newRoot.trim()) return;
            addM.mutate({
              parent_id: null,
              label: newRoot.trim(),
              sort_order: (byParent.get(null)?.length ?? 0) + 1,
            });
            setNewRoot("");
          }}
          className="mt-8 flex gap-2"
        >
          <input
            value={newRoot}
            onChange={(e) => setNewRoot(e.target.value)}
            placeholder="New main topic"
            className="flex-1 rounded-md border border-border bg-card px-4 py-3 text-sm"
          />
          <button className="flex items-center gap-2 rounded-md bg-coral px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-coral-dark">
            <Plus className="size-4" /> Add topic
          </button>
        </form>

        <div className="mt-8 space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading question tree…</p>}
          {(byParent.get(null) ?? []).map((n) => (
            <NodeRow
              key={n.id}
              node={n}
              depth={0}
              byParent={byParent}
              onAdd={(parent_id, label, sort_order) => addM.mutate({ parent_id, label, sort_order })}
              onPatch={(input) => patchM.mutate(input)}
              onDelete={(id) => delM.mutate(id)}
            />
          ))}
        </div>
      </main>
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
  onAdd: (parentId: string, label: string, sortOrder: number) => void;
  onPatch: (input: { id: string; label?: string; answer?: string | null; is_active?: boolean }) => void;
  onDelete: (id: string) => void;
}) {
  const children = byParent.get(node.id) ?? [];
  const [open, setOpen] = useState(depth === 0);
  const [label, setLabel] = useState(node.label);
  const [answer, setAnswer] = useState(node.answer ?? "");
  const [child, setChild] = useState("");

  const dirty = label !== node.label || answer !== (node.answer ?? "");

  return (
    <div style={{ marginLeft: depth * 20 }} className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setOpen((o) => !o)} aria-label="Toggle children" className="rounded p-1 hover:bg-muted">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
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

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={2}
        placeholder="Answer shown in chat (leave empty if this topic only leads to sub-topics)"
        className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          disabled={!dirty}
          onClick={() => onPatch({ id: node.id, label: label.trim(), answer: answer.trim() || null })}
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-background disabled:opacity-40"
        >
          <Save className="size-3.5" /> Save
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!child.trim()) return;
            onAdd(node.id, child.trim(), children.length + 1);
            setChild("");
            setOpen(true);
          }}
          className="flex flex-1 gap-2"
        >
          <input
            value={child}
            onChange={(e) => setChild(e.target.value)}
            placeholder="Add sub-question"
            className="min-w-40 flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs"
          />
          <button className="flex items-center gap-1.5 rounded-md border border-coral px-3 py-2 text-xs font-semibold text-coral hover:bg-coral hover:text-primary-foreground">
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
