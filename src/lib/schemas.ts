import { z } from "zod";
const text = z.string().trim().min(1).max(1200);
const unknownText = text.nullable();
const count = z.number().finite().nonnegative().nullable();
export const language = z.enum(["hi", "en"]);
export const BusinessProfile = z.object({
  ownerName: unknownText,
  businessName: unknownText,
  gender: z.enum(["female", "male", "other"]).nullable(),
  activity: unknownText,
  category: z.enum(["manufacturing", "services", "trading"]).nullable(),
  district: unknownText,
  location: z.enum(["urban", "rural"]).nullable(),
  monthlyTurnoverINR: count,
  employees: count,
  yearsInBusiness: count,
  hasGST: z.boolean().nullable(),
  hasUdyam: z.boolean().nullable(),
  hasBankAccount: z.boolean().nullable(),
  socialCategory: z.enum(["general", "sc", "st", "obc", "minority"]).nullable(),
  language,
});
export const docType = z.enum([
  "aadhaar",
  "pan",
  "bill_book",
  "product",
  "shop_board",
  "bank_passbook",
  "unknown",
]);
export const ExtractedDocument = z.object({
  type: docType,
  fields: z.record(unknownText),
  confidence: z.number().min(0).max(1),
  warnings: z.array(text),
});
export const UdyamDraft = z.object({
  fields: z.array(
    z.object({
      label: text,
      value: unknownText,
      source: text,
      confirmed: z.boolean(),
    }),
  ),
  missingFields: z.array(text),
  completionPercent: z.number().int().min(0).max(100),
});
export const SchemeMatch = z.object({
  id: text,
  name: text,
  matched: z.boolean(),
  reasons: z.array(text).min(1),
  nextSteps: z.array(text).min(1),
  documentsNeeded: z.array(text),
});
export const LoanReadiness = z.object({
  score: z.number().int().min(0).max(100),
  band: z.enum(["low", "medium", "high"]),
  factors: z.array(z.object({ name: text, impact: z.number(), note: text })),
  explanation: text,
  improvementTips: z.array(text).length(3),
});
export const CatalogueItem = z.object({
  name: text,
  nameHi: text,
  description: text,
  category: text,
  suggestedPriceINR: count,
  unit: unknownText,
  imageUrl: z.string().max(500),
});
export const AgentStep = z.object({
  agent: text,
  status: z.enum(["pending", "running", "done", "error"]),
  reasoning: z.array(text),
  durationMs: z.number().nonnegative().optional(),
});
export const Reminder = z.object({ title: text, when: text, note: text });
export const Report = z.object({
  profile: BusinessProfile,
  documents: ExtractedDocument.array(),
  draft: UdyamDraft,
  schemes: SchemeMatch.array(),
  loan: LoanReadiness,
  catalogue: CatalogueItem.array(),
  reminders: Reminder.array(),
  demo: z.boolean(),
});
export type BusinessProfile = z.infer<typeof BusinessProfile>;
export type ExtractedDocument = z.infer<typeof ExtractedDocument>;
export type UdyamDraft = z.infer<typeof UdyamDraft>;
export type SchemeMatch = z.infer<typeof SchemeMatch>;
export type LoanReadiness = z.infer<typeof LoanReadiness>;
export type CatalogueItem = z.infer<typeof CatalogueItem>;
export type AgentStep = z.infer<typeof AgentStep>;
export type Report = z.infer<typeof Report>;
