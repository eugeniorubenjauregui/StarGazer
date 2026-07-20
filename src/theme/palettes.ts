export interface Palette {
  skyBackground: string;
  surface: string;
  surfaceBorder: string;
  star: string;
  constellationLine: string;
  constellationLabel: string;
  horizonHint: string;
  cardinal: string;
  planet: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
}

export const basePalette: Palette = {
  skyBackground: '#02030F',
  surface: '#0D1330',
  surfaceBorder: '#232C55',
  star: '#FFFFFF',
  constellationLine: '#4C6B9A',
  constellationLabel: '#9FB3D6',
  horizonHint: '#2A2F45',
  cardinal: '#E8B84B',
  planet: '#F5D9A0',
  accent: '#7C9EFF',
  textPrimary: '#F2F5FF',
  textSecondary: '#9FB3D6',
  success: '#6BD98F',
};

/**
 * Night-vision palette: everything in reds so the screen doesn't destroy the
 * eye's dark adaptation — red light barely affects the rod cells the eye uses
 * for faint-object vision, which is why astronomy gear uses red lamps.
 */
export const nightPalette: Palette = {
  skyBackground: '#0A0000',
  surface: '#1C0505',
  surfaceBorder: '#4A1010',
  star: '#FF6B5A',
  constellationLine: '#8A2A20',
  constellationLabel: '#C05548',
  horizonHint: '#3A0E0A',
  cardinal: '#E85D45',
  planet: '#FF8A70',
  accent: '#D9503C',
  textPrimary: '#FFB0A0',
  textSecondary: '#C05548',
  success: '#E85D45',
};
