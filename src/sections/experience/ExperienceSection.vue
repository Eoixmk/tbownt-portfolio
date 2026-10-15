<script setup lang="ts">
import { experience } from './experience.content'
</script>

<template>
  <section id="experience" class="section">
    <div class="container">
      <div class="eyebrow">{{ experience.eyebrow }}</div>
      <h2 class="h2">{{ experience.title }}</h2>

      <div class="list">
        <article v-for="job in experience.jobs" :key="job.role" class="row">
          <div class="meta">
            <div class="period">{{ job.period }}</div>
            <h3>{{ job.role }}</h3>
            <div class="company">{{ job.company }}</div>
          </div>
          <div class="body">
            <p v-if="job.intro" class="intro">{{ job.intro }}</p>
            <p v-for="(pt, i) in job.points" :key="i" class="point" :class="{ first: !job.intro && i === 0 }">
              {{ pt }}
            </p>
          </div>
        </article>

        <article class="row education">
          <div class="meta">
            <div class="period">{{ experience.education.period }}</div>
            <h3>{{ experience.education.title }}</h3>
          </div>
          <div class="body">
            <p class="point first">{{ experience.education.institution }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.list {
  margin-top: 48px;
}
.row {
  padding: 36px 0;
  border-top: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  gap: 20px 48px;
}
.row.education {
  padding-bottom: 0;
}
.meta {
  flex: 1 1 220px;
}
.period {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--muted);
}
h3 {
  margin: 8px 0 0;
  font-size: 22px;
  font-weight: 600;
}
.company {
  margin-top: 4px;
  font-size: 15px;
  color: var(--text-2);
}
.body {
  flex: 999 1 480px;
  min-width: 0;
}
.intro {
  margin: 0;
  font-size: 16px;
  color: var(--text-2);
}
.point {
  margin: 14px 0 0;
  font-size: 17px;
  color: var(--text-3);
}
.point.first {
  margin-top: 0;
}
</style>
