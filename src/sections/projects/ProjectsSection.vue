<script setup lang="ts">
import { projects } from './projects.content'
</script>

<template>
  <section id="projects" class="section">
    <div class="container">
      <div class="eyebrow">{{ projects.eyebrow }}</div>
      <h2 class="h2">{{ projects.title }}</h2>

      <div class="grid">
        <article v-for="p in projects.items" :key="p.label" class="project" :class="{ filled: p.stack }">
          <div class="label">{{ p.label }}</div>
          <h3>{{ p.name }}</h3>
          <p v-if="p.text">{{ p.text }}</p>
          <div v-if="p.stack" class="chips">
            <span v-for="s in p.stack" :key="s" class="chip">{{ s }}</span>
          </div>
          <div v-if="p.links" class="links">
            <a v-for="l in p.links" :key="l.href" :href="l.href" target="_blank" rel="noopener"
              >{{ l.label }}<span aria-hidden="true"> ↗</span><span class="sr-only"> (opens in a new tab)</span></a
            >
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid {
  margin-top: 48px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.project {
  flex: 1 1 300px;
  min-height: 260px;
  padding: 28px;
  border: 1px dashed var(--border-3);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.project:not(.filled) h3 {
  color: var(--muted);
}
.project.filled {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
}
h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}
p {
  margin: 0;
  font-size: 16px;
  color: var(--text-2);
}
.links {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 24px;
  font-family: var(--mono);
  font-size: 13px;
}
.links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--accent);
  text-decoration: none;
}
</style>
