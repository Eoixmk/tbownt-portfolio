import { describe, expect, it } from 'vitest'
import { tireWith } from './test-helpers'
import type { Reading } from './types'
import { projectWear } from './wear-projection'

const project = (readings: Reading[]) => projectWear(tireWith({ readings }))

// 0.0002 mm per km, starting from 16 mm: reaches the 3 mm limit at 65,000 km.
const STRAIGHT: Reading[] = [
  { km: 15_000, depth: 13 },
  { km: 30_000, depth: 10 },
  { km: 45_000, depth: 7 },
  { km: 60_000, depth: 4 },
]

describe('projectWear', () => {
  it('needs at least two readings', () => {
    expect(project([]).fit).toBe('none')
    expect(project([{ km: 10_000, depth: 12 }]).fit).toBe('none')
    expect(project([]).limitKm).toBeNull()
  })

  it('recovers a straight wear line and solves for the limit', () => {
    const p = project(STRAIGHT)
    expect(p.slope).toBeCloseTo(-0.0002, 8)
    expect(p.intercept).toBeCloseTo(16, 6)
    expect(p.r2).toBeCloseTo(1, 6)
    expect(p.limitKm).toBe(65_000)
    expect(p.remainingKm).toBe(5_000)
    expect(p.pastLimit).toBe(false)
    expect(p.fit).toBe('good')
  })

  it('does not call a fit good with fewer than four readings', () => {
    expect(project(STRAIGHT.slice(0, 3)).fit).toBe('rough')
  })

  it('does not depend on the order of the readings', () => {
    const p = project([...STRAIGHT].reverse())
    expect(p.currentKm).toBe(60_000)
    expect(p.limitKm).toBe(65_000)
    expect(p.remainingKm).toBe(5_000)
  })

  it('treats a tire exactly at the limit mileage as past it', () => {
    const p = project([
      { km: 30_000, depth: 10 },
      { km: 65_000, depth: 3 },
    ])
    expect(p.limitKm).toBe(65_000)
    expect(p.pastLimit).toBe(true)
    expect(p.remainingKm).toBe(0)
  })

  it('grades a scattered but falling trend as a rough estimate', () => {
    const p = project([
      { km: 10_000, depth: 15 },
      { km: 20_000, depth: 9 },
      { km: 30_000, depth: 12 },
      { km: 40_000, depth: 6 },
    ])
    expect(p.fit).toBe('rough')
    expect(p.r2).toBeCloseTo(0.64, 2)
  })

  it('grades a very noisy trend as unreliable', () => {
    const p = project([
      { km: 10_000, depth: 12 },
      { km: 20_000, depth: 8 },
      { km: 30_000, depth: 12 },
      { km: 40_000, depth: 9 },
    ])
    expect(p.fit).toBe('poor')
    expect(p.limitKm).not.toBeNull()
  })

  it('reports a tire already past the limit with nothing remaining', () => {
    const p = project([
      { km: 50_000, depth: 10 },
      { km: 100_000, depth: 6 },
      { km: 150_000, depth: 2 },
    ])
    expect(p.limitKm).toBe(137_500)
    expect(p.pastLimit).toBe(true)
    expect(p.remainingKm).toBe(0)
  })

  it('refuses to project tread that grows', () => {
    const p = project([
      { km: 10_000, depth: 8 },
      { km: 20_000, depth: 9 },
    ])
    expect(p.fit).toBe('poor')
    expect(p.limitKm).toBeNull()
  })

  it('gives no limit when the fitted line already starts under it', () => {
    // intercept 2.5 mm: the line is below the 3 mm limit at 0 km, so solving for it gives a negative mileage
    const p = project([
      { km: 10_000, depth: 2 },
      { km: 20_000, depth: 1.5 },
    ])
    expect(p.limitKm).toBeNull()
    expect(p.fit).toBe('poor')
  })

  it('does not divide by zero when every reading is at the same mileage', () => {
    const p = project([
      { km: 10_000, depth: 8 },
      { km: 10_000, depth: 7 },
    ])
    expect(p.fit).toBe('poor')
    expect(p.limitKm).toBeNull()
    expect(Number.isNaN(p.slope)).toBe(false)
  })
})
