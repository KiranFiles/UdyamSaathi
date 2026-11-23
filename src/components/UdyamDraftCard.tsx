import { useCopy } from "../i18n";
import { useSession } from "../store/useSession";
export function UdyamDraftCard() {
  const { report, save } = useSession(),
    l = useCopy();
  if (!report) return null;
  const { draft, documents } = report;
  return (
    <section className="panel">
      <div className="split">
        <h2>{l("Udyam paperwork draft", "उद्यम फ़ॉर्म ड्राफ़्ट")}</h2>
        <b className="pill">{draft.completionPercent}%</b>
      </div>
      {draft.missingFields.length > 0 && (
        <p className="notice">
          {l("Still needed", "अभी चाहिए")}: {draft.missingFields.join(", ")}
        </p>
      )}
      <p>
        {l(
          "Tick each field after checking its source.",
          "स्रोत से मिलान करने के बाद हर फ़ील्ड पर निशान लगाएँ।",
        )}
      </p>
      {draft.fields.map((f, i) => (
        <label className="review-row" key={i}>
          <input
            type="checkbox"
            disabled={f.value === null}
            checked={f.confirmed}
            onChange={(e) =>
              save({
                ...report,
                draft: {
                  ...draft,
                  fields: draft.fields.map((v, k) =>
                    k === i ? { ...v, confirmed: e.target.checked } : v,
                  ),
                },
              })
            }
          />
          <span>
            {f.label}
            <small>{f.source}</small>
          </span>
          <strong>{f.value ?? "—"}</strong>
        </label>
      ))}
      {documents.map((d, i) => (
        <div key={i}>
          {d.warnings.map((w, k) => (
            <p className="notice" key={k}>
              {d.type}: {w}
            </p>
          ))}
        </div>
      ))}
    </section>
  );
}
