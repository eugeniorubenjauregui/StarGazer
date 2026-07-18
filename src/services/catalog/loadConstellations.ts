import type { Constellation, ConstellationInfo, Star } from './types';
import constellationsData from '@/src/data/constellations.json';
import constellationsInfoData from '@/src/data/constellations-info.json';
import { getStarById } from './loadStars';

const CONSTELLATIONS = constellationsData as Constellation[];
const CONSTELLATIONS_INFO = constellationsInfoData as ConstellationInfo[];
const INFO_BY_ID = new Map(CONSTELLATIONS_INFO.map((info) => [info.id, info]));

export interface ResolvedSegment {
  a: Star;
  b: Star;
}

export interface ResolvedConstellation {
  id: string;
  segments: ResolvedSegment[];
}

export function loadConstellations(): Constellation[] {
  return CONSTELLATIONS;
}

export function loadConstellationInfos(): ConstellationInfo[] {
  return CONSTELLATIONS_INFO;
}

export function getConstellationInfo(id: string): ConstellationInfo | undefined {
  return INFO_BY_ID.get(id);
}

/** Resolves star ids in each constellation's line segments to full Star records, skipping any that are missing. */
export function resolveConstellations(): ResolvedConstellation[] {
  return CONSTELLATIONS.map((constellation) => ({
    id: constellation.id,
    segments: constellation.segments
      .map(([aId, bId]) => {
        const a = getStarById(aId);
        const b = getStarById(bId);
        return a && b ? { a, b } : null;
      })
      .filter((segment): segment is ResolvedSegment => segment !== null),
  }));
}
