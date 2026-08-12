import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, toggle, t } = useI18n();
  const targetFlag = lang === "ar" ? "🇬🇧" : "🇸🇦";

  return (
    <button
      onClick={toggle}
      aria-label={t("lang.switch")}
      title={t("lang.switch")}
      className={`inline-flex size-11 items-center justify-center rounded-full border border-brand/35 bg-brand-soft text-xl leading-none text-brand transition-colors hover:border-brand hover:bg-brand hover:text-primary-foreground ${className}`}
    >
      <span aria-hidden="true">{targetFlag}</span>
    </button>
  );
}
