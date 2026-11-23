import type { LoanReadiness } from "../lib/schemas";
import { useCopy } from "../i18n";
export function LoanScoreGauge({ loan }: { loan: LoanReadiness }) {
  const l = useCopy();
  return (
    <section className="panel">
      <p className="eyebrow">
        {l(
          "EVIDENCE SCORE · NOT A CREDIT DECISION",
          "प्रमाण अंक · ऋण का निर्णय नहीं",
        )}
      </p>
      <div
        className="score"
        style={{
          background: `conic-gradient(#28765a ${loan.score}%, #e6e7db 0)`,
        }}
      >
        <div>
          <strong>{loan.score}</strong>/100
        </div>
      </div>
      <h2>{l("Loan readiness", "ऋण की तैयारी")}</h2>
      <p>{loan.explanation}</p>
      {loan.factors.map((f) => (
        <div className="review-row" key={f.name}>
          <span>
            {f.name}
            <small>{f.note}</small>
          </span>
          <b>+{f.impact}</b>
        </div>
      ))}
      <h3>{l("Three next steps", "तीन अगले कदम")}</h3>
      <ol>
        {loan.improvementTips.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>
    </section>
  );
}
