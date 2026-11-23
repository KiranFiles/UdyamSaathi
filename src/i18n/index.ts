import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import hi from "./hi.json";
import en from "./en.json";
void i18n
  .use(initReactI18next)
  .init({
    resources: { hi: { translation: hi }, en: { translation: en } },
    lng: localStorage.getItem("saathi-language") === "hi" ? "hi" : "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    initImmediate: false,
  });
export function useCopy() {
  const { i18n } = useTranslation();
  return (english: string, hindi: string) =>
    i18n.language === "hi" ? hindi : english;
}
export default i18n;
