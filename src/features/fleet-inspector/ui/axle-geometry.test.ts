import { describe, expect, it } from 'vitest'
import { buildTires, layouts } from '../domain'
import {
  createProjector,
  HORIZONTAL_CENTER,
  HORIZONTAL_HEIGHT,
  layoutGeometry,
  tireBoxes,
  VERTICAL_CENTER,
  VERTICAL_LENGTH,
  VERTICAL_WIDTH,
  viewSize,
  type Orientation,
} from './axle-geometry'

const ORIENTATIONS: Orientation[] = ['horizontal', 'vertical']
const layout = (id: string) => layouts.find((l) => l.id === id)!

function boxesFor(id: string, orientation: Orientation) {
  const l = layout(id)
  const geometry = layoutGeometry(l, orientation)
  const tires = buildTires(l)
  return { geometry, tires, boxes: tireBoxes(geometry, tires, createProjector(orientation)) }
}

describe('orientation', () => {
  it("draws the vehicle's left side below the centerline when the front points left", () => {
    const { tires, boxes } = boxesFor('tractor-trailer', 'horizontal')
    for (const t of tires.filter((t) => t.side === 'left')) {
      expect(boxes.get(t.id)!.y).toBeGreaterThan(HORIZONTAL_CENTER)
    }
    for (const t of tires.filter((t) => t.side === 'right')) {
      const box = boxes.get(t.id)!
      expect(box.y + box.h).toBeLessThan(HORIZONTAL_CENTER)
    }
  })

  it("draws the vehicle's left side left of the centerline when the front points up", () => {
    const { tires, boxes } = boxesFor('tractor-trailer', 'vertical')
    for (const t of tires.filter((t) => t.side === 'left')) {
      const box = boxes.get(t.id)!
      expect(box.x + box.w).toBeLessThan(VERTICAL_CENTER)
    }
    for (const t of tires.filter((t) => t.side === 'right')) {
      expect(boxes.get(t.id)!.x).toBeGreaterThan(VERTICAL_CENTER)
    }
  })

  it('puts the same tire on the same side of the vehicle in both orientations', () => {
    // Facing forward, T01 (steer, left) must be the lower tire of the steer pair when horizontal
    // and the left tire of the pair when vertical.
    const h = boxesFor('rigid', 'horizontal').boxes
    const v = boxesFor('rigid', 'vertical').boxes
    expect(h.get('T01')!.y).toBeGreaterThan(h.get('T02')!.y)
    expect(v.get('T01')!.x).toBeLessThan(v.get('T02')!.x)
  })

  it('maps a point on the centerline to the centerline', () => {
    expect(createProjector('horizontal').point(100).y).toBe(HORIZONTAL_CENTER)
    expect(createProjector('vertical').point(100).x).toBe(VERTICAL_CENTER)
  })
})

describe('drawing size', () => {
  it.each(ORIENTATIONS.flatMap((o) => layouts.map((l) => [o, l.id] as const)))(
    'fits every tire of %s %s inside its viewBox',
    (orientation, id) => {
      const { geometry, boxes } = boxesFor(id, orientation)
      const { width, height } = viewSize(geometry, orientation)
      for (const [tireId, box] of boxes) {
        expect(box.x, tireId).toBeGreaterThanOrEqual(0)
        expect(box.y, tireId).toBeGreaterThanOrEqual(0)
        expect(box.x + box.w, tireId).toBeLessThanOrEqual(width)
        expect(box.y + box.h, tireId).toBeLessThanOrEqual(height)
      }
    },
  )

  it('keeps one fixed vertical height for every layout, so the card never resizes', () => {
    for (const l of layouts) {
      const size = viewSize(layoutGeometry(l, 'vertical'), 'vertical')
      expect(size).toEqual({ width: VERTICAL_WIDTH, height: VERTICAL_LENGTH })
    }
  })

  it('keeps the horizontal height constant and grows only in length', () => {
    const sizes = layouts.map((l) => viewSize(layoutGeometry(l, 'horizontal'), 'horizontal'))
    expect(new Set(sizes.map((s) => s.height))).toEqual(new Set([HORIZONTAL_HEIGHT]))
    expect(sizes[0]!.width).toBeLessThan(sizes[1]!.width)
  })
})

describe('tireBoxes', () => {
  it('never lets two tires overlap', () => {
    for (const orientation of ORIENTATIONS) {
      const { boxes } = boxesFor('with-spare', orientation)
      const list = [...boxes.entries()]
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const [idA, a] = list[i]!
          const [idB, b] = list[j]!
          const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
          expect(overlap, `${idA} overlaps ${idB} (${orientation})`).toBe(false)
        }
      }
    }
  })

  it('fails loudly when a tire is on an axle the layout does not have', () => {
    const geometry = layoutGeometry(layout('rigid'), 'horizontal')
    const stray = { ...buildTires(layout('tractor-trailer')).at(-1)! }
    expect(() => tireBoxes(geometry, [stray], createProjector('horizontal'))).toThrow()
  })
})
