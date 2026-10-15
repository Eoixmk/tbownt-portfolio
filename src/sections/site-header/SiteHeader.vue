<script setup lang="ts">
import { ref, watch } from 'vue'
import { useElementSize } from '@/shared/composables/useElementSize'
import { nav } from './site-header.content'

const header = ref<HTMLElement | null>(null)
const { height } = useElementSize(header)

// Publish the real header height so anchored sections clear it at any width.
watch(height, (h) => {
  if (h) document.documentElement.style.setProperty('--header-h', `${h}px`)
})
</script>

<template>
  <a href="#main" class="skip-link">Skip to content</a>
  <header ref="header" class="header">
    <div class="container header-inner">
      <a href="#top" class="brand">andrés<span class="dot">.</span>salom</a>
      <nav class="nav" aria-label="Primary">
        <a v-for="item in nav" :key="item.href" :href="item.href">{{ item.label }}</a>
        <a href="#contact" class="contact-link">Contact</a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
.header-inner {
  padding: 12px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 32px;
  align-items: center;
  justify-content: space-between;
}
.brand {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-family: var(--mono);
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0.02em;
  text-decoration: none;
  color: var(--text);
}
.dot {
  color: var(--accent);
}
.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0 28px;
  font-size: 15px;
}
.nav a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--text-2);
  text-decoration: none;
}
.nav .contact-link {
  color: var(--accent);
  font-weight: 600;
}

/* Narrow phones: one row for the nav, so the sticky header stays slim. */
@media (max-width: 480px) {
  .header-inner {
    gap: 0 16px;
    padding: 8px 16px;
  }
  .nav {
    gap: 0 12px;
    font-size: 13px;
  }
}
</style>
