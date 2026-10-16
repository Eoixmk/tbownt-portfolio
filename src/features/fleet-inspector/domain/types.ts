export type AxleKind = 'steer' | 'drive' | 'trailer' | 'spare'
export type Health = 'ok' | 'watch' | 'replace'
export type Side = 'left' | 'right' | 'center'
export type Slot = 'outer' | 'inner' | 'single'

export interface AxleSpec {
  kind: AxleKind
  /** Tires on the axle: 2 = one per side, 4 = dual on each side. For a spare, how many. */
  tires: number
}

export interface Layout {
  id: string
  name: string
  axles: AxleSpec[]
}

/** One tread-depth measurement taken at a given mileage. */
export interface Reading {
  km: number
  depth: number
}

export interface FleetTire {
  id: string
  /** 1-based axle number; 0 for a spare. */
  axle: number
  kind: AxleKind
  side: Side
  slot: Slot
  depths: { outer: number; center: number; inner: number }
  pressure: number
  minPressure: number
  maxPressure: number
  km: number
  retreads: number
  readings: Reading[]
}

/** Why a tire is not simply healthy. Stable codes, so views can look tires up by kind of problem. */
export type FindingCode = 'limit' | 'near-limit' | 'uneven' | 'pressure'

export interface Evaluation {
  health: Health
  /** Generic status word: Healthy, Watch or Replace. The causes are in `flags`. */
  label: string
  /** Shallowest of the three tread readings, in mm. */
  min: number
  /** Short, one-line findings. */
  flags: string[]
  /** The same findings as codes, in the same order. */
  findings: FindingCode[]
}

export interface Assessed {
  tire: FleetTire
  evaluation: Evaluation
}

export type Fit = 'good' | 'rough' | 'poor' | 'none'

export interface Projection {
  fit: Fit
  fitLabel: string
  slope: number
  intercept: number
  r2: number
  /** Mileage at which the fitted line reaches the wear limit, or null when there is no usable fit. */
  limitKm: number | null
  remainingKm: number | null
  pastLimit: boolean
  currentKm: number
}
