import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { VoiceRecorder } from "../components/VoiceRecorder";
import { PhotoUploader } from "../components/PhotoUploader";
import { useSession } from "../store/useSession";
import { useCopy } from "../i18n";
import { startPipeline } from "../agents/orchestrator";
export default function Capture() {
  const l = useCopy(),
    navigate = useNavigate(),
    s = useSession(),
    [working, setWorking] = useState(false);
  if (s.busy) return <Navigate to="/processing" replace />;
  return (
    <>
      <p className="eyebrow">
        {l("STEP 1 OF 3 · CAPTURE", "चरण 1 / 3 · जानकारी")}
      </p>
      <h1>
        {s.demo
          ? l("Sunita’s sample workspace", "सुनीता का नमूना कार्यक्षेत्र")
          : l("Your business story", "आपके व्यवसाय की कहानी")}
      </h1>
      <VoiceRecorder />
      <PhotoUploader onWorking={setWorking} />
      <label className="check panel">
        <input
          type="checkbox"
          checked={s.consent}
          onChange={(e) => s.update({ consent: e.target.checked })}
        />
        {l(
          "I agree to process my description and photos via the server and selected AI provider to prepare drafts. The reviewed workspace stays in this browser.",
          "ड्राफ़्ट बनाने के लिए मैं विवरण और फ़ोटो सर्वर और चुनी हुई AI सेवा पर संसाधित करने की अनुमति देता/देती हूँ। कार्यक्षेत्र इस ब्राउज़र में रहेगा।",
        )}
      </label>
      <button
        className="btn primary"
        disabled={!s.transcript.trim() || !s.consent || working}
        onClick={() => {
          void startPipeline();
          navigate("/processing");
        }}
      >
        {l("Prepare my drafts", "मेरे ड्राफ़्ट बनाएँ")}
        <ArrowRight size={18} />
      </button>
    </>
  );
}
