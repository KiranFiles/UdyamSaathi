import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { allowed } from "./rateLimit";
import { scrub } from "./mask";
import { ProviderFailure } from "./llm";
export const demoFlag = z.boolean().default(false);
export const photo = z
  .string()
  .max(1_333_364)
  .regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/)
  .refine(
    (s) =>
      Buffer.byteLength(s.slice(s.indexOf(",") + 1), "base64") <= 1_000_000,
    "Image too large",
  );
type Request = Pick<VercelRequest, "method" | "socket"> & { body: unknown };
type Response = Pick<VercelResponse, "setHeader"> & {
  status: (n: number) => { json: (data: unknown) => unknown };
};
export function endpoint<I, O>(
  input: z.ZodType<I, z.ZodTypeDef, unknown>,
  output: z.ZodType<O>,
  run: (i: I) => Promise<O>,
) {
  return async (req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "POST required" });
    }
    if (!allowed(req.socket.remoteAddress ?? "local"))
      return res.status(429).json({ error: "Try again in one minute" });
    const parsed = input.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid request" });
    try {
      return res.status(200).json(output.parse(scrub(await run(parsed.data))));
    } catch (err) {
      const code = err instanceof ProviderFailure ? err.message :
        err instanceof Error && err.name === "TimeoutError" ? "provider_timeout" : "draft_unavailable";
      return res
        .status(502)
        .json({
          code,
          error:
            "Draft unavailable. Check provider settings or use the Sunita demo with DEMO_MODE=true.",
        });
    }
  };
}
export function isFixture(demo: boolean) {
  return demo && process.env.DEMO_MODE === "true";
}
