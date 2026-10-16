import { LIMIT_MM, UNEVEN_MM, WARN_MM } from './thresholds'
import type { Assessed, Evaluation, FindingCode, FleetTire, Health } from './types'

const round1 = (n: number) => Math.round(n * 10) / 10

const HEALTH_LABEL: Record<Health, string> = { ok: 'Healthy', watch: 'Watch', replace: 'Replace' }

/** Which tread zone a depth falls in: at or under the limit, on watch, or fine. */
export function treadZone(mm: number): Health {
  if (mm <= LIMIT_MM) return 'replace'
  return mm <= WARN_MM ? 'watch' : 'ok'
}

export const pressureInRange = (t: FleetTire) => t.pressure >= t.minPressure && t.pressure <= t.maxPressure

/** The most severe finding decides the status; every finding is listed in `flags`. */
export function evaluate(tire: FleetTire): Evaluation {
  const { outer, center, inner } = tire.depths
  const min = Math.min(outer, center, inner)
  // Readings carry 0.1 mm precision; round so that 8.8 - 6.3 is 2.5, not 2.5000000000000004.
  const spread = round1(Math.max(outer, center, inner) - min)
  const flags: string[] = []
  const findings: FindingCode[] = []
  let health: Health = 'ok'

  const raise = (to: Exclude<Health, 'ok'>, code: FindingCode, text: string) => {
    findings.push(code)
    flags.push(text)
    if (to === 'replace' || health === 'ok') health = to
  }

  const zone = treadZone(min)
  if (zone === 'replace') raise('replace', 'limit', `Tread at or under the ${LIMIT_MM} mm limit`)
  else if (zone === 'watch') raise('watch', 'near-limit', 'Tread close to the limit')
  if (spread > UNEVEN_MM) raise('watch', 'uneven', `Uneven wear: ${spread.toFixed(1)} mm spread`)
  if (!pressureInRange(tire)) {
    raise('watch', 'pressure', `${tire.pressure < tire.minPressure ? 'Low' : 'High'} pressure: ${tire.pressure} psi`)
  }

  return { health, label: HEALTH_LABEL[health], min, flags, findings }
}

/** Evaluate each tire once; views read from this instead of re-deriving. */
export const assess = (tires: FleetTire[]): Assessed[] => tires.map((tire) => ({ tire, evaluation: evaluate(tire) }))

/** The tire to open on: the first one on watch, so the demo starts with something to show. */
export function pickDefaultTire(items: Assessed[]): string {
  const pick = items.find((i) => i.evaluation.health === 'watch') ?? items[0]
  if (!pick) throw new Error('pickDefaultTire needs at least one tire')
  return pick.tire.id
}

/** Id of the first tire with the given kind of finding, if any: used to jump to an example. */
export const findByFinding = (items: Assessed[], code: FindingCode): string | undefined =>
  items.find((i) => i.evaluation.findings.includes(code))?.tire.id

export const healthLabel = (health: Health) => HEALTH_LABEL[health]
