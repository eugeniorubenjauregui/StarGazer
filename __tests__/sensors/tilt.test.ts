import { pitchFromAcceleration } from '@/src/services/sensors/tilt';

describe('pitchFromAcceleration', () => {
  it('is 0 when the top edge points at the horizon (gravity purely along z)', () => {
    expect(pitchFromAcceleration(0, 0, 9.8)).toBeCloseTo(0, 5);
  });

  it('is +90 when the top edge points at the zenith (gravity purely along -y)', () => {
    expect(pitchFromAcceleration(0, -9.8, 0)).toBeCloseTo(90, 5);
  });

  it('is -90 when the top edge points at the nadir (gravity purely along +y)', () => {
    expect(pitchFromAcceleration(0, 9.8, 0)).toBeCloseTo(-90, 5);
  });

  it('is symmetric for a mid tilt', () => {
    const value = pitchFromAcceleration(0, -6.93, 6.93);
    expect(value).toBeCloseTo(45, 1);
  });
});
