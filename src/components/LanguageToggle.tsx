import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { toggle, t } = useI18n();
  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-coral hover:text-coral ${className}`}
    >
      <Languages className="size-4" />
      {t("lang.switch")}
    </button>
  );
}
