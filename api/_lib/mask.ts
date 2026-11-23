const digits = (s: string) =>
  s.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x966));
export function maskText(value: string) {
  return digits(value)
    .replace(/(?<!\d)\d{4}[\s-]*\d{4}[\s-]*(\d{4})(?!\d)/g, "XXXX-XXXX-$1")
    .replace(/\b[A-Z]{5}\d{4}([A-Z])\b/gi, "XXXXX****$1");
}
export function scrub(obj: unknown): unknown {
  if (typeof obj === "string") return maskText(obj);
  if (typeof obj === "number" && /^\d{12}$/.test(String(obj)))
    return maskText(String(obj));
  if (Array.isArray(obj)) return obj.map(scrub);
  if (obj && typeof obj === "object")
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [maskText(k), scrub(v)]),
    );
  return obj;
}
