import { Observer } from 'astronomy-engine';

export function createObserver(latitude: number, longitude: number, elevationMeters = 0): Observer {
  return new Observer(latitude, longitude, elevationMeters);
}
