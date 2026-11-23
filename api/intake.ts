import { z } from "zod";
import { BusinessProfile, language } from "../src/lib/schemas";
import cache from "../src/data/demo/cached_responses.json";
import { demoFlag, endpoint, isFixture } from "./_lib/http";
import { ask } from "./_lib/llm";
import { prompts } from "./_lib/prompts";
import { maskText } from "./_lib/mask";
export default endpoint(
  z.object({
    transcript: z.string().trim().min(1).max(8000),
    language,
    demo: demoFlag,
  }),
  BusinessProfile,
  async (i) => {
    const result = isFixture(i.demo)
      ? BusinessProfile.parse(cache.profile)
      : await ask(BusinessProfile, prompts.intake, {
          transcript: maskText(i.transcript),
          language: i.language,
        });
    return { ...result, language: i.language };
  },
);
