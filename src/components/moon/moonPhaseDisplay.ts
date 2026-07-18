import type { MoonPhaseName } from '@/src/services/astro/moonPhase';

export const MOON_PHASE_LABELS: Record<MoonPhaseName, string> = {
  new: 'Luna nueva',
  waxingCrescent: 'Creciente',
  firstQuarter: 'Cuarto creciente',
  waxingGibbous: 'Gibosa creciente',
  full: 'Luna llena',
  waningGibbous: 'Gibosa menguante',
  lastQuarter: 'Cuarto menguante',
  waningCrescent: 'Creciente menguante',
};

export const MOON_PHASE_EMOJI: Record<MoonPhaseName, string> = {
  new: '🌑',
  waxingCrescent: '🌒',
  firstQuarter: '🌓',
  waxingGibbous: '🌔',
  full: '🌕',
  waningGibbous: '🌖',
  lastQuarter: '🌗',
  waningCrescent: '🌘',
};
