export interface ProjectItem {
  label: string
  name: string
  text?: string
  /** Filled-in projects show stack chips and links. */
  stack?: string[]
  links?: { label: string; href: string }[]
}

const comingSoon = (n: number): ProjectItem => ({
  label: `PROJECT 0${n}`,
  name: 'Coming soon',
})

export const projects = {
  eyebrow: '03 / Personal projects',
  title: 'Side projects, built end to end.',
  items: [
    {
      label: 'PROJECT 01',
      name: 'BCV · Binance Rate Gap',
      text: 'Tracks the gap between Venezuela’s official BCV rate and the Binance P2P USDT/VES price. A FastAPI service scrapes both sources and degrades gracefully when one fails, and a native SwiftUI app with a home-screen widget shows the gap at a glance.',
      stack: ['Python', 'FastAPI', 'BeautifulSoup', 'Swift', 'SwiftUI', 'WidgetKit', 'Render'],
      links: [
        { label: 'API repo', href: 'https://github.com/Eoixmk/bcv-binance-exchange-gap-rate-backend' },
        { label: 'iOS repo', href: 'https://github.com/Eoixmk/bcv-binance-exchange-gap-rate-ios-widget' },
      ],
    },
    comingSoon(2),
    comingSoon(3),
  ] as ProjectItem[],
}
