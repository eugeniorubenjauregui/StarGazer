import { loadStars, getStarById, loadNamedStars } from '@/src/services/catalog/loadStars';
import {
  loadConstellations,
  loadConstellationInfos,
  getConstellationInfo,
} from '@/src/services/catalog/loadConstellations';

describe('loadStars', () => {
  it('loads the full naked-eye catalog', () => {
    const stars = loadStars();
    expect(stars.length).toBeGreaterThan(4000);
    for (const star of stars) {
      expect(star.ra).toBeGreaterThanOrEqual(0);
      expect(star.ra).toBeLessThan(24);
      expect(star.dec).toBeGreaterThanOrEqual(-90);
      expect(star.dec).toBeLessThanOrEqual(90);
      expect(star.magnitude).toBeLessThan(6);
    }
  });

  it('finds Sirius (HIP 32349) with its Spanish name', () => {
    expect(getStarById('32349')?.name).toBe('Sirio');
  });

  it('returns named stars sorted brightest-first', () => {
    const named = loadNamedStars();
    expect(named.length).toBeGreaterThan(300);
    expect(named[0].name).toBe('Sirio');
    for (let i = 1; i < named.length; i++) {
      expect(named[i].magnitude).toBeGreaterThanOrEqual(named[i - 1].magnitude);
    }
  });
});

describe('loadConstellations', () => {
  it('loads all 88 IAU constellations with line data', () => {
    const constellations = loadConstellations();
    expect(constellations).toHaveLength(88);
    for (const constellation of constellations) {
      expect(constellation.lines.length).toBeGreaterThan(0);
      for (const line of constellation.lines) {
        expect(line.length).toBeGreaterThanOrEqual(2);
        for (const [ra, dec] of line) {
          expect(ra).toBeGreaterThanOrEqual(0);
          expect(ra).toBeLessThan(24);
          expect(dec).toBeGreaterThanOrEqual(-90);
          expect(dec).toBeLessThanOrEqual(90);
        }
      }
    }
  });

  it('has info (Spanish name + mythology) for every constellation', () => {
    const infos = loadConstellationInfos();
    expect(infos).toHaveLength(88);
    const constellationIds = new Set(loadConstellations().map((c) => c.id));
    for (const info of infos) {
      expect(constellationIds.has(info.id)).toBe(true);
      expect(info.name.length).toBeGreaterThan(0);
      expect(info.mythology.length).toBeGreaterThan(20);
      for (const starId of info.mainStars) {
        expect(getStarById(starId)).toBeDefined();
      }
    }
  });

  it('looks up Orion in Spanish by IAU code', () => {
    const orion = getConstellationInfo('Ori');
    expect(orion?.name).toBe('Orión');
    expect(orion?.latinName).toBe('Orion');
    expect(orion?.mainStars.length).toBeGreaterThan(3);
  });
});
