import { loadEnv, type Plugin } from "vite";
const paths = new Set([
  "intake",
  "extract-document",
  "fill-form",
  "match-schemes",
  "loan-readiness",
  "catalogue",
]);
// Run the same Vercel handlers on localhost for an unlinked, keyless rehearsal.
export function localApi(): Plugin {
  return {
    name: "saathi-local-api",
    apply: "serve",
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, "");
      for (const key of [
        "DEMO_MODE",
        "LLM_PROVIDER",
        "AZURE_OPENAI_ENDPOINT",
        "AZURE_OPENAI_DEPLOYMENT",
        "AZURE_OPENAI_API_KEY",
        "GEMINI_MODEL",
        "GEMINI_API_KEY",
      ]) {
        if (!process.env[key] && env[key]) process.env[key] = env[key];
      }
      server.middlewares.use("/api", async (req, res) => {
        const route = req.url?.split("?")[0].slice(1) ?? "";
        if (!paths.has(route)) {
          res.statusCode = 404;
          res.end();
          return;
        }
        try {
          const chunks: Buffer[] = [];
          let bytes = 0;
          for await (const chunk of req) {
            const b = Buffer.from(chunk);
            bytes += b.length;
            if (bytes > 4_200_000) {
              res.statusCode = 413;
              res.end();
              return;
            }
            chunks.push(b);
          }
          let body: unknown;
          try {
            body = JSON.parse(Buffer.concat(chunks).toString() || "null");
          } catch {
            res.statusCode = 400;
            res.end();
            return;
          }
          const mod = await server.ssrLoadModule(`/api/${route}.ts`);
          await mod.default(
            { method: req.method, body, socket: req.socket },
            {
              setHeader: res.setHeader.bind(res),
              status: (n: number) => ({
                json: (data: unknown) => {
                  res.statusCode = n;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify(data));
                },
              }),
            },
          );
        } catch {
          res.statusCode = 500;
          res.end('{"error":"Local function failed"}');
        }
      });
    },
  };
}
