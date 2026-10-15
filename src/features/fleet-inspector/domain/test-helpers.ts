import type { FleetTire } from './types'

/** A healthy tire with round numbers; tests override only what they care about. */
export function tireWith(overrides: Partial<FleetTire> = {}): FleetTire {
  return {
    id: 'T01',
    axle: 1,
    kind: 'steer',
    side: 'left',
    slot: 'single',
    depths: { outer: 10, center: 10, inner: 10 },
    pressure: 100,
    minPressure: 90,
    maxPressure: 110,
    km: 50_000,
    retreads: 0,
    readings: [],
    ...overrides,
  }
}
