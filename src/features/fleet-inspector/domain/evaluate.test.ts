import { describe, expect, it } from 'vitest'
import type { Health } from './types'
import { assess, evaluate, findByFinding, healthLabel, pickDefaultTire, pressureInRange, treadZone } from './evaluate'
import { tireWith } from './test-helpers'
import { LIMIT_MM, UNEVEN_MM, WARN_MM } from './thresholds'

const depths = (outer: number, center: number, inner: number) => ({ outer, center, inner })

describe('evaluate', () => {
  it('reports a healthy tire with no findings', () => {
    const ev = evaluate(tireWith())
    expect(ev).toEqual({ health: 'ok', label: 'Healthy', min: 10, flags: [], findings: [] })
  })

  it('uses the shallowest of the three readings', () => {
    expect(evaluate(tireWith({ depths: depths(9, 7, 8.5) })).min).toBe(7)
  })

  it('asks for replacement at the wear limit, inclusive', () => {
    const ev = evaluate(tireWith({ depths: depths(LIMIT_MM, 10, 10) }))
    expect(ev.health).toBe('replace')
    expect(ev.label).toBe('Replace')
  })

  it('puts a tire on watch at the warning depth, inclusive', () => {
    const ev = evaluate(tireWith({ depths: depths(WARN_MM, WARN_MM, WARN_MM) }))
    expect(ev.health).toBe('watch')
    expect(ev.flags).toEqual(['Tread close to the limit'])
  })

  it('flags uneven wear only above the threshold', () => {
    const exactly = evaluate(tireWith({ depths: depths(8, 8 + UNEVEN_MM, 9) }))
    expect(exactly.health).toBe('ok')

    const above = evaluate(tireWith({ depths: depths(7, 10.5, 9) }))
    expect(above.health).toBe('watch')
    expect(above.flags).toEqual(['Uneven wear: 3.5 mm spread'])
  })

  it('does not flag a spread of exactly the threshold despite floating-point error', () => {
    // 8.8 - 6.3 is 2.5000000000000004 in floating point; the reading precision is 0.1 mm.
    const ev = evaluate(tireWith({ depths: depths(6.3, 8.8, 8.8) }))
    expect(ev.flags).toEqual([])
    expect(ev.health).toBe('ok')
  })

  it('words the limit finding to match the inclusive comparison', () => {
    expect(evaluate(tireWith({ depths: depths(LIMIT_MM, 9, 9) })).flags[0]).toBe('Tread at or under the 3 mm limit')
  })

  it('flags pressure outside the target range, not on its edges', () => {
    expect(evaluate(tireWith({ pressure: 90 })).health).toBe('ok')
    expect(evaluate(tireWith({ pressure: 110 })).health).toBe('ok')
    expect(evaluate(tireWith({ pressure: 89 })).flags).toEqual(['Low pressure: 89 psi'])
    expect(evaluate(tireWith({ pressure: 111 })).flags).toEqual(['High pressure: 111 psi'])
  })

  it('lets the most severe finding decide the status while keeping every finding', () => {
    const ev = evaluate(tireWith({ depths: depths(2.5, 10, 9), pressure: 80 }))
    expect(ev.health).toBe('replace')
    expect(ev.flags).toHaveLength(3)
  })
})

describe('pressureInRange', () => {
  it('is inclusive on both ends', () => {
    expect(pressureInRange(tireWith({ pressure: 90 }))).toBe(true)
    expect(pressureInRange(tireWith({ pressure: 110 }))).toBe(true)
    expect(pressureInRange(tireWith({ pressure: 111 }))).toBe(false)
  })
})

describe('assess', () => {
  it('pairs every tire with its evaluation, in order', () => {
    const a = tireWith({ id: 'T01' })
    const b = tireWith({ id: 'T02', depths: depths(2, 2, 2) })
    const result = assess([a, b])
    expect(result.map((r) => r.tire.id)).toEqual(['T01', 'T02'])
    expect(result.map((r) => r.evaluation.health)).toEqual(['ok', 'replace'])
  })
})

describe('findings', () => {
  it('reports one code per finding, in the same order as the messages', () => {
    const ev = evaluate(tireWith({ depths: depths(2.5, 10, 9), pressure: 80 }))
    expect(ev.findings).toEqual(['limit', 'uneven', 'pressure'])
    expect(ev.findings).toHaveLength(ev.flags.length)
  })

  it('tells near-the-limit apart from past it', () => {
    expect(evaluate(tireWith({ depths: depths(5, 5, 5) })).findings).toEqual(['near-limit'])
    expect(evaluate(tireWith({ depths: depths(3, 3, 3) })).findings).toEqual(['limit'])
  })
})

describe('findByFinding', () => {
  const items = assess([
    tireWith({ id: 'A' }),
    tireWith({ id: 'B', pressure: 80 }),
    tireWith({ id: 'C', depths: depths(2, 2, 2) }),
    tireWith({ id: 'D', pressure: 80 }),
  ])

  it('returns the first tire with that kind of finding', () => {
    expect(findByFinding(items, 'pressure')).toBe('B')
    expect(findByFinding(items, 'limit')).toBe('C')
  })

  it('returns undefined when no tire has it', () => {
    expect(findByFinding(items, 'uneven')).toBeUndefined()
  })
})

describe('treadZone', () => {
  it('is inclusive at both thresholds', () => {
    expect(treadZone(LIMIT_MM)).toBe('replace')
    expect(treadZone(LIMIT_MM + 0.1)).toBe('watch')
    expect(treadZone(WARN_MM)).toBe('watch')
    expect(treadZone(WARN_MM + 0.1)).toBe('ok')
  })
})

describe('healthLabel', () => {
  it('uses plain status words', () => {
    const all: Health[] = ['ok', 'watch', 'replace']
    expect(all.map(healthLabel)).toEqual(['Healthy', 'Watch', 'Replace'])
  })
})

describe('pickDefaultTire', () => {
  const tire = (id: string, min: number) => tireWith({ id, depths: depths(min, 10, 10) })

  it('opens on the first tire on watch', () => {
    // 10 mm is healthy, 2 mm replace, 5 mm and 5.5 mm are on watch.
    const items = assess([tire('A', 10), tire('B', 2), tire('C', 5), tire('D', 5.5)])
    expect(pickDefaultTire(items)).toBe('C')
  })

  it('falls back to the first tire when none is on watch', () => {
    expect(pickDefaultTire(assess([tire('A', 10), tire('B', 2)]))).toBe('A')
  })

  it('refuses an empty list instead of returning a made-up id', () => {
    expect(() => pickDefaultTire([])).toThrow()
  })
})
