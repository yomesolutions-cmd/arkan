import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, toggle, t } = useI18n();
  const targetFlag = lang === "ar" ? "\uD83C\uDDFA\uD83C\uDDF8" : "\uD83C\uDDF8\uD83C\uDDE6";

  return (
    <button
      onClick={toggle}
      aria-label={t("lang.switch")}
      title={t("lang.switch")}
      className={`inline-flex h-8 items-center justify-center gap-1 rounded-md px-1.5 text-sm leading-none text-ink transition-colors hover:bg-brand-soft hover:text-brand ${className}`}
    >
      <span aria-hidden="true" className="text-base">
        {targetFlag}
      </span>
      <ChevronDown aria-hidden="true" className="size-3.5" />
    </button>
  );
}
