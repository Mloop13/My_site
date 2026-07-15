"use client";

import { useLanguage } from "../i18n/context";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      className={`lang-toggle ${className}`}
      onClick={toggleLang}
      aria-label="Switch language / Переключить язык"
    >
      <span className={lang === "ru" ? "lang-toggle-active" : ""}>RU</span>
      <span className="lang-toggle-sep">/</span>
      <span className={lang === "en" ? "lang-toggle-active" : ""}>EN</span>
    </button>
  );
}
