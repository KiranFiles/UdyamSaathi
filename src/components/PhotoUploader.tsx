import { useState } from "react";
import { Camera, ShieldCheck } from "lucide-react";
import { type Slot, useSession } from "../store/useSession";
import { useCopy } from "../i18n";
export async function compress(file: File): Promise<string> {
  if (!file.type.startsWith("image/") || file.size > 25 * 1024 * 1024)
    throw Error("image");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    let scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    for (let i = 0; i < 7; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw Error("canvas");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const jpeg = canvas.toDataURL("image/jpeg", 0.82);
      if (
        jpeg.startsWith("data:image/jpeg;") &&
        atob(jpeg.split(",")[1]).length <= 1_000_000
      )
        return jpeg;
      scale *= 0.75;
    }
    throw Error("size");
  } finally {
    URL.revokeObjectURL(url);
  }
}
const slots: [Slot, string, string][] = [
  ["aadhaar", "Masked Aadhaar", "मास्क किया आधार"],
  ["pan", "PAN", "पैन"],
  ["bill_book", "Bill book", "बिल बुक"],
  ["product", "Product", "उत्पाद"],
];
export function PhotoUploader({
  onWorking,
}: {
  onWorking: (value: boolean) => void;
}) {
  const { photos, update, demo } = useSession(),
    l = useCopy(),
    [error, setError] = useState(false),
    [working, setWorking] = useState(false);
  async function pick(slot: Slot, file: File) {
    setWorking(true);
    onWorking(true);
    setError(false);
    try {
      const image = await compress(file);
      update({ photos: { ...useSession.getState().photos, [slot]: image } });
    } catch {
      setError(true);
    } finally {
      setWorking(false);
      onWorking(false);
    }
  }
  return (
    <section className="panel">
      <p className="eyebrow">02 / {l("SUPPORTING PHOTOS", "सहायक तस्वीरें")}</p>
      <h2>{l("Add what you have", "जो उपलब्ध है, जोड़ें")}</h2>
      <p>
        {l(
          "Optional. Cover the first eight Aadhaar digits before taking a photo.",
          "वैकल्पिक। फ़ोटो से पहले आधार के पहले आठ अंक ढकें।",
        )}
      </p>
      <div className="photos">
        {slots.map(([slot, en, hi]) => (
          <div key={slot}>
            <label className="tile">
              {photos[slot] ? (
                slot === "aadhaar" || slot === "pan" ? (
                  <>
                    <ShieldCheck />
                    <small>
                      {l("Attached · preview hidden", "जुड़ा · चित्र छिपा है")}
                    </small>
                  </>
                ) : (
                  <img src={photos[slot]} alt="" />
                )
              ) : (
                <Camera />
              )}
              {l(en, hi)}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                disabled={demo || working}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void pick(slot, f);
                }}
              />
            </label>
            {photos[slot] && !demo && (
              <button
                className="text-btn"
                onClick={() => {
                  const next = { ...photos };
                  delete next[slot];
                  update({ photos: next });
                }}
              >
                {l("Remove", "हटाएँ")}
              </button>
            )}
          </div>
        ))}
      </div>
      {working && (
        <p role="status">{l("Compressing photo…", "फ़ोटो छोटी हो रही है…")}</p>
      )}
      {error && (
        <p role="alert">
          {l(
            "Choose a readable image under 25 MB; JPEG or PNG works best.",
            "25 MB से छोटी, पढ़ने योग्य JPEG या PNG चुनें।",
          )}
        </p>
      )}
    </section>
  );
}
