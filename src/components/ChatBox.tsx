import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { listPublicQuestions, type QuestionNode } from "@/lib/questions.functions";
import { logChatClick } from "@/lib/content.functions";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/arkan-logo.png.asset.json";

type Bubble = { id: string; from: "bot" | "user"; text: string };

export function ChatBox() {
  const { t, lang, dir, pick } = useI18n();
  const [open, setOpen] = useState(false);
  const fetchTree = useServerFn(listPublicQuestions);
  const log_ = useServerFn(logChatClick);
  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["question-tree"],
    queryFn: () => fetchTree(),
    enabled: open,
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    if (open && !sessionId) setSessionId(crypto.randomUUID());
  }, [open, sessionId]);

  const [path, setPath] = useState<QuestionNode[]>([]);
  const [log, setLog] = useState<Bubble[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const byParent = useMemo(() => {
    const map = new Map<string | null, QuestionNode[]>();
    for (const n of nodes) {
      const key = n.parent_id;
      const arr = map.get(key) ?? [];
      arr.push(n);
      map.set(key, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.sort_order - b.sort_order);
    return map;
  }, [nodes]);

  const current = path.length ? path[path.length - 1]! : null;
  const options = byParent.get(current ? current.id : null) ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [log, options.length, open]);

  function choose(node: QuestionNode) {
    const label = pick(node.label, node.label_ar);
    const answer = pick(node.answer, node.answer_ar);
    setLog((l) => [
      ...l,
      { id: `${node.id}-u-${l.length}`, from: "user", text: label },
      ...(answer ? [{ id: `${node.id}-b-${l.length}`, from: "bot" as const, text: answer }] : []),
    ]);
    setPath((p) => [...p, node]);
    if (sessionId) {
      void log_({
        data: { session_id: sessionId, node_id: node.id, node_label: label, locale: lang, depth: path.length },
      }).catch(() => undefined);
    }
  }

  function back() {
    setPath((p) => p.slice(0, -1));
  }

  function restart() {
    setPath([]);
    setLog([]);
  }

  const BackIcon = dir === "rtl" ? ChevronRight : ChevronLeft;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t("chat.open")}
          className="fixed bottom-6 end-6 z-50 flex size-14 items-center justify-center rounded-full bg-brand text-primary-foreground shadow-xl shadow-brand/25 ring-4 ring-sun/35 transition-transform hover:scale-105 hover:bg-brand-dark"
        >
          <MessageCircle className="size-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 end-6 z-50 flex h-[32rem] w-[min(22rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-3xl border border-brand/25 bg-card shadow-2xl">
          <header className="flex items-center gap-3 bg-brand px-4 py-3 text-primary-foreground">
            <span className="flex size-12 items-center justify-center rounded-full bg-background p-1 shadow-sm ring-2 ring-sun/70">
              <img src={logo.url} alt="Arkan Travel" className="h-9 w-auto" width={80} height={80} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-extrabold">{t("chat.title")}</p>
              <p className="text-[0.7rem] text-primary-foreground/80">{t("chat.subtitle")}</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t("chat.close")} className="rounded-full p-1.5 hover:bg-background/60">
              <X className="size-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-mint/45 px-4 py-4">
            <p className="max-w-[85%] rounded-2xl rounded-ss-sm border border-brand/15 bg-background px-3 py-2 text-sm text-ink shadow-sm">
              {t("chat.greeting")}
            </p>
            {log.map((b) => (
              <p
                key={b.id}
                className={
                  b.from === "user"
                    ? "ms-auto max-w-[85%] rounded-2xl rounded-se-sm bg-brand px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-brand/20"
                    : "max-w-[85%] rounded-2xl rounded-ss-sm border border-brand/15 bg-background px-3 py-2 text-sm text-ink shadow-sm"
                }
              >
                {b.text}
              </p>
            ))}

            {isLoading && <p className="text-xs text-muted-foreground">{t("chat.loading")}</p>}

            {!isLoading && options.length > 0 && (
              <div className="flex flex-col items-start gap-2 pt-1">
                {options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => choose(o)}
                    className="rounded-full border border-brand/35 bg-background px-3 py-2 text-start text-xs font-semibold text-ink transition-colors hover:bg-brand hover:text-primary-foreground"
                  >
                    {pick(o.label, o.label_ar)}
                  </button>
                ))}
              </div>
            )}

            {!isLoading && options.length === 0 && (
              <p className="text-xs text-muted-foreground">{t("chat.end")}</p>
            )}
          </div>

          <footer className="flex items-center gap-2 border-t border-brand/20 bg-brand-soft px-3 py-2">
            <button
              onClick={back}
              disabled={path.length === 0}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-40 hover:bg-background"
            >
              <BackIcon className="size-3.5" /> {t("chat.back")}
            </button>
            <button
              onClick={restart}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink hover:bg-background"
            >
              <RotateCcw className="size-3.5" /> {t("chat.restart")}
            </button>
          </footer>
        </div>
      )}
    </>
  );
}
