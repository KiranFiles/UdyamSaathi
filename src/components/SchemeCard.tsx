import { Landmark } from "lucide-react";
import type { SchemeMatch } from "../lib/schemas";
import { useCopy } from "../i18n";
export function SchemeCard({ scheme: s }: { scheme: SchemeMatch }) {
  const l = useCopy();
  return (
    <article className="panel">
      <Landmark />
      <h2>{s.name}</h2>
      <h3>
        {l(
          "Why you qualify under the sample rules",
          "नमूना नियमों से मिलान क्यों हुआ",
        )}
      </h3>
      <ul>
        {s.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <h3>{l("Next steps", "अगले कदम")}</h3>
      <ul>
        {s.nextSteps.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p>{s.documentsNeeded.join(" · ")}</p>
    </article>
  );
}
