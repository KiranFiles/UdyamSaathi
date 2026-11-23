import transcript from "./sunita_transcript_hi.txt?raw";
import aadhaar from "./aadhaar_sample_masked.png";
import bill from "./billbook_page.jpg";
import product from "./product_papad.jpg";
async function dataURL(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw Error("Sample image unavailable");
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(Error("Invalid image"));
    reader.onerror = () => reject(Error("Sample image unreadable"));
    reader.readAsDataURL(blob);
  });
}
export async function loadDemo() {
  const [a, b, p] = await Promise.all([aadhaar, bill, product].map(dataURL));
  return {
    transcript,
    photos: { aadhaar: a, bill_book: b, product: p },
    demo: true,
    consent: false,
  };
}
