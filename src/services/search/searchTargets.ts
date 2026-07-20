import type { Observer } from 'astronomy-engine';
import { loadNamedStars } from '@/src/services/catalog/loadStars';
import { loadConstellations, loadConstellationInfos } from '@/src/services/catalog/loadConstellations';
import { getPlanetPositions } from '@/src/services/astro/planets';

export type TargetType = 'planet' | 'star' | 'constellation';

export interface SearchTarget {
  key: string;
  type: TargetType;
  name: string;
  subtitle?: string;
  /** J2000 (stars/constellations) or of-date (planets) equatorial position; planets must be refreshed via resolveTargetRaDec. */
  ra: number;
  dec: number;
}

/** Cap the star list so search stays snappy; brightest named stars first. */
const MAX_SEARCHABLE_STARS = 150;

/**
 * The full searchable universe for the current observer/date: planets and the
 * Moon (positions of date), the 88 constellations (label anchors), and the
 * brightest named stars.
 */
export function buildSearchTargets(observer: Observer, date: Date): SearchTarget[] {
  const planets: SearchTarget[] = getPlanetPositions(observer, date).map((planet) => ({
    key: `planet:${planet.id}`,
    type: 'planet',
    name: planet.name,
    subtitle: 'Sistema solar',
    ra: planet.ra,
    dec: planet.dec,
  }));

  const labelById = new Map(loadConstellations().map((c) => [c.id, c.label]));
  const constellations: SearchTarget[] = loadConstellationInfos().map((info) => {
    const label = labelById.get(info.id) ?? [0, 0];
    return {
      key: `constellation:${info.id}`,
      type: 'constellation',
      name: info.name,
      subtitle: `Constelación · ${info.latinName}`,
      ra: label[0],
      dec: label[1],
    };
  });

  const stars: SearchTarget[] = loadNamedStars()
    .slice(0, MAX_SEARCHABLE_STARS)
    .map((star) => ({
      key: `star:${star.id}`,
      type: 'star',
      name: star.name!,
      subtitle: `Estrella · mag ${star.magnitude.toFixed(1)}`,
      ra: star.ra,
      dec: star.dec,
    }));

  return [...planets, ...constellations, ...stars];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Accent-insensitive prefix/substring match, best (shortest, earliest) matches first. */
export function filterTargets(targets: SearchTarget[], query: string): SearchTarget[] {
  const normalized = normalizeText(query.trim());
  if (!normalized) return targets.slice(0, 25);
  return targets
    .map((target) => ({ target, index: normalizeText(target.name).indexOf(normalized) }))
    .filter(({ index }) => index !== -1)
    .sort((a, b) => a.index - b.index || a.target.name.length - b.target.name.length)
    .slice(0, 25)
    .map(({ target }) => target);
}
