import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { globalRules } from "./prompts";
export class ProviderFailure extends Error {}
const gemini = z.object({
  candidates: z
    .array(
      z.object({
        content: z.object({
          parts: z.array(z.object({ text: z.string().optional() })),
        }),
      }),
    )
    .min(1),
});
const azure = z.object({
  choices: z
    .array(z.object({ message: z.object({ content: z.string() }) }))
    .min(1),
});
function env(name: string) {
  const v = process.env[name];
  if (!v) throw Error("Provider not configured");
  return v;
}
async function generate(
  system: string,
  input: unknown,
  images: string[],
  signal: AbortSignal,
) {
  const text = JSON.stringify(input);
  let url: string, headers: Record<string, string>, body: unknown;
  if (process.env.LLM_PROVIDER === "gemini") {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_MODEL || "gemini-2.5-flash")}:generateContent`;
    headers = { "x-goog-api-key": env("GEMINI_API_KEY") };
    body = {
      systemInstruction: { parts: [{ text: system }] },
      contents: [
        {
          role: "user",
          parts: [
            { text },
            ...images.map((img) => ({
              inlineData: {
                mimeType: img.slice(5, img.indexOf(";")),
                data: img.split(",")[1],
              },
            })),
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0,
      },
    };
  } else {
    url = `${env("AZURE_OPENAI_ENDPOINT").replace(/\/$/, "")}/openai/deployments/${encodeURIComponent(env("AZURE_OPENAI_DEPLOYMENT"))}/chat/completions?api-version=2024-10-21`;
    headers = { "api-key": env("AZURE_OPENAI_API_KEY") };
    body = {
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text },
            ...images.map((url) => ({ type: "image_url", image_url: { url } })),
          ],
        },
      ],
      temperature: 0,
    };
  }
  const response = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw new ProviderFailure(
    response.status === 429 ? "provider_quota" :
    response.status === 401 || response.status === 403 ? "provider_access" :
    response.status === 400 || response.status === 404 ? "provider_request" :
    "provider_unavailable"
  );
  const payload: unknown = await response.json();
  return process.env.LLM_PROVIDER === "gemini"
    ? gemini
        .parse(payload)
        .candidates[0].content.parts.map((p) => p.text ?? "")
        .join("")
    : azure.parse(payload).choices[0].message.content;
}
export async function ask<T>(
  schema: z.ZodType<T>,
  instruction: string,
  input: unknown,
  images: string[] = [],
): Promise<T> {
  const wrapper = z.object({ result: schema }),
    signal = AbortSignal.timeout(24500);
  const system = `${globalRules}\n${instruction}\n${JSON.stringify(zodToJsonSchema(wrapper))}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await generate(
      system +
        (attempt
          ? "\nPrevious JSON was invalid. Correct the schema and return JSON only."
          : ""),
      input,
      images,
      signal,
    );
    try {
      return wrapper.parse(JSON.parse(raw)).result as T;
    } catch (err) {
      if (attempt) throw new ProviderFailure("invalid_output");
    }
  }
  throw Error("Invalid JSON");
}
