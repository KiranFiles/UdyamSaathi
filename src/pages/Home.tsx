import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mic,
  ArrowUpRight,
  BookOpen,
  FileCheck2,
  Landmark,
  Store,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useCopy } from "../i18n";
import { useSession } from "../store/useSession";
const outcomes = [
  [
    FileCheck2,
    "Paperwork",
    "कागज़ात",
    "A draft with sources and a checklist of missing evidence.",
    "स्रोत सहित फ़ॉर्म और छूटे प्रमाणों की सूची।",
  ],
  [
    Landmark,
    "Credit & schemes",
    "ऋण और योजनाएँ",
    "A readiness score and reasons for each sample match.",
    "तैयारी के अंक और नमूना योजना से मिलान की वजह।",
  ],
  [
    Store,
    "Digital catalogue",
    "डिजिटल कैटलॉग",
    "Product listings in Hindi and English, ready to review.",
    "समीक्षा के लिए हिन्दी और अंग्रेज़ी में उत्पाद सूची।",
  ],
] as const;
export default function Home() {
  const l = useCopy(),
    s = useSession(),
    nav = useNavigate(),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(false);
  async function start(demo: boolean) {
    if (s.busy) {
      nav("/processing");
      return;
    }
    if (
      (s.report || s.transcript) &&
      !window.confirm(
        l("Replace the current workspace?", "मौजूदा कार्यक्षेत्र बदलें?"),
      )
    )
      return;
    setLoading(true);
    setError(false);
    try {
      const data = demo
        ? await (await import("../data/demo/load")).loadDemo()
        : null;
      s.reset();
      if (data) s.update(data);
      nav("/capture");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <div className="kicker">
        <span>
          <MapPin size={14} /> {l("MADHYA PRADESH", "मध्य प्रदेश")}
        </span>
        <span>TiE GLOBAL SUMMIT · 2026</span>
      </div>
      <section className="hero">
        <div>
          <p className="eyebrow">
            <span className="seed" />{" "}
            {l("VOICE-FIRST BUSINESS DESK", "आवाज़ से चलने वाला सहायता केंद्र")}
          </p>
          <h1>
            {l("Your business,", "आपका व्यवसाय,")}
            <br />
            <em>{l("paperwork-ready.", "कागज़ात तैयार।")}</em>
          </h1>
          <p className="intro">
            {l(
              "Tell your story. Add a few photos. Get a paperwork draft, loan checklist and product catalogue in one place.",
              "अपने काम के बारे में बोलिए और कुछ फ़ोटो जोड़िए। फ़ॉर्म का ड्राफ़्ट, ऋण की तैयारी और उत्पाद कैटलॉग एक ही जगह पाइए।",
            )}
          </p>
          <div className="actions">
            <Button disabled={loading} onClick={() => void start(false)}>
              <Mic size={19} />
              {l("Speak to start", "बोलिए और शुरू कीजिए")}
            </Button>
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => void start(true)}
            >
              <BookOpen size={18} />
              {l("Load Sunita demo", "सुनीता का डेमो देखें")}
            </Button>
          </div>
          {error && (
            <p role="alert">
              {l(
                "Could not load sample images. Please retry.",
                "नमूना फ़ोटो लोड नहीं हुईं। पुनः प्रयास करें।",
              )}
            </p>
          )}
          <p className="safe">
            <ShieldCheck size={16} />
            {l(
              "Only drafts. You stay in control.",
              "सिर्फ़ ड्राफ़्ट। फ़ैसला हमेशा आपका।",
            )}
          </p>
        </div>
        <aside className="folio">
          <div className="folio-top">
            SAATHI / FIELD NOTES <span>№ 001</span>
          </div>
          <svg className="shop" viewBox="0 0 300 150" aria-hidden="true">
            <circle cx="213" cy="39" r="27" fill="#edd296" />
            <path d="M20 124h260" stroke="#93a18a" strokeDasharray="3 5" />
            <g stroke="#244f40" strokeWidth="3" strokeLinejoin="round">
              <path d="M71 62h156v64H71z" fill="#f8f1d8" />
              <path d="M65 38h166l11 28H54z" fill="#deaa73" />
              {[60, 92, 124, 156, 188, 220].map((x, i) => (
                <path
                  key={x}
                  d={`M${x + 5} 38h14l${i - 3} 28h-19z`}
                  fill="#f5e9be"
                  stroke="none"
                />
              ))}
              <path d="M58 66h181M82 82h51v30H82z" fill="#adc3a4" />
              <path d="M154 78h47v48h-47z" fill="#d4b586" />
              <path d="M161 90h32m-32 9h32m-32 9h32M55 127h187" fill="none" />
              <path
                d="M40 126v-17m0 6q-18-2-14-16 16 0 14 16m0-7q1-17 14-17 2 12-14 17"
                fill="#93ad83"
              />
            </g>
          </svg>
          <small>{l("FIELD STORY · INDORE", "उद्यम कहानी · इंदौर")}</small>
          <h2>{l("Sunita’s papad shop", "सुनीता का पापड़ व्यवसाय")}</h2>
          <p>
            {l(
              "A fictional home business. A guided, three-minute demo.",
              "एक काल्पनिक घरेलू व्यवसाय। तीन मिनट का डेमो।",
            )}
          </p>
        </aside>
      </section>
      {(s.report || s.busy || s.transcript) && (
        <Link
          className="resume"
          to={s.busy ? "/processing" : s.report ? "/results" : "/capture"}
        >
          {l("Continue current workspace", "मौजूदा कार्यक्षेत्र खोलें")}{" "}
          <ArrowUpRight size={18} />
        </Link>
      )}
      <div className="section-head">
        <p className="eyebrow">{l("WHAT YOU TAKE AWAY", "आपको क्या मिलेगा")}</p>
        <span>01 — 03</span>
      </div>
      <div className="cards">
        {outcomes.map(([Icon, en, hi, a, b], i) => (
          <article className="outcome" key={en}>
            <div className="split">
              <span className="stamp">
                <Icon size={22} />
              </span>
              <span className="folio-num">0{i + 1}</span>
            </div>
            <h2>{l(en, hi)}</h2>
            <p>{l(a, b)}</p>
          </article>
        ))}
      </div>
    </>
  );
}
