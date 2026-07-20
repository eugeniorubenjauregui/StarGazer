import { usePreferencesStore } from '@/src/store/usePreferencesStore';
import { basePalette, nightPalette, type Palette } from './palettes';

/**
 * Static default palette, for module-level styling that can't react to the
 * night-mode toggle. Components should prefer `useColors()`.
 */
export const colors = basePalette;

/** Reactive palette: switches to the red night-vision palette when night mode is on. */
export function useColors(): Palette {
  const nightMode = usePreferencesStore((state) => state.nightMode);
  return nightMode ? nightPalette : basePalette;
}
