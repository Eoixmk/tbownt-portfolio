import { NEW_TREAD_MM, PRESSURE_TOLERANCE } from './thresholds'
import type { AxleKind, FleetTire, Layout, Reading, Side, Slot } from './types'

interface Profile {
  depths: [outer: number, center: number, inner: number]
  pressureDelta: number
  km: number
  retreads: number
  /** How many past readings to generate. */
  readings: number
  /** Largest distance, in mm, a reading may stray from the straight wear line. */
  noiseMm: number
}

// Handed out in tire order (front to back, left to right). The tractor-trailer
// layouts get the full mix: healthy, uneven wear, low pressure, near the limit,
// past it, a barely measured tire and a fresh spare. The rigid truck, which uses
// only the first six, is the mildest.
const PROFILES: Profile[] = [
  { depths: [11.4, 11.9, 11.3], pressureDelta: 0.01, km: 41_200, retreads: 0, readings: 5, noiseMm: 0.375 },
  { depths: [11.1, 11.8, 11.2], pressureDelta: -0.02, km: 41_200, retreads: 0, readings: 5, noiseMm: 0.375 },
  { depths: [6.2, 10.1, 9.6], pressureDelta: 0.0, km: 98_600, retreads: 1, readings: 5, noiseMm: 0.625 },
  { depths: [9.2, 9.6, 9.4], pressureDelta: 0.01, km: 98_600, retreads: 1, readings: 5, noiseMm: 0.5 },
  { depths: [9.0, 9.5, 9.1], pressureDelta: -0.01, km: 98_600, retreads: 1, readings: 5, noiseMm: 0.5 },
  { depths: [8.4, 8.8, 8.5], pressureDelta: -0.17, km: 112_400, retreads: 1, readings: 3, noiseMm: 0.5 },
  { depths: [4.6, 5.1, 4.9], pressureDelta: 0.02, km: 176_900, retreads: 2, readings: 5, noiseMm: 0.75 },
  { depths: [8.1, 8.4, 8.0], pressureDelta: 0.0, km: 88_200, retreads: 1, readings: 5, noiseMm: 0.5 },
  { depths: [2.4, 2.9, 2.6], pressureDelta: -0.03, km: 231_300, retreads: 2, readings: 5, noiseMm: 0.5 },
  { depths: [9.8, 10.3, 9.9], pressureDelta: 0.0, km: 63_100, retreads: 0, readings: 2, noiseMm: 0.25 },
  { depths: [15.2, 15.4, 15.3], pressureDelta: 0.0, km: 0, retreads: 0, readings: 0, noiseMm: 0 },
]

const TARGET_PSI: Record<AxleKind, number> = { steer: 115, drive: 100, trailer: 95, spare: 95 }

/** Deterministic pseudo-noise in [-1, 1], so the demo looks the same on every load. */
function jitter(seed: number, i: number): number {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** Past readings along a roughly straight wear line that ends at the tire's current shallowest depth. */
function readingsFor(profile: Profile, seed: number): Reading[] {
  if (profile.readings === 0) return []
  const min = Math.min(...profile.depths)
  const rate = (NEW_TREAD_MM - min) / profile.km
  return Array.from({ length: profile.readings }, (_, k) => {
    const n = k + 1
    const km = Math.round((profile.km * n) / profile.readings)
    const isLast = n === profile.readings
    const depth = isLast ? min : NEW_TREAD_MM - rate * km + jitter(seed, n) * profile.noiseMm
    return { km, depth: round1(depth) }
  })
}

/** Builds the invented tires of a layout, front to back, left to right. */
export function buildTires(layout: Layout): FleetTire[] {
  const tires: FleetTire[] = []
  let axleNumber = 0

  const add = (kind: AxleKind, axle: number, side: Side, slot: Slot) => {
    const order = tires.length
    const profile = PROFILES[order % PROFILES.length]!
    const target = TARGET_PSI[kind]
    tires.push({
      id: `T${String(order + 1).padStart(2, '0')}`,
      axle,
      kind,
      side,
      slot,
      depths: { outer: profile.depths[0], center: profile.depths[1], inner: profile.depths[2] },
      pressure: Math.round(target * (1 + profile.pressureDelta)),
      minPressure: Math.round(target * (1 - PRESSURE_TOLERANCE)),
      maxPressure: Math.round(target * (1 + PRESSURE_TOLERANCE)),
      km: profile.km,
      retreads: profile.retreads,
      readings: readingsFor(profile, order + 1),
    })
  }

  for (const spec of layout.axles) {
    if (spec.kind === 'spare') {
      for (let n = 0; n < spec.tires; n++) add('spare', 0, 'center', 'single')
      continue
    }
    axleNumber += 1
    if (spec.tires === 4) {
      add(spec.kind, axleNumber, 'left', 'outer')
      add(spec.kind, axleNumber, 'left', 'inner')
      add(spec.kind, axleNumber, 'right', 'inner')
      add(spec.kind, axleNumber, 'right', 'outer')
    } else {
      add(spec.kind, axleNumber, 'left', 'single')
      add(spec.kind, axleNumber, 'right', 'single')
    }
  }
  return tires
}
