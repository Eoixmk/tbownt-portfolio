import { describe, expect, it } from 'vitest'
import { evaluate, assess, findByFinding, pickDefaultTire } from './evaluate'
import { describeTire, layouts } from './layouts'
import { fmtKm } from './format'
import { buildTires } from './tires'

const byId = (id: string) => layouts.find((l) => l.id === id)!

describe('buildTires', () => {
  it.each([
    ['rigid', 6],
    ['tractor-trailer', 10],
    ['with-spare', 11],
  ])('builds the right number of tires for %s', (id, count) => {
    expect(buildTires(byId(id))).toHaveLength(count)
  })

  it('gives every tire a unique, ordered id', () => {
    const ids = buildTires(byId('with-spare')).map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids[0]).toBe('T01')
    expect(ids.at(-1)).toBe('T11')
  })

  it('places dual axles outer-to-inner on each side and single axles one per side', () => {
    const tires = buildTires(byId('tractor-trailer'))
    expect(tires.filter((t) => t.axle === 1).map((t) => `${t.side}-${t.slot}`)).toEqual(['left-single', 'right-single'])
    expect(tires.filter((t) => t.axle === 2).map((t) => `${t.side}-${t.slot}`)).toEqual([
      'left-outer',
      'left-inner',
      'right-inner',
      'right-outer',
    ])
  })

  it('numbers spares as axle 0', () => {
    const spare = buildTires(byId('with-spare')).at(-1)!
    expect(spare.kind).toBe('spare')
    expect(spare.axle).toBe(0)
  })

  it('is deterministic', () => {
    expect(buildTires(byId('tractor-trailer'))).toEqual(buildTires(byId('tractor-trailer')))
  })

  it('centres every pressure range on the target for its axle kind', () => {
    const target = { steer: 115, drive: 100, trailer: 95, spare: 95 }
    for (const t of buildTires(byId('with-spare'))) {
      expect(Math.abs((t.minPressure + t.maxPressure) / 2 - target[t.kind])).toBeLessThanOrEqual(1)
    }
  })

  it('ends every reading series at the tire’s current shallowest depth, at increasing mileage', () => {
    for (const t of buildTires(byId('with-spare'))) {
      if (!t.readings.length) continue
      const kms = t.readings.map((r) => r.km)
      kms.slice(1).forEach((km, i) => expect(km).toBeGreaterThan(kms[i]!))
      expect(t.readings.at(-1)!.depth).toBe(Math.min(t.depths.outer, t.depths.center, t.depths.inner))
    }
  })

  it('shows a mix of statuses so the demo has something to show', () => {
    const health = new Set(buildTires(byId('tractor-trailer')).map((t) => evaluate(t).health))
    expect(health).toEqual(new Set(['ok', 'watch', 'replace']))
  })
})

describe('layout switching', () => {
  const ids = (id: string) => buildTires(byId(id)).map((t) => t.id)

  it('keeps the ids of a smaller layout as the start of a bigger one, so the selection survives a switch', () => {
    expect(ids('tractor-trailer').slice(0, ids('rigid').length)).toEqual(ids('rigid'))
    expect(ids('with-spare').slice(0, ids('tractor-trailer').length)).toEqual(ids('tractor-trailer'))
  })

  it.each(layouts)('puts every tire of $id on a real axle and opens on a tire that exists', (layout) => {
    const tires = buildTires(layout)
    const axleCount = layout.axles.filter((a) => a.kind !== 'spare').length
    expect(tires.every((t) => t.kind === 'spare' || (t.axle >= 1 && t.axle <= axleCount))).toBe(true)
    expect(tires.map((t) => t.id)).toContain(pickDefaultTire(assess(tires)))
  })
})

describe('labels', () => {
  it('describes a tire by axle and position', () => {
    const tires = buildTires(byId('with-spare'))
    expect(describeTire(tires[2]!)).toBe('Drive axle · left outer')
    expect(describeTire(tires[0]!)).toBe('Steer axle · left')
    expect(describeTire(tires.at(-1)!)).toBe('Spare')
  })

  it('formats mileage with a thousands separator', () => {
    expect(fmtKm(129_000)).toBe('129,000 km')
  })
})

describe('guided examples', () => {
  const found = (layoutId: string, code: Parameters<typeof findByFinding>[1]) =>
    findByFinding(assess(buildTires(byId(layoutId))), code)

  it.each(['tractor-trailer', 'with-spare'])('offers every kind of example in %s', (id) => {
    for (const code of ['uneven', 'pressure', 'limit'] as const) expect(found(id, code), code).toBeDefined()
  })

  it('offers uneven wear and low pressure even on the smallest layout', () => {
    expect(found('rigid', 'uneven')).toBeDefined()
    expect(found('rigid', 'pressure')).toBeDefined()
  })
})
