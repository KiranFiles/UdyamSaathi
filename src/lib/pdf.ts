import { jsPDF } from "jspdf";
import type { Report } from "./schemas";
// Browser text shaping keeps Devanagari intact without downloading a font or uploading the report.
export async function createSummary(r: Report) {
  await document.fonts.ready;
  const pdf = new jsPDF(),
    canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw Error("Canvas unavailable");
  const g = ctx,
    hi = r.profile.language === "hi",
    l = (en: string, h: string) => (hi ? h : en);
  let y = 0,
    page = 0;
  function newPage() {
    page++;
    g.fillStyle = "#fffdf6";
    g.fillRect(0, 0, 1240, 1754);
    g.fillStyle = "#174d40";
    g.fillRect(0, 0, 1240, 136);
    g.font = "bold 48px sans-serif";
    g.fillStyle = "white";
    g.fillText("Udyam Saathi  ·  उद्यम साथी", 66, 85);
    y = 205;
  }
  function flush() {
    g.fillStyle = "#44574c";
    g.font = "22px sans-serif";
    g.fillText(`Draft / ड्राफ़्ट   ·   ${page}`, 68, 1692);
    if (page > 1) pdf.addPage();
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      210,
      297,
      undefined,
      "FAST",
    );
  }
  function row(text: string, heading = false) {
    if (heading) y += 16;
    const font = heading ? "bold 36px sans-serif" : "29px sans-serif";
    function line(s: string) {
      if (y > 1605) {
        flush();
        newPage();
      }
      g.font = font;
      g.fillStyle = heading ? "#175942" : "#253a32";
      g.fillText(s, 68, y);
      y += heading ? 58 : 47;
    }
    g.font = font;
    let current = "";
    for (const word of text.replace(/\s+/g, " ").split(" ")) {
      if (current && g.measureText(current + " " + word).width > 1090) {
        line(current);
        current = "";
      }
      for (const char of word) {
        if (g.measureText(current + char).width > 1090) {
          line(current);
          current = "";
        }
        current += char;
      }
      current += " ";
    }
    if (current.trim()) line(current.trim());
  }
  newPage();
  row(
    l(
      "Owner review only · Nothing submitted",
      "केवल समीक्षा हेतु · आवेदन जमा नहीं हुआ",
    ),
    true,
  );
  if (r.demo) row(l("Fictional Sunita sample", "सुनीता का काल्पनिक नमूना"));
  row(l("Business profile", "व्यवसाय परिचय"), true);
  Object.entries(r.profile).forEach(([k, v]) => row(`${k}: ${v ?? "—"}`));
  row(l("Document evidence", "दस्तावेज़ प्रमाण"), true);
  r.documents.forEach((d) => {
    row(`${d.type} · ${Math.round(d.confidence * 100)}%`);
    Object.entries(d.fields).forEach(([k, v]) => row(`${k}: ${v ?? "—"}`));
    d.warnings.forEach((w) => row(w));
  });
  row(`Udyam · ${r.draft.completionPercent}%`, true);
  r.draft.fields.forEach((f) =>
    row(
      `${f.label}: ${f.value ?? "—"} · ${f.source} · ${f.confirmed ? l("Confirmed", "पुष्ट") : l("Not confirmed", "अपुष्ट")}`,
    ),
  );
  row(`${l("Missing", "कमी")}: ${r.draft.missingFields.join(", ") || "—"}`);
  row(
    l(
      "Sample schemes · Verify with official sources",
      "नमूना योजनाएँ · आधिकारिक स्रोतों से पुष्टि करें",
    ),
    true,
  );
  r.schemes.forEach((s) =>
    [
      s.name,
      ...s.reasons,
      ...s.nextSteps,
      s.documentsNeeded.join(", "),
    ].forEach((v) => row(v)),
  );
  row(
    `${l("Loan readiness", "ऋण तैयारी")} · ${r.loan.score}/100 (${r.loan.band})`,
    true,
  );
  row(r.loan.explanation);
  r.loan.factors.forEach((f) => row(`${f.name}: ${f.note}`));
  r.loan.improvementTips.forEach((v) => row(v));
  row(l("ONDC catalogue draft", "ONDC कैटलॉग ड्राफ़्ट"), true);
  r.catalogue.forEach((c) =>
    row(
      `${c.name} / ${c.nameHi} · ${c.category} · ${c.description} · ₹${c.suggestedPriceINR ?? "—"} / ${c.unit ?? "—"}`,
    ),
  );
  row(l("Reminders", "अनुस्मारक"), true);
  r.reminders.forEach((v) => row(`${v.when} · ${v.title}: ${v.note}`));
  flush();
  return pdf.output("blob");
}
