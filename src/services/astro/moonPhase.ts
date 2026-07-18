import {
  MoonPhase as astroMoonPhase,
  SearchMoonQuarter,
  NextMoonQuarter,
  type FlexibleDateTime,
  type MoonQuarter,
} from 'astronomy-engine';
import { degToRad } from '@/src/utils/math';

export type MoonPhaseName =
  | 'new'
  | 'waxingCrescent'
  | 'firstQuarter'
  | 'waxingGibbous'
  | 'full'
  | 'waningGibbous'
  | 'lastQuarter'
  | 'waningCrescent';

const PHASE_NAMES: MoonPhaseName[] = [
  'new',
  'waxingCrescent',
  'firstQuarter',
  'waxingGibbous',
  'full',
  'waningGibbous',
  'lastQuarter',
  'waningCrescent',
];

/** Classifies a phase angle (0-360, moon-sun ecliptic longitude difference) into one of 8 named phases. */
export function classifyMoonPhase(phaseAngleDeg: number): MoonPhaseName {
  const normalized = ((phaseAngleDeg % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return PHASE_NAMES[index];
}

/** Fraction of the Moon's visible disk that is illuminated, in [0, 1]. */
export function illuminatedFraction(phaseAngleDeg: number): number {
  return (1 - Math.cos(degToRad(phaseAngleDeg))) / 2;
}

export interface MoonPhaseInfo {
  phaseAngle: number;
  name: MoonPhaseName;
  illumination: number;
}

export function getMoonPhase(date: FlexibleDateTime): MoonPhaseInfo {
  const phaseAngle = astroMoonPhase(date);
  return {
    phaseAngle,
    name: classifyMoonPhase(phaseAngle),
    illumination: illuminatedFraction(phaseAngle),
  };
}

const QUARTER_NAMES: MoonPhaseName[] = ['new', 'firstQuarter', 'full', 'lastQuarter'];

export interface UpcomingMoonQuarter {
  name: MoonPhaseName;
  date: Date;
}

/** Returns the next `count` quarter phases (new/first quarter/full/last quarter) after `date`. */
export function getUpcomingMoonQuarters(date: FlexibleDateTime, count = 4): UpcomingMoonQuarter[] {
  const quarters: UpcomingMoonQuarter[] = [];
  let quarter: MoonQuarter = SearchMoonQuarter(date);
  for (let i = 0; i < count; i++) {
    quarters.push({ name: QUARTER_NAMES[quarter.quarter], date: quarter.time.date });
    quarter = NextMoonQuarter(quarter);
  }
  return quarters;
}
