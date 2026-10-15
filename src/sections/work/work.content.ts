export interface WorkItem {
  year: string
  name: string
  subtitle: string
  paragraphs: string[]
  stack: string[]
  diagram?: boolean
}

export const work = {
  eyebrow: '02 / Selected work at AETO',
  title: 'Production systems used daily by operations teams.',
  items: [
    {
      year: '2025',
      name: 'EAM Web 3.0',
      subtitle: 'Enterprise asset management platform',
      paragraphs: [
        'Re-platformed a legacy product into the system customer service and support teams use to track warehouses, vehicles, tires, services, catalogs and inspections from a single source of truth.',
        'Built tire lifecycle tracking per tire and vehicle (status, mileage, pressure, tread depth) and the accounting module that shows each client what they have spent, what they owe and what they have saved. The same API serves a React Native (Expo) mobile app.',
      ],
      stack: ['Nuxt', 'TypeScript', 'Django REST', 'PostgreSQL', 'Firebase', 'Cloudinary', 'Docker'],
    },
    {
      year: '2024',
      name: 'EAM Reports 2.0',
      subtitle: 'Report generation service',
      paragraphs: [
        'Designed and built end to end: a NestJS REST API with Redis-backed job queues, a Vue front end that renders truck chassis diagrams dynamically, and Puppeteer for PDF capture, all containerized in a monorepo.',
        'Replaced manually prepared reports with generated PDFs that operations and finance use to track spend and equipment status, plus a report history so past documents can be re-downloaded without regenerating them.',
      ],
      stack: ['NestJS', 'Redis queues', 'Puppeteer', 'Vue', 'PostgreSQL', 'Docker'],
      diagram: true,
    },
    {
      year: '2022',
      name: 'G.O.S Inventory',
      subtitle: 'Desktop app for an external client',
      paragraphs: [
        'Planned, designed and delivered a multi-branch desktop inventory system, from requirements to production: 50+ suppliers, purchase invoices, stock movements between branches and supplier reconciliation.',
      ],
      stack: ['Electron', 'Django REST', 'PostgreSQL', 'Firebase', 'Cloudinary', 'Docker'],
    },
  ] as WorkItem[],
}

export const architecture = {
  label: 'HOW A REPORT IS GENERATED',
  note: 'Simplified architecture',
  nodes: [
    { title: 'Vue app', text: 'User requests a report' },
    { title: 'NestJS API', text: 'REST endpoint enqueues the job' },
    { title: 'Redis queue', text: 'Holds jobs until a worker is free' },
    { title: 'Worker', text: 'Picks up the job and prepares the data' },
    { title: 'Puppeteer', text: 'Renders the Vue report view to PDF' },
    { title: 'Report history', text: 'Saved for re-download' },
  ],
  caption:
    'Rendering happens in a worker, not in the request. Finished PDFs go to the report history and can be downloaded again without regenerating them.',
}
