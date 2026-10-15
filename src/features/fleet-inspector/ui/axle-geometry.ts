import { layouts, type AxleKind, type FleetTire, type Layout, type Slot } from '../domain'

/*
 * The vehicle is described in two coordinates: `along` (the direction of travel) and
 * `across` (side to side, negative = the vehicle's left). A projector maps them to the
 * screen. Horizontal: `along` is x with the front on the left. Vertical: `along` is y
 * with the front at the top. Pure functions, so the orientation maths can be tested.
 */

export type Orientation = 'horizontal' | 'vertical'

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export const HORIZONTAL_HEIGHT = 262
export const HORIZONTAL_CENTER = 128 // y of the centerline
export const VERTICAL_WIDTH = 250
export const VERTICAL_CENTER = 150 // x of the centerline (the left margin holds the axle names)
export const MAX_SCALE: Record<Orientation, number> = { horizontal: 1.3, vertical: 1.4 }

export const TIRE_LEN = 54 // along the direction of travel
export const TIRE_WIDTH = 28
export const SPARE_LEN = 30
export const SPARE_WIDTH = 54
export const RAIL_HALF = 14
export const TRAILER_HALF = 24
export const BODY_START = 24 // front of the hood

// Distances along the vehicle, in SVG units.
const END_PADDING = 60 // free space after the last axle
const RAIL_OVERHANG = 46 // a chassis rail runs this far past its last axle
const TRAILER_LEAD = 70 // a trailer body starts this far ahead of its first axle
const SPARE_START = 78 // first spare, measured from the last axle
const SPARE_SPACING = 40
const SPARE_ROOM = 30 // extra room reserved before the first spare
const GAPS: Record<Orientation, { first: number; same: number; change: number }> = {
  horizontal: { first: 110, same: 70, change: 150 },
  vertical: { first: 96, same: 64, change: 104 },
}

const ACROSS_OFFSET: Record<`${'left' | 'right'} ${Exclude<Slot, 'single'>}`, number> = {
  'left outer': -80,
  'left inner': -48,
  'right inner': 20,
  'right outer': 52,
}

export interface PlacedAxle {
  number: number
  kind: AxleKind
  at: number
  dual: boolean
}

/** Where each axle, rail and trailer sits along the vehicle for one layout. */
export function layoutGeometry(layout: Layout, orientation: Orientation) {
  const gaps = GAPS[orientation]
  const axles: PlacedAxle[] = []
  let cursor = gaps.first
  let number = 0
  let spares = 0
  for (const spec of layout.axles) {
    if (spec.kind === 'spare') {
      spares += spec.tires
      continue
    }
    const prev = axles.at(-1)
    if (prev) cursor += prev.kind === spec.kind ? gaps.same : gaps.change
    number += 1
    axles.push({ number, kind: spec.kind, at: cursor, dual: spec.tires === 4 })
  }
  const trailer = axles.filter((a) => a.kind === 'trailer')
  const tractor = axles.filter((a) => a.kind !== 'trailer')
  const last = axles.at(-1)!.at
  return {
    axles,
    byNumber: new Map(axles.map((a) => [a.number, a])),
    last,
    length: last + END_PADDING + (spares ? SPARE_ROOM + spares * SPARE_SPACING : 0),
    tractorEnd: tractor.at(-1)!.at + RAIL_OVERHANG,
    trailer: trailer.length ? { start: trailer[0]!.at - TRAILER_LEAD, end: trailer.at(-1)!.at + RAIL_OVERHANG } : null,
  }
}
export type Geometry = ReturnType<typeof layoutGeometry>

/**
 * The vertical drawing always uses the height of the tallest layout, so switching layout
 * on a phone leaves the card (and everything below it) where it is.
 */
export const VERTICAL_LENGTH = Math.max(...layouts.map((l) => layoutGeometry(l, 'vertical').length))

export function viewSize(geometry: Geometry, orientation: Orientation) {
  return orientation === 'vertical'
    ? { width: VERTICAL_WIDTH, height: VERTICAL_LENGTH }
    : { width: geometry.length, height: HORIZONTAL_HEIGHT }
}

/**
 * Maps vehicle coordinates to the screen. Vertical: the front points up, so the vehicle's
 * left is the screen's left. Horizontal: the front points left, so the vehicle's left side
 * is at the bottom of the screen; hence the sign flip.
 */
export function createProjector(orientation: Orientation) {
  const vertical = orientation === 'vertical'
  const screenAcross = (across: number) => (vertical ? VERTICAL_CENTER + across : HORIZONTAL_CENTER - across)

  /** A rectangle given in vehicle coordinates. */
  const place = (along: number, alongLen: number, across: number, acrossLen: number): Box =>
    vertical
      ? { x: screenAcross(across), y: along, w: acrossLen, h: alongLen }
      : { x: along, y: screenAcross(across + acrossLen), w: alongLen, h: acrossLen }

  const point = (along: number, across = 0) =>
    vertical ? { x: screenAcross(across), y: along } : { x: along, y: screenAcross(across) }

  return { place, point }
}
export type Projector = ReturnType<typeof createProjector>

/** Cab, rails, trailer and coupling, placed for the given orientation. */
export function vehicleBody(geometry: Geometry, { place, point }: Projector) {
  const trailer = geometry.trailer
  return {
    hood: place(BODY_START, 24, -28, 56),
    cab: place(BODY_START + 20, 96, -40, 80),
    windshield: [point(BODY_START + 46, -32), point(BODY_START + 46, 32)] as const,
    mirrors: [place(BODY_START + 54, 14, -50, 8), place(BODY_START + 54, 14, 42, 8)],
    tractorRail: place(60, geometry.tractorEnd - 60, -RAIL_HALF, RAIL_HALF * 2),
    trailerBody: trailer ? place(trailer.start, trailer.end - trailer.start, -TRAILER_HALF, TRAILER_HALF * 2) : null,
    trailerRail: trailer ? place(trailer.start + 8, trailer.end - trailer.start - 16, -RAIL_HALF, RAIL_HALF * 2) : null,
    link: trailer ? ([point(geometry.tractorEnd), point(trailer.start)] as const) : null,
    kingpin: trailer ? point(geometry.tractorEnd - 16) : null,
  }
}

/** Screen box of every tire, keyed by tire id. */
export function tireBoxes(geometry: Geometry, tires: FleetTire[], { place }: Projector): Map<string, Box> {
  const boxes = new Map<string, Box>()
  let spareIndex = 0
  for (const tire of tires) {
    if (tire.kind === 'spare') {
      boxes.set(
        tire.id,
        place(
          geometry.last + SPARE_START + spareIndex++ * SPARE_SPACING - SPARE_LEN / 2,
          SPARE_LEN,
          -SPARE_WIDTH / 2,
          SPARE_WIDTH,
        ),
      )
      continue
    }
    const axle = geometry.byNumber.get(tire.axle)
    if (!axle) throw new Error(`Tire ${tire.id} sits on axle ${tire.axle}, which the layout does not have`)
    const slot = tire.slot === 'single' ? 'inner' : tire.slot
    boxes.set(
      tire.id,
      place(axle.at - TIRE_LEN / 2, TIRE_LEN, ACROSS_OFFSET[`${tire.side as 'left' | 'right'} ${slot}`], TIRE_WIDTH),
    )
  }
  return boxes
}
