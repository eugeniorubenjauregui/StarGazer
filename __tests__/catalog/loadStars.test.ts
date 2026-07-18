import { loadStars, getStarById } from '@/src/services/catalog/loadStars';
import {
  loadConstellations,
  loadConstellationInfos,
  getConstellationInfo,
  resolveConstellations,
} from '@/src/services/catalog/loadConstellations';

describe('loadStars', () => {
  it('loads a non-empty, well-formed star catalog', () => {
    const stars = loadStars();
    expect(stars.length).toBeGreaterThan(0);
    for (const star of stars) {
      expect(star.ra).toBeGreaterThanOrEqual(0);
      expect(star.ra).toBeLessThan(24);
      expect(star.dec).toBeGreaterThanOrEqual(-90);
      expect(star.dec).toBeLessThanOrEqual(90);
      expect(star.magnitude).toBeLessThan(6);
    }
  });

  it('finds a known star by id', () => {
    expect(getStarById('sirius')?.name).toBe('Sirius');
  });

  it('returns undefined for an unknown id', () => {
    expect(getStarById('not-a-real-star')).toBeUndefined();
  });
});

describe('loadConstellations', () => {
  it('every line segment references stars that exist in the catalog', () => {
    for (const constellation of loadConstellations()) {
      for (const [a, b] of constellation.segments) {
        expect(getStarById(a)).toBeDefined();
        expect(getStarById(b)).toBeDefined();
      }
    }
  });

  it('every constellation has matching info with valid main stars', () => {
    const constellationIds = new Set(loadConstellations().map((c) => c.id));
    for (const info of loadConstellationInfos()) {
      expect(constellationIds.has(info.id)).toBe(true);
      expect(info.mainStars.length).toBeGreaterThan(0);
      for (const starId of info.mainStars) {
        expect(getStarById(starId)).toBeDefined();
      }
    }
  });

  it('looks up constellation info by id', () => {
    expect(getConstellationInfo('orion')?.name).toBe('Orión');
  });

  it('resolves segments to full star records with matching ids', () => {
    const resolved = resolveConstellations();
    const orion = resolved.find((c) => c.id === 'orion');
    expect(orion).toBeDefined();
    expect(orion!.segments.length).toBeGreaterThan(0);
    for (const { a, b } of orion!.segments) {
      expect(a.id).toEqual(expect.any(String));
      expect(b.id).toEqual(expect.any(String));
    }
  });
});
