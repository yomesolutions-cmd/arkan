import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, toggle, t } = useI18n();
  const targetFlag =
    lang === "ar"
      ? { src: "/flags/us-flag.webp", alt: "United States flag" }
      : { src: "/flags/ps-flag.png", alt: "Palestine flag" };

  return (
    <button
      onClick={toggle}
      aria-label={t("lang.switch")}
      title={t("lang.switch")}
      className={`inline-flex h-8 items-center justify-center gap-1 rounded-md px-1.5 text-sm leading-none text-ink transition-colors hover:bg-brand-soft hover:text-brand ${className}`}
    >
      <img src={targetFlag.src} alt={targetFlag.alt} className="h-3 w-5 rounded-[1px] object-cover shadow-sm" />
      <ChevronDown aria-hidden="true" className="size-3.5" />
    </button>
  );
}
