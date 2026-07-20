import { Body, SearchRiseSet, type Observer } from 'astronomy-engine';

export interface RiseSetTimes {
  sunrise: Date | null;
  sunset: Date | null;
  moonrise: Date | null;
  moonset: Date | null;
}

const SEARCH_WINDOW_DAYS = 2;

/**
 * Next rise/set events after `from` for the Sun and Moon at the observer's
 * location. Any event can be null at extreme latitudes (midnight sun /
 * polar night), or for the Moon near its monthly extremes.
 */
export function getRiseSetTimes(observer: Observer, from: Date): RiseSetTimes {
  const search = (body: Body, direction: 1 | -1): Date | null =>
    SearchRiseSet(body, observer, direction, from, SEARCH_WINDOW_DAYS)?.date ?? null;

  return {
    sunrise: search(Body.Sun, 1),
    sunset: search(Body.Sun, -1),
    moonrise: search(Body.Moon, 1),
    moonset: search(Body.Moon, -1),
  };
}
