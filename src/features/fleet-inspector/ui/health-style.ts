import type { Health } from '../domain'

/** How each status looks. Kept here, not in the domain, because it is presentation. */
export const healthColor: Record<Health, string> = {
  ok: 'var(--accent)',
  watch: 'var(--warn)',
  replace: 'var(--danger)',
}

export const healthGlyph: Record<Health, string> = { ok: '', watch: '!', replace: '×' }
