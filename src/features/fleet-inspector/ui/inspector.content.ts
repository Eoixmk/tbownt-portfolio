import { profile } from '@/shared/profile'
import type { FindingCode } from '../domain'

export const inspectorCopy = {
  eyebrow: 'Interactive demo · built from scratch',
  title: 'From raw readings to a decision.',
  lede: 'A small model of the problem behind most of my work: turning measurements into a status a person can act on. Tires are just the example; the same pattern fits any asset that wears out. Everything below runs in your browser on invented data, not client data.',
  steps: {
    layout: 'Same rules, different vehicles.',
    inspect: 'Rules turn three tread readings and the pressure into a status, and say why.',
    project: 'A straight-line fit estimates when the tire reaches the limit, and how much to trust it.',
  },
  tryLabel: 'Try:',
  examples: [
    { code: 'uneven', label: 'Uneven wear' },
    { code: 'pressure', label: 'Low pressure' },
    { code: 'limit', label: 'Past the limit' },
  ] satisfies { code: FindingCode; label: string }[],
  hood: {
    label: 'Under the hood',
    items: [
      'Pure TypeScript domain',
      'Rules engine',
      'Linear regression',
      'SVG, no chart library',
      'Keyboard accessible',
      'Unit-tested',
    ],
    source: { label: 'View source', href: `${profile.repo}/tree/main/src/features/fleet-inspector` },
  },
}
