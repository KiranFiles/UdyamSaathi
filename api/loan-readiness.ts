import {
  BusinessProfile,
  ExtractedDocument,
  LoanReadiness,
} from "../src/lib/schemas";
import { computeScore } from "../src/lib/scoring";
import cache from "../src/data/demo/cached_responses.json";
import { z } from "zod";
import { demoFlag, endpoint, isFixture } from "./_lib/http";
import { ask } from "./_lib/llm";
import { prompts } from "./_lib/prompts";
export default endpoint(
  z.object({
    profile: BusinessProfile,
    documents: ExtractedDocument.array().max(8),
    demo: demoFlag,
  }),
  LoanReadiness,
  async ({ profile, documents, demo }) => {
    const decision = computeScore(profile, documents);
    const notes = isFixture(demo)
      ? cache.loan[profile.language]
      : await ask(
          LoanReadiness.pick({ explanation: true, improvementTips: true }),
          prompts.loan,
          { ...decision, language: profile.language },
        );
    return { ...decision, ...notes };
  },
);
