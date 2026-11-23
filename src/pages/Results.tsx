import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  FileText,
  Landmark,
  ChartColumn,
  ShoppingBag,
  CalendarDays,
  Download,
  Share2,
  Trash2,
} from "lucide-react";
import { useSession } from "../store/useSession";
import { useCopy } from "../i18n";
import { UdyamDraftCard } from "../components/UdyamDraftCard";
import { SchemeCard } from "../components/SchemeCard";
import { LoanScoreGauge } from "../components/LoanScoreGauge";
import { CatalogueGrid } from "../components/CatalogueGrid";
import { ComplianceCalendar } from "../components/ComplianceCalendar";
export default function Results() {
  const { report: r, reset, busy, error } = useSession(),
    l = useCopy(),
    nav = useNavigate(),
    [tab, select] = useState(0),
    [exportState, setExport] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl],
  );
  useEffect(() => setPdfUrl(""), [r]);
  if (busy) return <Navigate to="/processing" replace />;
  if (!r)
    return (
      <section className="panel">
        <h1>{l("No draft yet", "अभी ड्राफ़्ट नहीं है")}</h1>
        <Link className="btn primary" to="/">
          {l("Start here", "शुरू करें")}
        </Link>
      </section>
    );
  const tabs = [
    [FileText, l("Paperwork", "कागज़ात")],
    [Landmark, l("Schemes", "योजनाएँ")],
    [ChartColumn, l("Loan", "ऋण")],
    [ShoppingBag, l("ONDC catalogue", "ONDC कैटलॉग")],
    [CalendarDays, l("Reminders", "अनुस्मारक")],
  ] as const;
  const share = l(
    `Udyam Saathi · ${r.demo ? "Fictional sample · " : ""}Owner review draft: ${r.draft.completionPercent}% filled, ${r.schemes.length} sample scheme matches, ${r.catalogue.length} product drafts. Not an application.`,
    `उद्यम साथी · ${r.demo ? "काल्पनिक नमूना · " : ""}ड्राफ़्ट ${r.draft.completionPercent}% भरा, ${r.schemes.length} नमूना योजनाएँ, ${r.catalogue.length} उत्पाद। यह आवेदन नहीं है।`,
  );
  async function download() {
    if (!r) return;
    setExport("busy");
    try {
      const blob = await (await import("../lib/pdf")).createSummary(r);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Udyam-Saathi-Draft.pdf";
      document.body.append(a);
      a.click();
      a.remove();
      setExport("");
    } catch {
      setExport("error");
    }
  }
  return (
    <>
      <p className="eyebrow">
        {l("STEP 3 OF 3 · REVIEW DESK", "चरण 3 / 3 · समीक्षा डेस्क")}
      </p>
      <h1>
        {r.profile.businessName ?? l("Your workspace", "आपका कार्यक्षेत्र")}
      </h1>
      <p>
        {r.demo && l("Fictional sample · ", "काल्पनिक नमूना · ")}
        {l(
          "Draft only. Nothing is filed or published.",
          "सिर्फ़ ड्राफ़्ट। कुछ भी जमा या प्रकाशित नहीं हुआ है।",
        )}
      </p>
      {error && <p role="alert">{error}</p>}
      <div
        className="tabs"
        role="group"
        aria-label={l("Draft sections", "ड्राफ़्ट अनुभाग")}
      >
        {tabs.map(([Icon, title], i) => (
          <button key={i} aria-pressed={tab === i} onClick={() => select(i)}>
            <Icon size={17} />
            {title}
          </button>
        ))}
      </div>
      {tab === 0 ? (
        <UdyamDraftCard />
      ) : tab === 1 ? (
        <>
          <p className="notice">
            {l(
              "Sample only · Verify with official sources.",
              "केवल नमूना · आधिकारिक स्रोतों से पुष्टि करें।",
            )}
          </p>
          {r.schemes.length ? (
            r.schemes.map((s) => <SchemeCard key={s.id} scheme={s} />)
          ) : (
            <p>
              {l(
                "No sample rules matched.",
                "किसी नमूना योजना से मिलान नहीं हुआ।",
              )}
            </p>
          )}
        </>
      ) : tab === 2 ? (
        <LoanScoreGauge loan={r.loan} />
      ) : tab === 3 ? (
        <CatalogueGrid items={r.catalogue} />
      ) : (
        <ComplianceCalendar items={r.reminders} />
      )}
      <section className="panel">
        <h2>{l("Take your summary with you", "अपना सारांश साथ ले जाएँ")}</h2>
        <p>
          {l(
            "The PDF includes your draft details. WhatsApp shares counts only, not your identity documents.",
            "PDF में ड्राफ़्ट का विवरण है। WhatsApp पर केवल गिनती साझा होती है, पहचान दस्तावेज़ नहीं।",
          )}
        </p>
        <div className="actions">
          <button
            className="btn primary"
            disabled={exportState === "busy"}
            onClick={() => void download()}
          >
            <Download size={17} />
            {l("Download PDF", "PDF डाउनलोड")}
          </button>
          <a
            className="btn secondary"
            href={`https://wa.me/?text=${encodeURIComponent(share)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Share2 size={17} />
            {l("Share on WhatsApp", "WhatsApp पर साझा करें")}
          </a>
          <button
            className="btn danger"
            onClick={() => {
              if (
                window.confirm(
                  l(
                    "Delete this device’s Udyam Saathi workspace?",
                    "इस डिवाइस से उद्यम साथी का डेटा मिटाएँ?",
                  ),
                )
              ) {
                reset();
                nav("/");
              }
            }}
          >
            <Trash2 size={17} />
            {l("Delete my data", "मेरा डेटा मिटाएँ")}
          </button>
        </div>
        {pdfUrl && (
          <a
            className="text-btn underline"
            href={pdfUrl}
            download="Udyam-Saathi-Draft.pdf"
          >
            {l("PDF ready · Save a copy", "PDF तैयार · प्रति सहेजें")}
          </a>
        )}
        {exportState === "error" && (
          <p role="alert">
            {l(
              "PDF export failed. Please retry.",
              "PDF नहीं बना। पुनः प्रयास करें।",
            )}
          </p>
        )}
      </section>
    </>
  );
}
