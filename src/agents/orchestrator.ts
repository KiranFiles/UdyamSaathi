import { z } from "zod";
import {
  AgentStep,
  BusinessProfile,
  CatalogueItem,
  ExtractedDocument,
  LoanReadiness,
  SchemeMatch,
  UdyamDraft,
} from "../lib/schemas";
import { useSession } from "../store/useSession";
import calendar from "../data/compliance.json";
import i18n from "../i18n";
export const agents = [
  ["Intake", "परिचय", "Read the owner’s description", "मालिक का विवरण पढ़ें"],
  [
    "Documents",
    "दस्तावेज़",
    "Read photos and mask identity numbers",
    "फ़ोटो पढ़ें और पहचान अंक छिपाएँ",
  ],
  [
    "Form filler",
    "फ़ॉर्म",
    "Map evidence to draft fields",
    "प्रमाण से ड्राफ़्ट भरें",
  ],
  [
    "Schemes",
    "योजनाएँ",
    "Check sample eligibility rules first",
    "पहले नमूना पात्रता नियम जाँचें",
  ],
  [
    "Loan readiness",
    "ऋण तैयारी",
    "Calculate six evidence factors",
    "छह प्रमाण कारकों की गणना करें",
  ],
  [
    "Catalogue",
    "कैटलॉग",
    "Prepare bilingual product listings",
    "दो भाषाओं में उत्पाद सूची बनाएँ",
  ],
  [
    "Compliance",
    "अनुस्मारक",
    "Select applicable reminder rules",
    "लागू अनुस्मारक चुनें",
  ],
] as const;
async function post<T>(
  path: string,
  input: unknown,
  schema: z.ZodType<T>,
  signal: AbortSignal,
) {
  const res = await fetch(`/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  if (!res.ok) {
    const slot = z.object({ hintType: z.string() }).safeParse(input);
    const label = slot.success ? `${path} (${slot.data.hintType})` : path;
    const messages = {
      provider_quota: ["AI quota or rate limit reached. Check provider quota before retrying.", "AI कोटा या अनुरोध सीमा पूरी हुई। कोटा जाँचें।"],
      provider_access: ["AI provider denied access. Check the key and permissions.", "AI सेवा ने अनुमति नहीं दी। कुंजी और अनुमति जाँचें।"],
      provider_request: ["AI provider rejected the request. Check model and image support.", "AI सेवा ने अनुरोध अस्वीकार किया। मॉडल और चित्र समर्थन जाँचें।"],
      provider_unavailable: ["AI provider unavailable. Try again later.", "AI सेवा उपलब्ध नहीं है। बाद में प्रयास करें।"],
      invalid_output: ["AI returned an invalid draft twice. Retry with a clearer input.", "AI का ड्राफ़्ट दो बार अमान्य रहा। स्पष्ट जानकारी के साथ प्रयास करें।"],
      provider_timeout: ["AI request timed out. Retry with one photo.", "AI अनुरोध का समय समाप्त हुआ। एक फ़ोटो से प्रयास करें।"],
    } as const;
    const raw = await res.text();
    let code: unknown;
    try { code = JSON.parse(raw)?.code; } catch { /* Non-JSON gateway response: show the HTTP status. */ }
    const reason = Object.entries(messages).find(([key]) => key === code)?.[1];
    throw Error(`${label}: HTTP ${res.status}${reason ? ` — ${reason[i18n.language === "hi" ? 1 : 0]}` : ""}`);
  }
  return schema.parse(await res.json());
}
export async function startPipeline() {
  const { consent, transcript, photos, demo, busy, update, save } =
    useSession.getState();
  if (busy || !consent || !transcript.trim()) return;
  const hi = i18n.language === "hi",
    language = hi ? "hi" : "en",
    controller = new AbortController();
  update({
    busy: true,
    error: "",
    report: null,
    steps: agents.map(([agent]) => ({
      agent,
      status: "pending",
      reasoning: [],
    })),
  });
  function mark(i: number, s: Partial<AgentStep>) {
    update({
      steps: useSession
        .getState()
        .steps.map((step, k) => (k === i ? { ...step, ...s } : step)),
    });
  }
  async function step<T>(
    i: number,
    work: () => Promise<T>,
    summary: (v: T) => string,
  ) {
    const begin = performance.now(),
      line = agents[i][hi ? 3 : 2];
    mark(i, { status: "running", reasoning: [line] });
    try {
      const result = await work();
      if (demo)
        await new Promise((resolve) => setTimeout(resolve, 450 + i * 90));
      if (controller.signal.aborted) throw Error("Stopped");
      mark(i, {
        status: "done",
        reasoning: [line, summary(result)],
        durationMs: Math.round(performance.now() - begin),
      });
      return result;
    } catch (err) {
      mark(i, {
        status: "error",
        reasoning: [line, hi ? "चरण पूरा नहीं हुआ।" : "Step did not complete."],
      });
      throw err;
    }
  }
  const call = <T>(path: string, body: object, schema: z.ZodType<T>) =>
    post(path, { ...body, demo }, schema, controller.signal);
  try {
    const profile = await step(
      0,
      () => call("intake", { transcript, language }, BusinessProfile),
      (p) => p.activity ?? (hi ? "गतिविधि अज्ञात" : "Activity not supplied"),
    );
    const documents = await step(
      1,
      () =>
        Promise.all(
          Object.entries(photos).map(([hintType, imageBase64]) =>
            call(
              "extract-document",
              { hintType, imageBase64, language },
              ExtractedDocument,
            ),
          ),
        ),
      (a) => `${a.length} ${hi ? "फ़ोटो जाँची गईं" : "photos checked"}`,
    );
    const draft = await step(
      2,
      () => call("fill-form", { profile, documents }, UdyamDraft),
      (d) => `${d.completionPercent}% ${hi ? "भरा" : "complete"}`,
    );
    const jobs = [
      step(
        3,
        () => call("match-schemes", { profile }, SchemeMatch.array()),
        (a) => `${a.length} ${hi ? "नमूना मिलान" : "sample matches"}`,
      ),
      step(
        4,
        () => call("loan-readiness", { profile, documents }, LoanReadiness),
        (r) => `${r.score}/100`,
      ),
      step(
        5,
        () =>
          call(
            "catalogue",
            { profile, images: photos.product ? [photos.product] : [] },
            CatalogueItem.array(),
          ),
        (a) => `${a.length} ${hi ? "उत्पाद" : "products"}`,
      ),
      step(
        6,
        async () =>
          calendar
            .filter((c) => c.rule === "all" || profile.hasGST === true)
            .map((c) => c[language]),
        (a) => `${a.length} ${hi ? "अनुस्मारक" : "reminders"}`,
      ),
    ] as const;
    try {
      const [schemes, loan, catalogue, reminders] = await Promise.all(jobs);
      save({
        profile,
        documents,
        draft,
        schemes,
        loan,
        catalogue,
        reminders,
        demo,
      });
    } catch (err) {
      controller.abort();
      await Promise.allSettled(jobs);
      throw err;
    }
    update({ photos: {}, transcript: "", consent: false });
  } catch (err) {
    controller.abort();
    update({
      error: `${hi ? "ड्राफ़्ट पूरा नहीं हुआ।" : "Draft incomplete."} ${err instanceof Error ? err.message.slice(0, 230) : "API"}`,
    });
  } finally {
    update({ busy: false });
  }
}
