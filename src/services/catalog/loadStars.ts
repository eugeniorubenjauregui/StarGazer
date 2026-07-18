import type { Star } from './types';
import starsData from '@/src/data/stars.json';

const STARS = starsData as Star[];
const STARS_BY_ID = new Map(STARS.map((star) => [star.id, star]));

export function loadStars(): Star[] {
  return STARS;
}

export function getStarById(id: string): Star | undefined {
  return STARS_BY_ID.get(id);
}
