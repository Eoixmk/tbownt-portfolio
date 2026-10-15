export const focus = {
  eyebrow: '01 / What I do',
  title: 'From the data model to the interface.',
  frontend: {
    label: 'FRONTEND',
    title: 'Data-heavy interfaces',
    text: 'Dashboards, filterable and paginated tables, role-based views and multi-step forms in Vue 3 / Nuxt and React / Next.js with TypeScript.',
    filters: ['status: any', 'vehicle: all'],
    pagination: 'server-side pagination',
    rows: [
      { id: 'TR-01', position: 'Steer · front left', width: 57, color: 'var(--accent)' },
      { id: 'TR-02', position: 'Drive · rear outer', width: 30, color: 'var(--warn)' },
      { id: 'TR-03', position: 'Trailer · axle 3', width: 13, color: 'var(--danger)' },
      { id: 'TR-04', position: 'Steer · front right', width: 64, color: 'var(--accent)' },
    ],
  },
  backend: {
    label: 'BACKEND',
    title: 'APIs and data models',
    text: 'REST and GraphQL APIs in Django (DRF) and NestJS over PostgreSQL, with filtering, authentication and role-scoped permissions.',
    endpoints: [
      { method: 'GET', path: '/api/tires/?status=' },
      { method: 'POST', path: '/api/inspections/' },
      { method: 'GET', path: '/api/accounting/summary/' },
    ],
    note: 'illustrative endpoints',
    graphql: {
      lines: ['query {', '  tires(status: WATCH) {', '    id', '    treadDepth', '  }', '}'],
      note: 'illustrative query',
    },
  },
  async: {
    label: 'ASYNC',
    title: 'Background work and reporting',
    text: 'Heavy jobs moved off the request cycle with Celery and Redis-backed queues, and PDF generation with Puppeteer.',
    steps: ['request', 'queued', 'worker', 'PDF ready'],
  },
}
