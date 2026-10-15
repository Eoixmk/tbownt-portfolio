<script setup lang="ts">
import { profile } from '@/shared/profile'
import { hero } from './hero.content'
import TireCard from './TireCard.vue'
</script>

<template>
  <section id="top" class="hero">
    <div class="container">
      <div class="cols">
        <div class="copy">
          <div class="badge">
            <span class="badge-dot"></span>
            <span>{{ hero.badge }}</span>
          </div>
          <h1>{{ hero.title }}</h1>
          <p class="summary">{{ hero.summary }}</p>
          <div class="btn-row cta">
            <a :href="`mailto:${profile.email}`" class="btn btn-primary">Get in touch</a>
            <a href="#work" class="btn btn-ghost">See selected work</a>
          </div>
        </div>
        <div class="card-col">
          <TireCard />
        </div>
      </div>

      <div class="stats">
        <div v-for="s in hero.stats" :key="s.value" class="stat">
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 80px 24px 72px;
}
.cols {
  display: flex;
  flex-wrap: wrap;
  gap: 56px 64px;
  align-items: center;
}
.copy {
  flex: 1 1 520px;
  min-width: 0;
}
.badge {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-2);
}
.badge-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}
h1 {
  margin: 28px 0 0;
  max-width: 760px;
  font-size: clamp(36px, 4.6vw, 62px);
  line-height: 1.04;
  font-weight: 600;
  letter-spacing: -0.028em;
}
.summary {
  margin: 28px 0 0;
  max-width: 600px;
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-2);
}
.cta {
  margin-top: 40px;
}
.card-col {
  flex: 1 1 400px;
  min-width: 0;
  max-width: 520px;
}
.stats {
  margin-top: 72px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}
.stat {
  flex: 1 1 220px;
}
.stat-value {
  font-family: var(--mono);
  font-size: 40px;
  font-weight: 500;
  color: var(--text);
}
.stat-label {
  margin-top: 4px;
  font-size: 15px;
  color: var(--text-2);
}
</style>
