import { z } from "zod";
import { BusinessProfile, SchemeMatch } from "../src/lib/schemas";
import { matchRules } from "../src/lib/schemeRules";
import { demoFlag, endpoint, isFixture } from "./_lib/http";
import { ask } from "./_lib/llm";
import { prompts } from "./_lib/prompts";
export default endpoint(
  z.object({ profile: BusinessProfile, demo: demoFlag }),
  SchemeMatch.array(),
  async ({ profile, demo }) => {
    const matches = matchRules(profile);
    if (!matches.length || isFixture(demo)) return matches;
    const explanations = SchemeMatch.pick({
      id: true,
      reasons: true,
      nextSteps: true,
    })
      .array()
      .refine(
        (list) =>
          list.length === matches.length &&
          matches.every((m) => list.some((e) => e.id === m.id)),
      );
    const notes = await ask(explanations, prompts.schemes, {
      profile,
      matches,
    });
    return matches.map((m) => ({ ...m, ...notes.find((e) => e.id === m.id) }));
  },
);
