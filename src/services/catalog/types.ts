export interface Star {
  id: string;
  /** Common name (Spanish where available). Most faint stars are unnamed. */
  name?: string;
  /** Right ascension, J2000, in sidereal hours [0, 24). */
  ra: number;
  /** Declination, J2000, in degrees [-90, 90]. */
  dec: number;
  /** Apparent visual magnitude (lower is brighter). */
  magnitude: number;
}

/** One [ra (hours), dec (degrees)] vertex of a constellation stick-figure line. */
export type LineVertex = [number, number];

export interface Constellation {
  id: string;
  /** Stick-figure polylines, each an ordered run of vertices to connect. */
  lines: LineVertex[][];
  /** Canonical label anchor [ra (hours), dec (degrees)]. */
  label: LineVertex;
}

export interface ConstellationInfo {
  id: string;
  name: string;
  latinName: string;
  mythology: string;
  /** Star ids (brightest named members) shown on the detail screen. */
  mainStars: string[];
}
