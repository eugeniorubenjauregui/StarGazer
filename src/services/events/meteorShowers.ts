/**
 * The major annual meteor showers. Activity windows and peaks are fixed
 * calendar dates (they drift by at most a day between years), so this works
 * fully offline. ZHR = zenithal hourly rate under ideal conditions.
 */
export interface MeteorShower {
  id: string;
  name: string;
  /** IAU code of the constellation the radiant sits in. */
  radiantConstellation: string;
  /** [month (1-12), day] */
  activityStart: [number, number];
  activityEnd: [number, number];
  peak: [number, number];
  zhr: number;
}

export const METEOR_SHOWERS: MeteorShower[] = [
  { id: 'quadrantids', name: 'Cuadrántidas', radiantConstellation: 'Boo', activityStart: [12, 28], activityEnd: [1, 12], peak: [1, 3], zhr: 110 },
  { id: 'lyrids', name: 'Líridas', radiantConstellation: 'Lyr', activityStart: [4, 14], activityEnd: [4, 30], peak: [4, 22], zhr: 18 },
  { id: 'eta-aquariids', name: 'Eta Acuáridas', radiantConstellation: 'Aqr', activityStart: [4, 19], activityEnd: [5, 28], peak: [5, 6], zhr: 50 },
  { id: 'delta-aquariids', name: 'Delta Acuáridas del Sur', radiantConstellation: 'Aqr', activityStart: [7, 12], activityEnd: [8, 23], peak: [7, 30], zhr: 25 },
  { id: 'perseids', name: 'Perseidas', radiantConstellation: 'Per', activityStart: [7, 17], activityEnd: [8, 24], peak: [8, 12], zhr: 100 },
  { id: 'orionids', name: 'Oriónidas', radiantConstellation: 'Ori', activityStart: [10, 2], activityEnd: [11, 7], peak: [10, 21], zhr: 20 },
  { id: 'leonids', name: 'Leónidas', radiantConstellation: 'Leo', activityStart: [11, 6], activityEnd: [11, 30], peak: [11, 17], zhr: 15 },
  { id: 'geminids', name: 'Gemínidas', radiantConstellation: 'Gem', activityStart: [12, 4], activityEnd: [12, 17], peak: [12, 14], zhr: 150 },
  { id: 'ursids', name: 'Úrsidas', radiantConstellation: 'UMi', activityStart: [12, 17], activityEnd: [12, 26], peak: [12, 22], zhr: 10 },
];

export interface UpcomingShower {
  shower: MeteorShower;
  nextPeak: Date;
  isActiveNow: boolean;
  daysToPeak: number;
}

function dateFor(year: number, [month, day]: [number, number]): Date {
  return new Date(year, month - 1, day);
}

/** Whether `date` falls inside the shower's activity window, handling windows that wrap the new year. */
export function isShowerActive(shower: MeteorShower, date: Date): boolean {
  const year = date.getFullYear();
  const start = dateFor(year, shower.activityStart);
  const end = dateFor(year, shower.activityEnd);
  if (start <= end) {
    return date >= start && date <= endOfDay(end);
  }
  // Window wraps the new year (e.g. Quadrantids: Dec 28 - Jan 12).
  return date >= start || date <= endOfDay(end);
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

/** Every shower with its next peak from `date`, soonest first. */
export function getUpcomingShowers(date: Date): UpcomingShower[] {
  return METEOR_SHOWERS.map((shower) => {
    let nextPeak = dateFor(date.getFullYear(), shower.peak);
    if (endOfDay(nextPeak) < date) nextPeak = dateFor(date.getFullYear() + 1, shower.peak);
    return {
      shower,
      nextPeak,
      isActiveNow: isShowerActive(shower, date),
      daysToPeak: Math.max(0, Math.round((nextPeak.getTime() - date.getTime()) / 86_400_000)),
    };
  }).sort((a, b) => a.nextPeak.getTime() - b.nextPeak.getTime());
}
