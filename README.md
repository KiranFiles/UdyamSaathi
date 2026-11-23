# उद्यम साथी · Udyam Saathi

A Hindi-first business assistance desk for the 11th TiE Global Summit 2026 Hackathon. An owner speaks or types, attaches photos, and reviews a paperwork draft, sample scheme matches, a loan-readiness checklist, an editable bilingual catalogue and reminders. **Nothing is submitted to a government portal, lender or ONDC.**

## Run the demo

The app opens in English by default. Use the language toggle to switch to Hindi; the browser remembers your choice.

Use Node.js 24 and npm (the same Node major used on Vercel). From the project root, in PowerShell:

```powershell
npm ci
Copy-Item .env.example .env.local
npx vercel dev
```

On first use Vercel may prompt you to sign in and link a project; choose the project root and the Vite preset. Open the local URL printed by the CLI. For a rehearsal **without a Vercel account**, use `npm run dev` instead: the local-only Vite adapter runs the same six POST handlers. `npm run preview` serves the built frontend only, not functions.

Leave `DEMO_MODE=true` and choose **सुनीता का डेमो देखें / Load Sunita demo**. No cloud model or microphone is required. The fictional capture is locked so edited inputs cannot be mistaken for Sunita’s evidence. Check consent to start. See [the three-minute script](./DEMO_SCRIPT.md).

## Live usage and deployment

Choose **Speak to start** for your own inputs. Use synthetic or redacted photos for hackathon testing. Microphone and mobile camera support depend on the browser; use HTTPS or localhost. Typing and the system file picker are alternatives.

| Server environment variable | Value |
|---|---|
| `DEMO_MODE` | `true` enables cached, keyless Sunita runs; `false` uses the provider. Live owner runs never substitute Sunita’s data. |
| `LLM_PROVIDER` | `azure` or `gemini` |
| `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT` | Azure resource endpoint, server key and a vision deployment supporting JSON mode and chat completions API `2024-10-21` |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Server key and an available vision-capable JSON model; example `gemini-2.5-flash` |

Do not prefix secrets with `VITE_`. Restart the dev server after changing env vars. For Vercel, import the project using the Vite preset, set the environment variables for the desired environments, and deploy. The build command, SPA deep links and 30-second functions are configured in the repository. No database or storage service is needed.

## How the agents make decisions

If `extract-document` fails, intake already succeeded. The error identifies the photo slot and, when available, the provider reason. For a quota error, check the provider's usage limits before retrying; for a timeout or invalid draft, try the bill-book sample alone. No provider response or identity-photo contents are shown in diagnostics.

- The model interprets speech and images; Zod validates both sides of each API. Invalid model JSON gets one retry within a bounded provider deadline. The explicit Sunita rehearsal uses cached model outputs **before** contacting a provider, so a missing key or provider outage does not affect it. An unsuccessful live extraction fails visibly rather than returning a different owner's details.
- The form filler maps evidence directly to ten review fields; completion counts **populated**, not owner-confirmed, fields. Missing values remain null. It is a preparation checklist, not a replica of the official form.
- Scheme rules compare the stated sector, gender where applicable, and estimated annual sales (monthly × 12). Only matched IDs can receive model explanations. **Sample only — verify with official sources.**
- The illustrative readiness score awards up to 15 points for Udyam, 17 for GST, 15 for a bank account, 15 for years in business, 20 for consistent sales and 18 for usable Aadhaar/PAN/bill-book evidence. Consistency requires three positive monthly totals with the smallest at least 80% of the largest. Missing evidence earns no points. The model cannot set the score. This is not underwriting or a prediction of approval.
- Reminder rules are review routines, not statutory deadlines. District charts use fixed fictional aggregates unrelated to owner sessions.

## Data handling

