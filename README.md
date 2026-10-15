# Andrés Salom · Portfolio

Source code of my personal portfolio: a single-page site built with Vue 3, Vite and TypeScript.

It is the public side of my work as a full stack developer. This README explains who I am, why the site exists, what it is based on, and the engineering decisions behind it, so you can judge the code as well as the page.

- **Site:** <https://tbownt-portfolio.netlify.app>
- **LinkedIn:** <https://linkedin.com/in/andres-salom>
- **GitHub:** <https://github.com/Tbownt>

## About me

I am a full stack developer with 6+ years of experience shipping production software, working remotely from Zulia, Venezuela (UTC-4). My written English is C1.

- **2021 – present: AETO** (company based in Mexico, remote). AETO is both a product company and a software house: it builds its own enterprise asset management platform for fleet operations and delivers custom software for external clients. I have worked across the platform's generations, from server-rendered Django templates to a Next.js and Django GraphQL stack, to the current Nuxt and Django REST platform, plus NestJS services for reporting, a React Native mobile app and an Electron desktop app for a client.
- **2020 – 2021: freelance frontend developer** (Fiverr, Freelance.com). 10+ projects for international clients in React and JavaScript: dashboards, third-party API integrations, and scoping requirements directly with clients.

What I do day to day: data-heavy interfaces (dashboards, filterable and paginated tables, role-based views), REST and GraphQL APIs over PostgreSQL, and background work such as report generation. I am looking for remote roles (LATAM, Europe, USA) and independent contract work.

## Why this site exists

My previous portfolio was built from a video tutorial before I used AI tooling, and I stopped maintaining it. It said nothing about how I think or what I have built. This one has three goals:

1. **Say what I do in business terms first**, and show the technology second. The copy leads with outcomes (faster dashboards, reports nobody prepares by hand, financial views for clients) rather than lists of tools.
2. **Show engineering decisions, not just screenshots.** A portfolio of screenshots cannot show data modelling, testing or architecture, which are the parts of my work that screenshots hide. This repository is meant to be read.
3. **Be fast and accessible.** It is a landing page, so it should behave like one.

## What it is based on

- **A design mockup.** The visual design (dark, technical, Hanken Grotesk for text and JetBrains Mono for labels and data, a 1160 px container) comes from a mockup exported from a design tool. Sections 01 to 06 reproduce it faithfully: the code follows the mockup's tokens, spacing and copy rather than reinterpreting them.
- **My own work history.** The _What I do_, _Selected work_, _Experience_ and _Stack_ sections summarise real experience. Descriptions are deliberately high level.
- **A rule about confidentiality.** The interactive parts use invented data, labelled as illustrative, and do not reproduce any employer's interface, data or schemas. Work descriptions stay high level.
- **The interactive demo is an addition to the mockup.** It exists to show modelling and data visualisation skills without showing any real system (see below).

## What is on the page

| Section          | Purpose                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Hero             | Positioning, availability, and an interactive tire card with invented data.                                                           |
| Interactive demo | A fleet inspector built from scratch: axle layouts, per-tire status, tread gauges and a wear projection. Described below.             |
| 01 What I do     | Frontend, backend (with a REST / GraphQL switch) and async work, each with a small illustration.                                      |
| 02 Selected work | Three production systems, with an animated architecture diagram.                                                                      |
| 03 Projects      | Personal projects. One is published (a BCV vs Binance P2P exchange-rate gap tracker with a SwiftUI app and widget); more are planned. |
| 04 – 06          | Experience, stack and contact.                                                                                                        |

### The interactive demo

The demo models a small fleet problem end to end, using only invented data:

- **Layouts.** Pick a rigid truck, a tractor with trailer, or one with a spare. The diagram is drawn from the layout definition and redraws vertically on narrow screens, so nothing scrolls sideways.
- **Status rules.** Each tire is evaluated from three tread readings (outer, center, inner) and its pressure: replace at or below 3 mm, watch at 6 mm, uneven wear above 2.5 mm of spread, pressure outside a ±10% band. The most severe finding decides the status, and every finding is listed.
- **Wear projection.** A least-squares fit of minimum tread depth against mileage, solved for the wear limit. The result carries an honest confidence label (good fit, rough estimate, unreliable or not enough readings), and degenerate cases (a single reading, identical mileages, tread that grows) are handled instead of producing `NaN`.
- **Accessibility.** The SVG is decorative; a button list is the keyboard path, status never depends on colour alone, the chart has a data table, and selections are announced through a live region.

All thresholds are invented for the demo. None come from a real maintenance policy.

## Stack and why

