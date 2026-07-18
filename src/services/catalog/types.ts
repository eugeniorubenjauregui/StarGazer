export interface Star {
  id: string;
  name: string;
  /** Right ascension, J2000, in sidereal hours [0, 24). */
  ra: number;
  /** Declination, J2000, in degrees [-90, 90]. */
  dec: number;
  /** Apparent visual magnitude (lower is brighter). */
  magnitude: number;
}

export interface Constellation {
  id: string;
  /** Pairs of star ids describing the stick-figure line segments to draw. */
  segments: [string, string][];
}

export interface ConstellationInfo {
  id: string;
  name: string;
  latinName: string;
  mythology: string;
  mainStars: string[];
}
