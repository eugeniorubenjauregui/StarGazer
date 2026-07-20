import type { Constellation, ConstellationInfo } from './types';
import constellationsData from '@/src/data/constellations.json';
import constellationsInfoData from '@/src/data/constellations-info.json';

const CONSTELLATIONS = constellationsData as Constellation[];
const CONSTELLATIONS_INFO = constellationsInfoData as ConstellationInfo[];
const INFO_BY_ID = new Map(CONSTELLATIONS_INFO.map((info) => [info.id, info]));

export function loadConstellations(): Constellation[] {
  return CONSTELLATIONS;
}

export function loadConstellationInfos(): ConstellationInfo[] {
  return CONSTELLATIONS_INFO;
}

export function getConstellationInfo(id: string): ConstellationInfo | undefined {
  return INFO_BY_ID.get(id);
}
