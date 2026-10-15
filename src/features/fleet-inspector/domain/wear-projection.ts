import { LIMIT_MM, NEW_TREAD_MM } from './thresholds'
import type { Fit, FleetTire, Projection } from './types'

const FIT_LABEL: Record<Fit, string> = {
  good: 'Good fit',
  rough: 'Rough estimate',
  poor: 'Unreliable',
  none: 'Not enough readings',
}

const GOOD_MIN_READINGS = 4
const GOOD_MIN_R2 = 0.9
const ROUGH_MIN_R2 = 0.6

/** Linear fit of minimum tread depth against mileage, solved for the wear limit. */
export function projectWear(tire: FleetTire): Projection {
  const pts = tire.readings
  // Do not assume the readings arrive sorted.
  const currentKm = pts.reduce((max, p) => Math.max(max, p.km), 0)
  const base: Projection = {
    fit: 'none',
    fitLabel: FIT_LABEL.none,
    slope: 0,
    intercept: NEW_TREAD_MM,
    r2: 0,
    limitKm: null,
    remainingKm: null,
    pastLimit: false,
    currentKm,
  }
  if (pts.length < 2) return base

  const n = pts.length
  const meanX = pts.reduce((s, p) => s + p.km, 0) / n
  const meanY = pts.reduce((s, p) => s + p.depth, 0) / n
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (const p of pts) {
    sxy += (p.km - meanX) * (p.depth - meanY)
    sxx += (p.km - meanX) ** 2
    syy += (p.depth - meanY) ** 2
  }

  // Every reading at the same mileage: there is no line to fit.
  if (sxx === 0) return { ...base, fit: 'poor', fitLabel: FIT_LABEL.poor }

  const slope = sxy / sxx
  const intercept = meanY - slope * meanX
  const r2 = syy === 0 ? 0 : (sxy * sxy) / (sxx * syy)

  // Tread that does not shrink as the tire runs cannot be projected.
  if (slope >= 0) return { ...base, fit: 'poor', fitLabel: FIT_LABEL.poor, slope, intercept, r2 }

  const fit: Fit = n >= GOOD_MIN_READINGS && r2 >= GOOD_MIN_R2 ? 'good' : r2 >= ROUGH_MIN_R2 ? 'rough' : 'poor'
  const limitKm = Math.round((LIMIT_MM - intercept) / slope)

  // A fitted line that already starts under the limit (or is flat enough to overflow) is not a projection.
  if (!Number.isFinite(limitKm) || limitKm < 0)
    return { ...base, fit: 'poor', fitLabel: FIT_LABEL.poor, slope, intercept, r2 }
  return {
    fit,
    fitLabel: FIT_LABEL[fit],
    slope,
    intercept,
    r2,
    limitKm,
    remainingKm: Math.max(0, limitKm - currentKm),
    pastLimit: limitKm <= currentKm,
    currentKm,
  }
}
