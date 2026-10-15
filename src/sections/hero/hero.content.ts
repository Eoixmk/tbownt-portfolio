export const hero = {
  badge: 'Available as independent contractor · Remote · UTC-4',
  title: 'Full stack developer building the software that fleet and asset operations run on.',
  summary:
    'I turn raw operational data into tools people act on: faster dashboards, reports that no longer get prepared by hand, and financial views that show clients what they spend, owe and save. I own features from the first design review to production, across data model, API and interface.',
  stats: [
    { value: '6+', label: 'years shipping production software' },
    { value: '3', label: 'generations of one enterprise asset management platform' },
    { value: '4', label: 'surfaces: web, mobile, desktop and a reporting service' },
  ],
}

export interface Tire {
  label: string
  position: string
  status: string
  /** null = use the accent color */
  color: string | null
  mileage: string
  mileagePct: number
  pressure: string
  pressurePct: number
  tread: number
}

export const tires: Tire[] = [
  {
    label: 'TR-01',
    position: 'Steer · front left',
    status: 'In service',
    color: null,
    mileage: '62,400 km',
    mileagePct: 25,
    pressure: '118 psi',
    pressurePct: 91,
    tread: 9.1,
  },
  {
    label: 'TR-02',
    position: 'Drive · rear outer',
    status: 'Rotate soon',
    color: 'var(--warn)',
    mileage: '148,900 km',
    mileagePct: 60,
    pressure: '104 psi',
    pressurePct: 80,
    tread: 4.8,
  },
  {
    label: 'TR-03',
    position: 'Trailer · axle 3',
    status: 'Replace',
    color: 'var(--danger)',
    mileage: '231,300 km',
    mileagePct: 93,
    pressure: '96 psi',
    pressurePct: 74,
    tread: 2.1,
  },
]
