/**
 * Tonight's stargazing conditions from the free open-meteo API (no key, no
 * own backend). This is the app's only network call — everything else works
 * offline — so callers must treat failure as "no forecast available" and
 * simply hide the UI, never block on it.
 */
export interface TonightForecast {
  /** Average cloud cover 20:00-02:00 local, in percent [0, 100]. */
  averageCloudCover: number;
  rating: 'despejado' | 'parcial' | 'nublado';
}

export function classifyCloudCover(averageCloudCover: number): TonightForecast['rating'] {
  if (averageCloudCover < 30) return 'despejado';
  if (averageCloudCover < 70) return 'parcial';
  return 'nublado';
}

interface OpenMeteoResponse {
  hourly?: { time: string[]; cloud_cover: number[] };
}

/** Average cloud cover for tonight's observing window (20:00 today - 02:00 tomorrow, local time). */
export function averageForTonight(times: string[], cloudCover: number[], now: Date): number | null {
  const windowStart = new Date(now);
  windowStart.setHours(20, 0, 0, 0);
  const windowEnd = new Date(windowStart.getTime() + 6 * 3_600_000);

  const values: number[] = [];
  for (let i = 0; i < times.length; i++) {
    const t = new Date(times[i]);
    if (t >= windowStart && t <= windowEnd && Number.isFinite(cloudCover[i])) {
      values.push(cloudCover[i]);
    }
  }
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export async function fetchTonightForecast(
  latitude: number,
  longitude: number,
  now = new Date()
): Promise<TonightForecast | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(3)}&longitude=${longitude.toFixed(3)}` +
      `&hourly=cloud_cover&forecast_days=2&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = (await response.json()) as OpenMeteoResponse;
    if (!data.hourly) return null;

    const average = averageForTonight(data.hourly.time, data.hourly.cloud_cover, now);
    if (average === null) return null;
    return { averageCloudCover: average, rating: classifyCloudCover(average) };
  } catch {
    return null;
  }
}