| Choice                               | Reason                                                                                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vue 3 + Vite + TypeScript**        | It is a landing page, so a full framework with routing and SSR would be overhead. Vue is also what I use daily. Strict TypeScript, checked with `vue-tsc`. |
| **Plain scoped CSS and tokens**      | No UI library and no utility framework: the design has a small, specific set of tokens, and shipping a library for it would cost more bytes than it saves. |
| **Custom SVG, no chart library**     | The charts are small and specific. A library would add tens of kilobytes and fight the design.                                                             |
| **Self-hosted fonts (Latin subset)** | Removes a render-blocking third-party request and a privacy cost. Two variable font files, about 75 KB.                                                    |
| **Vitest**                           | The domain layer is plain TypeScript, so it is tested without a DOM.                                                                                       |
| **pnpm**                             | Fast, strict installs. The package manager is pinned in `package.json`.                                                                                    |

The runtime dependency list is one package: `vue`.

## Architecture

The page is small, but the interactive demo has real domain logic, so the folders say what the code is for rather than what technology it uses.

```
src/
  app/                       App shell
  shared/
    styles/                  tokens.css, base.css, fonts.css
    ui/                      Card, StatusMark (reused across sections and features)
    composables/             useElementSize (ResizeObserver wrapper)
    profile.ts               Name, links and contact details used in several places
  sections/                  One folder per page section
    hero/ focus/ work/ projects/ experience/ stack/ contact/ site-header/ site-footer/
      XSection.vue           The component
      x.content.ts           Its copy and data, separate from the markup
  features/
    fleet-inspector/
      index.ts               Public entry point: the page imports the feature from here
      domain/                Plain TypeScript, no Vue, no CSS: types, thresholds,
                             layouts, tire generator, evaluate, wear-projection (+ tests)
      ui/                    Components that draw the domain: diagram, detail panel,
                             wear chart and summary, plus axle-geometry.ts (the pure
                             maths behind the diagram, tested) and health-style.ts
                             (status colours and glyphs)
```

The tree is abridged: each section folder also holds its own sub-components (for example the hero's tire card and the work section's architecture diagram).

Rules the structure enforces:

- `sections` and `features` may import from `shared`; `shared` imports from neither.
- `features` never import from `sections`.
- `domain` imports nothing from Vue or CSS. Presentation concerns (colours, glyphs, drawing geometry) live in `ui/`.
- Copy lives in `*.content.ts` files, so changing text never touches markup.
- `@` is an alias for `src`, used across folders; relative imports are for files in the same folder.

### Decisions worth knowing about

- **Evaluate once.** Tires are assessed a single time (`assess`) and the result is passed down, rather than each component re-deriving it.
- **Stable layout.** Panels reserve their height (`min-height` in `lh` units, fixed gauge columns), so switching tire or layout never makes the page jump. I measured this across every tire and layout at desktop and mobile widths.
- **Hover is intent-based.** Hovering a tire selects it only for a real mouse and after a short pause, so scrolling or sweeping the pointer does not flip the detail panels. Touch and keyboard select on click.
- **One observer, one composable.** Responsive behaviour that CSS cannot express (vertical diagram, compact chart, header height) goes through `useElementSize`.

## Quality

- **Type-checking:** `pnpm build` runs `vue-tsc --noEmit` before bundling.
- **Tests:** `pnpm test` runs the Vitest suite. It covers the domain layer (status precedence and boundaries, regression results on known lines, and edge cases such as one reading, identical mileages, rising tread and past-limit tires) and the diagram's pure geometry (left and right sides in both orientations, every tire inside its viewBox, no overlaps).
- **Formatting and CI:** Prettier, enforced with `pnpm format:check`. A GitHub Actions workflow runs format check, tests and build on every push and pull request; `pnpm verify` runs the same three steps locally.
- **Accessibility:** semantic landmarks and headings, a skip link, visible keyboard focus, 44 px touch targets, `prefers-reduced-motion` support, and text contrast checked against WCAG AA.
- **Performance:** Lighthouse (mobile profile, simulated slow 4G, production build served locally) scored **99 performance, 100 accessibility, 100 best practices, 100 SEO**, with a first contentful paint of 1.5 s, zero layout shift and about 120 KB transferred. It is a lab number, not field data.

## Getting started

Requires Node 22.12+ (see `.nvmrc`) and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev            # development server
pnpm test           # unit tests
pnpm build          # type-check and production build into dist/
pnpm preview        # serve the production build
pnpm test:watch     # tests in watch mode
pnpm format         # format the codebase
pnpm format:check   # what CI runs
pnpm verify         # format check, tests and build, as CI does
```

## Deploy

The site is static. On Netlify: build command `pnpm build`, publish directory `dist`.

## Roadmap

- Publish the next personal projects, each with a README, an architecture diagram, short decision records, tests and CI:
  a multi-tenant Django REST API, an asynchronous report pipeline with idempotent tasks, and a double-entry ledger in PostgreSQL.
- Case-study write-ups for the selected work.
- English and Spanish versions, and downloadable CVs.

## Notes

The copy and design are mine; please do not reuse them as your own. Fonts are Hanken Grotesk and JetBrains Mono, both under the SIL Open Font License (see `src/assets/fonts/LICENSE.txt`).
