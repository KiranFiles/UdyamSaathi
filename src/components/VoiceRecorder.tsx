import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCopy } from "../i18n";
import { useSession } from "../store/useSession";
interface SpeechResult {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface Recognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResult) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognizer;
  webkitSpeechRecognition?: new () => Recognizer;
};
export function VoiceRecorder() {
  const l = useCopy(),
    { i18n } = useTranslation(),
    { transcript, update, demo } = useSession();
  const rec = useRef<Recognizer | null>(null),
    [active, setActive] = useState(false),
    [failed, setFailed] = useState(false);
  const browser: SpeechWindow = window,
    Engine = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
  useEffect(
    () => () => {
      if (rec.current) {
        rec.current.onresult = null;
        rec.current.onend = null;
        rec.current.onerror = null;
        rec.current.abort();
      }
    },
    [i18n.language],
  );
  useEffect(() => {
    setActive(false);
  }, [i18n.language]);
  function toggle() {
    if (active) {
      rec.current?.stop();
      return;
    }
    if (!Engine) return;
    const r = new Engine();
    rec.current = r;
    r.lang = i18n.language === "hi" ? "hi-IN" : "en-IN";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) =>
      update({
        transcript: [
          transcript,
          ...Array.from(e.results, (line) => line[0].transcript),
        ]
          .join(" ")
          .trim()
          .slice(0, 8000),
      });
    r.onerror = () => {
      setFailed(true);
      setActive(false);
    };
    r.onend = () => setActive(false);
    try {
      r.start();
      setActive(true);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }
  return (
    <section className="panel">
      <p className="eyebrow">01 / {l("YOUR STORY", "आपकी कहानी")}</p>
      <h2>
        {l("Tell us about your business", "अपने व्यवसाय के बारे में बताएँ")}
      </h2>
      <p>
        {l(
          "Mention your city, products, monthly sales and how long you have been working.",
          "अपना शहर, उत्पाद, मासिक बिक्री और काम के साल बताएँ।",
        )}
      </p>
      <button
        type="button"
        className="btn secondary"
        disabled={!Engine || demo}
        aria-pressed={active}
        onClick={toggle}
      >
        {active ? <Square size={18} /> : <Mic size={18} />}{" "}
        {active ? l("Stop recording", "रिकॉर्डिंग रोकें") : l("Speak", "बोलें")}
      </button>
      <small>
        {!Engine || failed
          ? l(
              "Voice unavailable. Type below instead.",
              "आवाज़ उपलब्ध नहीं। नीचे लिखें।",
            )
          : l(
              "Your browser’s speech service may process audio when you tap Speak.",
              "बोलें दबाने पर ब्राउज़र की वाणी सेवा ऑडियो संसाधित कर सकती है।",
            )}
      </small>
      <label>
        {l("Transcript or typed description", "बोला हुआ या लिखा विवरण")}
        <textarea
          rows={4}
          maxLength={8000}
          value={transcript}
          readOnly={demo || active}
          onChange={(e) => update({ transcript: e.target.value })}
        />
      </label>
    </section>
  );
}