Photos are compressed to at most 1,000,000 bytes, held in memory and sent only after consent. For live extraction they pass through the application server to the chosen cloud provider; provider retention depends on your provider settings. The browser’s speech recognition service may separately process audio when the owner starts recording. Identity-photo previews are hidden. Server output masks Aadhaar and PAN; raw captures and transcripts are not written to localStorage. Reloading during capture or processing loses the unfinished run.

The completed report, including owner and business details, persists **unencrypted in this browser**. On a shared device, use **Delete my data** before leaving. Downloaded PDFs and messages already shared are separate copies. WhatsApp receives counts, not identity documents. No server database or application-level document logging is used. Per-instance rate limiting is a hackathon safeguard, not distributed abuse protection.

## Changes and acceptance checks by build step

Run `npm test` for the automated rule, masking, size-boundary and provider-contract tests. `npm run build` strictly type-checks frontend and API code and builds production assets. Then use this checklist:

| Step | Files added or changed (relative to root) | How to test |
|---|---|---|
| 1 · Scaffold | `package*.json`, `tsconfig.json`, `vite.config.ts`, `dev/localApi.ts`, `index.html`, `public/favicon.svg`, `tailwind.config.cjs`, `postcss.config.cjs`, `components.json`, `vercel.json`, `.env.example`, `.gitignore`, `src/{main.tsx,App.tsx,styles.css}`, `src/i18n/*`, `src/components/{LanguageToggle.tsx,ui/button.tsx}`, `src/lib/utils.ts` | Switch Hindi/English; open `/`, `/capture`, `/processing`, `/results`, `/dashboard` directly. Empty sessions should guide you back to capture or Home. |
| 2 · Contracts | `src/lib/schemas.ts` | `npm run build`; an empty POST body to `/api/intake` must return 400. |
| 3 · Capture | `src/pages/Capture.tsx`, `src/components/{VoiceRecorder,PhotoUploader}.tsx`, `src/store/useSession.ts` | Start a fresh capture. Type or dictate; attach and remove an image. No POST is sent before consent. The automated size test checks 1,000,000 vs 1,000,001 decoded bytes. |
| 4 · Agents | All six `api/*.ts`; `api/_lib/{llm,http,mask,prompts,rateLimit}.ts`; `src/lib/{schemeRules,scoring}.ts`; `src/data/schemes.sample.json`; `tests/agents.test.ts` | `npm test`; in live mode with a configured provider, describe “40–50 hazaar”, try an unreadable image and check for nulls/warnings. GET on an agent must return 405. |
| 5 · Pipeline | `src/agents/orchestrator.ts` | Inspect Network during a run: intake, photo requests, draft, then independent scheme/loan/catalogue calls. Compliance runs locally. |
| 6 · Timeline | `src/pages/Processing.tsx`, `src/components/AgentTimeline.tsx` | Expand cards during the demo; inspect details/durations. With a failed live provider, expect a stopped step and a return to capture, not fake results. |
| 7 · Review | `src/pages/Results.tsx`; `src/components/{UdyamDraftCard,SchemeCard,LoanScoreGauge,CatalogueGrid,ComplianceCalendar}.tsx`; `src/data/compliance.json` | Visit all five sections; confirm an owner field and edit a price. Reload: both edits persist. Check the sample-scheme warning and missing bank proof. |
| 8 · Summary | `src/lib/pdf.ts`, `src/pages/Results.tsx`, `src/store/useSession.ts` | Download the PDF; inspect masked evidence and Devanagari. Inspect the WhatsApp link, delete the session, and revisit `/results`. |
| 9 · District view | `src/pages/DistrictDashboard.tsx` | Open `/dashboard` on mobile; compare the chart and accessible table. Neither should change when you delete a report. |
| 10 · Demo | `src/pages/Home.tsx`, `src/data/demo/{load.ts,sunita_transcript_hi.txt,aadhaar_sample_masked.png,billbook_page.jpg,product_papad.jpg,cached_responses.json}`, `DEMO_SCRIPT.md`, `README.md` | Rehearse keyless: 90% draft, missing bank proof, 2 sample matches, 62/100 score, 3 products. |
