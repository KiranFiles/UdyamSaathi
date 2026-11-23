import sample from "../data/schemes.sample.json";
import type { BusinessProfile, SchemeMatch } from "./schemas";
export function matchRules(p: BusinessProfile): SchemeMatch[] {
  return sample
    .filter(
      (s) =>
        s.category === p.category &&
        (!s.womenOnly || p.gender === "female") &&
        p.monthlyTurnoverINR !== null &&
        p.monthlyTurnoverINR * 12 <= s.annualLimit,
    )
    .map((s) => ({
      id: s.id,
      name: s[p.language],
      matched: true,
      documentsNeeded: s.documentsNeeded,
      reasons: [
        p.language === "hi"
          ? "बताई गई गतिविधि और अनुमानित वार्षिक बिक्री इस नमूने की शर्तों में हैं।"
          : "Reported activity and annualised sales meet this sample rule.",
      ],
      nextSteps: [
        p.language === "hi"
          ? "ज़िला उद्योग केंद्र से वास्तविक योजना की पुष्टि करें।"
          : "Check actual programmes with the district industries centre.",
      ],
    }));
}
