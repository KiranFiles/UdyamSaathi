import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  return (
    <button
      className="lang"
      aria-label={t("language")}
      onClick={() => {
        const lang = i18n.language === "hi" ? "en" : "hi";
        localStorage.setItem("saathi-language", lang);
        void i18n.changeLanguage(lang);
        document.documentElement.lang = lang;
      }}
    >
      <Languages size={17} /> {i18n.language === "hi" ? "English" : "हिन्दी"}
    </button>
  );
}
