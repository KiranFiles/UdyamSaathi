import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ask } from "../api/_lib/llm";
import { scrub } from "../api/_lib/mask";
import { photo } from "../api/_lib/http";
import { matchRules } from "../src/lib/schemeRules";
import { computeScore } from "../src/lib/scoring";
import { BusinessProfile, ExtractedDocument } from "../src/lib/schemas";
import fixture from "../src/data/demo/cached_responses.json";
const profile = BusinessProfile.parse(fixture.profile),
  docs = ExtractedDocument.array().parse(fixture.documents);
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("rules and evidence", () => {
  it("gives Sunita two matches and 62 points, with no credit for unreadable bill books", () => {
    expect(matchRules(profile)).toHaveLength(2);
    expect(computeScore(profile, docs).score).toBe(62);
    const noBill = docs.map((d) =>
      d.type === "bill_book" ? { ...d, confidence: 0 } : d,
    );
    expect(computeScore(profile, noBill).score).toBe(36);
  });
  it("does not turn unknown sales into zero for eligibility", () =>
    expect(matchRules({ ...profile, monthlyTurnoverINR: null })).toEqual([]));
  it("masks identity numbers in nested evidence, warnings, and keys before return", () => {
    expect(
      scrub({ "111122223333": ["नंबर: ११११-२२२२-३३३३", "ABCDE1234F"] }),
    ).toEqual({ "XXXX-XXXX-3333": ["नंबर: XXXX-XXXX-3333", "XXXXX****F"] });
  });
  it("enforces the decoded byte limit, including base64 padding", () => {
    const image = (bytes: number) =>
      "data:image/jpeg;base64," + Buffer.alloc(bytes).toString("base64");
    expect(photo.safeParse(image(1_000_000)).success).toBe(true);
    expect(photo.safeParse(image(1_000_001)).success).toBe(false);
  });
});
describe("provider JSON contract", () => {
  it("identifies quota rejection without exposing provider response text", async () => {
    vi.stubEnv("LLM_PROVIDER", "gemini");
    vi.stubEnv("GEMINI_API_KEY", "fixture");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("private provider details", {status:429})));
    await expect(ask(z.string(), "extract", {})).rejects.toThrow(/^provider_quota$/);
  });
  it.each(["azure", "gemini"])(
    "retries malformed JSON once for %s and accepts only the validated result",
    async (provider) => {
      vi.stubEnv("LLM_PROVIDER", provider);
      vi.stubEnv("GEMINI_API_KEY", "fixture");
      vi.stubEnv("AZURE_OPENAI_ENDPOINT", "https://example.invalid");
      vi.stubEnv("AZURE_OPENAI_DEPLOYMENT", "fixture");
      vi.stubEnv("AZURE_OPENAI_API_KEY", "fixture");
      const response = (text: string) =>
        Response.json(
          provider === "gemini"
            ? { candidates: [{ content: { parts: [{ text }] } }] }
            : { choices: [{ message: { content: text } }] },
        );
      const stub = vi
        .fn()
        .mockResolvedValueOnce(response("bad"))
        .mockResolvedValueOnce(response('{"result":{"ok":true}}'));
      vi.stubGlobal("fetch", stub);
      expect(await ask(z.object({ ok: z.literal(true) }), "test", {})).toEqual({
        ok: true,
      });
      expect(stub).toHaveBeenCalledTimes(2);
    },
  );
});
