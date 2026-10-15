/** Public surface of the fleet-inspector domain: plain TypeScript, no Vue, no CSS. */
export * from './types'
export * from './thresholds'
export { layouts, axleLabel, describeTire } from './layouts'
export { buildTires } from './tires'
export { evaluate, assess, pickDefaultTire, healthLabel, treadZone, pressureInRange } from './evaluate'
export { projectWear } from './wear-projection'
export { fmtKm } from './format'
