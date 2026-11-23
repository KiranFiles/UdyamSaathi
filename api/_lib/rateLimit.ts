const hits = new Map<string, { until: number; count: number }>();
export function allowed(key: string) {
  const now = Date.now();
  for (const [k, v] of hits) if (v.until <= now) hits.delete(k);
  const bucket = hits.get(key) ?? { until: now + 60000, count: 0 };
  hits.set(key, bucket);
  return ++bucket.count <= 90;
}
