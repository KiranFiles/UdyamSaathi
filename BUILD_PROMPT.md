# Build Prompt – Udyam Saathi
(Paste into GitHub Copilot Agent mode, Cursor, Claude Code, Bolt or v0. Keep README.md in the repo root so the tool can refer to it.)

---

You are a senior full-stack engineer. Build a hackathon-ready web app called **Udyam Saathi** for the 11th TiE Global Summit 2026 Hackathon. Follow README.md in the repo root as the source of truth.

## Product
"An AI agent that makes MP's small businesses paperwork-ready, loan-ready and ONDC-ready. Owners just talk and take photos."
Users are micro-business owners in Indore/Madhya Pradesh, often Hindi-speaking with low digital literacy.

## Stack (do not change)
- React 18 + TypeScript + Vite, Tailwind CSS, shadcn/ui, React Router, Zustand, i18next (hi + en), Zod, Recharts, jsPDF
- Backend: Vercel Serverless Functions in `/api` (TypeScript, @vercel/node)
- LLM: provider wrapper in `/api/_lib/llm.ts` supporting Azure OpenAI and Gemini via `LLM_PROVIDER` env var; vision-capable; JSON output only
- Hosting: Vercel. No server database; session data in Zustand + localStorage.

## Build these, in order
1. **Scaffold**: folder structure exactly as in README; Tailwind; routes `/`, `/capture`, `/processing`, `/results`, `/dashboard`; Hindi/English toggle; `vercel.json` with SPA rewrite and 30s function duration.
2. **Shared Zod schemas** in `src/lib/schemas.ts`: BusinessProfile, ExtractedDocument, UdyamDraft, SchemeMatch, LoanReadiness, CatalogueItem, AgentStep. Import the same schemas in `/api`.
3. **Capture page**: `VoiceRecorder` using Web Speech API (`hi-IN` / `en-IN`) with live transcript and a typed-text fallback; `PhotoUploader` with 4 labelled slots (Aadhaar, PAN, Bill book, Product) using camera on mobile; compress images to ≤1 MB client-side; consent checkbox before upload.
4. **API agents** (each validates input/output with Zod, retries once on invalid JSON, falls back to `src/data/demo/cached_responses.json` when `DEMO_MODE=true`):
   - `/api/intake` – transcript → BusinessProfile (handle Hinglish amounts like "40-50 hazaar")
   - `/api/extract-document` – image → ExtractedDocument; mask Aadhaar to last 4 digits on the server before returning
   - `/api/fill-form` – profile + documents → UdyamDraft with field source, completion % and missing fields
   - `/api/match-schemes` – run `schemeRules.ts` against `schemes.sample.json` FIRST; the LLM only writes reasons/next steps for matched schemes and must not add new schemes
   - `/api/loan-readiness` – deterministic score in `scoring.ts` (factors: Udyam, GST, bank account, years in business, turnover consistency from bill book, documents complete); the LLM only explains and gives 3 tips
   - `/api/catalogue` – product images → CatalogueItem[] (English + Hindi names)
5. **Orchestrator** `src/agents/orchestrator.ts`: deterministic pipeline Intake → Documents (parallel) → Form-filler → [Schemes, Loan, Catalogue, Compliance] in parallel. Update `AgentStep` status and short reasoning lines in the store as each step runs.
6. **Processing page**: `AgentTimeline` – animated cards per agent (pending/running/done/error) with expandable reasoning. This is the main demo "wow" screen; make it polished.
7. **Results page** tabs: Paperwork (UdyamDraftCard with confirm toggles + missing-doc warnings), Schemes (SchemeCard with "why you qualify"), Loan (LoanScoreGauge + factors + tips), ONDC Catalogue (CatalogueGrid, editable), Reminders (ComplianceCalendar from `compliance.json`).
8. **Summary**: export everything as a clean PDF; "Share on WhatsApp" using a `wa.me` text link; "Delete my data" button.
9. **District Dashboard** (optional): anonymized mock aggregates by MP district with Recharts.
10. **Demo mode**: a "Load Sunita demo" button on Home that preloads the sample transcript and images from `src/data/demo/` so the live demo always works.

## Rules
- Never expose API keys in the frontend; all LLM calls go through `/api`.
- Never invent document values; return null + warning when unreadable.
- All outputs are drafts for owner review; never auto-submit to any government portal.
- Scheme data is SAMPLE ONLY with placeholder names; add a visible "Verify with official sources" note.
- Mobile-first, large tap targets, icons with Hindi labels, accessible (aria labels, contrast).
- Strict TypeScript, no `any`. Small, readable components.
- Write `.env.example` and keep README setup steps accurate.

## Deliverables
- Fully working app runnable with `npx vercel dev`
- Deployable to Vercel with zero config beyond env vars
- Demo data + cached fallback responses
- Short `DEMO_SCRIPT.md` with the 3-minute Sunita walkthrough

Start with step 1, then continue step by step. After each step, list the files you changed and how to test it.
