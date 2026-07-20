import { Body, Equator, Illumination, type FlexibleDateTime, type Observer } from 'astronomy-engine';

/** Solar-system bodies worth showing on the sky map: the naked-eye planets plus the Moon. */
const VISIBLE_BODIES: { body: Body; id: string; name: string }[] = [
  { body: Body.Moon, id: 'moon', name: 'Luna' },
  { body: Body.Mercury, id: 'mercury', name: 'Mercurio' },
  { body: Body.Venus, id: 'venus', name: 'Venus' },
  { body: Body.Mars, id: 'mars', name: 'Marte' },
  { body: Body.Jupiter, id: 'jupiter', name: 'Júpiter' },
  { body: Body.Saturn, id: 'saturn', name: 'Saturno' },
];

export interface PlanetPosition {
  id: string;
  name: string;
  /** Topocentric right ascension of date, in sidereal hours. */
  ra: number;
  /** Topocentric declination of date, in degrees. */
  dec: number;
  /** Apparent visual magnitude (lower is brighter). */
  magnitude: number;
}

/**
 * Topocentric RA/Dec + visual magnitude for the Moon and naked-eye planets.
 * Uses of-date coordinates (ofdate=true) since they feed straight into
 * Horizon() for the same date rather than a J2000 catalog.
 */
export function getPlanetPositions(observer: Observer, date: FlexibleDateTime): PlanetPosition[] {
  return VISIBLE_BODIES.map(({ body, id, name }) => {
    const equatorial = Equator(body, date, observer, true, true);
    const illumination = Illumination(body, date);
    return { id, name, ra: equatorial.ra, dec: equatorial.dec, magnitude: illumination.mag };
  });
}
