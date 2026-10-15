import type { AxleKind, AxleSpec, FleetTire, Layout } from './types'

const steer: AxleSpec = { kind: 'steer', tires: 2 }
const drive: AxleSpec = { kind: 'drive', tires: 4 }
const trailer: AxleSpec = { kind: 'trailer', tires: 4 }
const spare: AxleSpec = { kind: 'spare', tires: 1 }

export const layouts: Layout[] = [
  { id: 'rigid', name: 'Rigid truck', axles: [steer, drive] },
  { id: 'tractor-trailer', name: 'Tractor + trailer', axles: [steer, drive, trailer] },
  { id: 'with-spare', name: 'With spare', axles: [steer, drive, trailer, spare] },
]

const AXLE_LABEL: Record<AxleKind, string> = {
  steer: 'Steer',
  drive: 'Drive',
  trailer: 'Trailer',
  spare: 'Spare',
}

export const axleLabel = (kind: AxleKind) => AXLE_LABEL[kind]

/** "Drive axle · left outer" */
export function describeTire(tire: FleetTire): string {
  if (tire.kind === 'spare') return 'Spare'
  const where = tire.slot === 'single' ? tire.side : `${tire.side} ${tire.slot}`
  return `${AXLE_LABEL[tire.kind]} axle · ${where}`
}
