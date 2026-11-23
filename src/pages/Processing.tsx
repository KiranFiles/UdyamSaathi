import { Link, Navigate } from "react-router-dom";
import { AgentTimeline } from "../components/AgentTimeline";
import { useSession } from "../store/useSession";
import { useCopy } from "../i18n";
export default function Processing() {
  const { steps, report, error, busy } = useSession(),
    l = useCopy();
  if (!steps.length)
    return <Navigate replace to={report ? "/results" : "/capture"} />;
  return (
    <div className="narrow">
      <p className="eyebrow">
        {l("STEP 2 OF 3 · AGENT DESK", "चरण 2 / 3 · एजेंट डेस्क")}
      </p>
      <h1>{l("Your agents at work", "आपके एजेंट काम पर हैं")}</h1>
      <p>
        {l(
          "Open a card to see what was checked.",
          "किस चीज़ की जाँच हुई, देखने के लिए कार्ड खोलें।",
        )}
      </p>
      <AgentTimeline />
      {error && <p role="alert">{error}</p>}
      {!busy && (
        <Link className="btn primary" to={report ? "/results" : "/capture"}>
          {report
            ? l("Review my drafts →", "ड्राफ़्ट देखें →")
            : l("Back to capture", "जानकारी पर लौटें")}
        </Link>
      )}
    </div>
  );
}
