import {
  AudioLines,
  ScanLine,
  FilePenLine,
  Landmark,
  ChartNoAxesColumnIncreasing,
  ShoppingBag,
  CalendarClock,
  Check,
  LoaderCircle,
  Clock,
  TriangleAlert,
} from "lucide-react";
import { agents } from "../agents/orchestrator";
import { useSession } from "../store/useSession";
import { useCopy } from "../i18n";
const icons = [
  AudioLines,
  ScanLine,
  FilePenLine,
  Landmark,
  ChartNoAxesColumnIncreasing,
  ShoppingBag,
  CalendarClock,
];
export function AgentTimeline() {
  const steps = useSession((s) => s.steps),
    l = useCopy(),
    done = steps.filter((s) => s.status === "done").length;
  return (
    <>
      <div className="meter">
        <span style={{ width: `${(100 * done) / 7}%` }} />
      </div>
      <p role="status">
        {done} / 7 {l("steps complete", "चरण पूरे")}
      </p>
      <div className="timeline">
        {steps.map((s, i) => {
          const Icon = icons[i],
            flag = {
              pending: [Clock, l("Queued", "प्रतीक्षा")],
              running: [LoaderCircle, l("Working", "कार्य जारी")],
              done: [Check, l("Done", "पूरा")],
              error: [TriangleAlert, l("Stopped", "रुका")],
            } as const;
          const [Flag, label] = flag[s.status];
          return (
            <details className={`agent ${s.status}`} key={s.agent}>
              <summary>
                <span className="stamp">
                  <Icon size={20} />
                </span>
                <b>{l(agents[i][0], agents[i][1])}</b>
                <span className="badge">
                  <Flag size={14} />
                  {label}
                </span>
              </summary>
              <div>
                {s.reasoning.length ? (
                  s.reasoning.map((r, k) => <p key={k}>{r}</p>)
                ) : (
                  <p>
                    {l(
                      "Waiting for prior steps.",
                      "पिछले चरणों की प्रतीक्षा है।",
                    )}
                  </p>
                )}
                {s.durationMs !== undefined && (
                  <small>{(s.durationMs / 1000).toFixed(1)} s</small>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}
