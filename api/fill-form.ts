import { z } from "zod";
import {
  BusinessProfile,
  ExtractedDocument,
  UdyamDraft,
} from "../src/lib/schemas";
import { endpoint } from "./_lib/http";
export const evidence = z.object({
  profile: BusinessProfile,
  documents: ExtractedDocument.array().max(8),
});
export default endpoint(
  evidence,
  UdyamDraft,
  async ({ profile: p, documents }) => {
    const l = (en: string, hi: string) => (p.language === "hi" ? hi : en);
    const identity = documents.find((d) => d.type === "aadhaar")?.fields
      .aadhaarLast4;
    const bank = documents.find(
      (d) =>
        d.type === "bank_passbook" && Object.values(d.fields).some(Boolean),
    );
    const entries: [string, string | number | null | undefined, string?][] = [
      [l("Owner", "मालिक"), p.ownerName],
      [l("Enterprise", "उद्यम"), p.businessName],
      [l("Activity", "गतिविधि"), p.activity],
      [l("Sector", "क्षेत्र"), p.category],
      [l("District", "ज़िला"), p.district],
      [l("Location", "स्थान"), p.location],
      [l("Employees", "कर्मचारी"), p.employees],
      [l("Monthly sales (INR)", "मासिक बिक्री (₹)"), p.monthlyTurnoverINR],
      [l("Masked Aadhaar", "मास्क किया आधार"), identity, "Aadhaar / आधार"],
      [
        l("Bank account proof", "बैंक खाते का प्रमाण"),
        bank ? l("Provided", "उपलब्ध") : null,
        "Bank passbook / बैंक पासबुक",
      ],
    ];
    const fields = entries.map(([label, v, s]) => ({
      label,
      value: v == null ? null : String(v),
      source:
        v == null
          ? l("Not provided", "नहीं मिला")
          : (s ?? l("Owner’s description", "मालिक का विवरण")),
      confirmed: false,
    }));
    const missingFields = fields
      .filter((f) => f.value === null)
      .map((f) => f.label);
    return {
      fields,
      missingFields,
      completionPercent: Math.round(
        (100 * (fields.length - missingFields.length)) / fields.length,
      ),
    };
  },
);
