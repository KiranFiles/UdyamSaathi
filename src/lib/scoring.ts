import type { BusinessProfile, ExtractedDocument } from "./schemas";
export function computeScore(p: BusinessProfile, docs: ExtractedDocument[]) {
  const l = (en: string, hi: string) => (p.language === "hi" ? hi : en);
  const usable = docs.filter(
    (d) => d.confidence >= 0.5 && Object.values(d.fields).some(Boolean),
  );
  const bill = usable.find((d) => d.type === "bill_book");
  const sales = ["month1INR", "month2INR", "month3INR"].map((k) =>
    Number(bill?.fields[k]),
  );
  const steady =
    sales.every((n) => Number.isFinite(n) && n > 0) &&
    Math.min(...sales) >= 0.8 * Math.max(...sales);
  const evidence = ["aadhaar", "bill_book", "pan"].filter((t) =>
    usable.some((d) => d.type === t),
  ).length;
  const factor = (name: string, impact: number, max: number) => ({
    name,
    impact,
    note: l(
      `${impact} of ${max} evidence points`,
      `${max} में से ${impact} प्रमाण अंक`,
    ),
  });
  const factors = [
    factor(l("Udyam registration", "उद्यम पंजीकरण"), p.hasUdyam ? 15 : 0, 15),
    factor(l("GST registration", "जीएसटी पंजीकरण"), p.hasGST ? 17 : 0, 17),
    factor(l("Bank account", "बैंक खाता"), p.hasBankAccount ? 15 : 0, 15),
    factor(
      l("Years in business", "व्यवसाय के वर्ष"),
      Math.min(3, Math.floor(p.yearsInBusiness ?? 0)) * 5,
      15,
    ),
    factor(
      l("Three-month sales consistency", "तीन माह की बिक्री में स्थिरता"),
      steady ? 20 : 0,
      20,
    ),
    factor(l("Readable documents", "पढ़ने योग्य दस्तावेज़"), evidence * 6, 18),
  ];
  const score = factors.reduce((n, f) => n + f.impact, 0),
    band = score < 40 ? "low" : score < 75 ? "medium" : "high";
  return { score, band, factors } as const;
}
