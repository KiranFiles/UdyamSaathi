import { z } from "zod";
import { docType, ExtractedDocument, language } from "../src/lib/schemas";
import cache from "../src/data/demo/cached_responses.json";
import { demoFlag, endpoint, isFixture, photo } from "./_lib/http";
import { ask } from "./_lib/llm";
import { prompts } from "./_lib/prompts";
export default endpoint(
  z.object({
    imageBase64: photo,
    hintType: docType.optional(),
    language: language.default("hi"),
    demo: demoFlag,
  }),
  ExtractedDocument,
  async (i) => {
    const doc = isFixture(i.demo)
      ? ExtractedDocument.parse(
          cache.documents.find((d) => d.type === i.hintType),
        )
      : await ask(
          ExtractedDocument,
          prompts.document,
          { hint: i.hintType, language: i.language },
          [i.imageBase64],
        );
    if (doc.type === "aadhaar") {
      const suffix = doc.fields.aadhaarLast4?.match(/(\d{4})$/)?.[1];
      doc.fields = { aadhaarLast4: suffix ? `XXXX-XXXX-${suffix}` : null };
    }
    if (
      !Object.keys(doc.fields).length ||
      Object.values(doc.fields).some((v) => v === null)
    )
      doc.warnings.push(
        i.language === "hi"
          ? "अस्पष्ट जानकारी की पुष्टि करें।"
          : "Confirm unreadable information.",
      );
    return doc;
  },
);
