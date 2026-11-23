import { CalendarDays } from "lucide-react";
import type { Report } from "../lib/schemas";
export function ComplianceCalendar({ items }: { items: Report["reminders"] }) {
  return (
    <div className="cards">
      {items.map((r) => (
        <article className="panel" key={r.title}>
          <CalendarDays />
          <p className="eyebrow">{r.when}</p>
          <h2>{r.title}</h2>
          <p>{r.note}</p>
        </article>
      ))}
    </div>
  );
}
