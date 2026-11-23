import { create } from "zustand";
import { Report, type AgentStep } from "../lib/schemas";
export type Slot = "aadhaar" | "pan" | "bill_book" | "product";
export type Photos = Partial<Record<Slot, string>>;
const key = "saathi-reviewed-session-v1";
function restore(): Report | null {
  const saved = localStorage.getItem(key);
  if (!saved) return null;
  try {
    return Report.parse(JSON.parse(saved));
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}
interface Session {
  transcript: string;
  photos: Photos;
  consent: boolean;
  demo: boolean;
  steps: AgentStep[];
  report: Report | null;
  busy: boolean;
  error: string;
  update: (change: Partial<Omit<Session, "update" | "save" | "reset">>) => void;
  save: (report: Report) => void;
  reset: () => void;
}
const initial = {
  transcript: "",
  photos: {},
  consent: false,
  demo: false,
  steps: [],
  busy: false,
  error: "",
  report: null,
};
export const useSession = create<Session>((set) => ({
  ...initial,
  report: restore(),
  update: set,
  save: (report) => {
    set({ report });
    try {
      localStorage.setItem(key, JSON.stringify(report));
    } catch {
      set({
        error:
          "Could not save to this browser / इस ब्राउज़र में सुरक्षित नहीं हुआ",
      });
    }
  },
  reset: () => {
    localStorage.removeItem(key);
    set(initial);
  },
}));
