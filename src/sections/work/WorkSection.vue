<script setup lang="ts">
import { work } from './work.content'
import ArchDiagram from './ArchDiagram.vue'
</script>

<template>
  <section id="work" class="section">
    <div class="container">
      <div class="eyebrow">{{ work.eyebrow }}</div>
      <h2 class="h2">{{ work.title }}</h2>

      <div class="list">
        <template v-for="(item, i) in work.items" :key="item.name">
          <article class="item" :class="{ last: i === work.items.length - 1 }">
            <div class="meta">
              <div class="year">{{ item.year }}</div>
              <h3>{{ item.name }}</h3>
              <div class="subtitle">{{ item.subtitle }}</div>
            </div>
            <div class="body">
              <p v-for="(p, j) in item.paragraphs" :key="j" :class="j === 0 ? 'lead' : 'follow'">{{ p }}</p>
              <div class="chips stack">
                <span v-for="s in item.stack" :key="s" class="chip">{{ s }}</span>
              </div>
            </div>
          </article>
          <div v-if="item.diagram" class="diagram">
            <ArchDiagram />
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.list {
  margin-top: 48px;
}
.item {
  padding: 40px 0;
  border-top: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  gap: 24px 48px;
}
.item.last {
  padding-bottom: 0;
}
.meta {
  flex: 1 1 220px;
}
.year {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--muted);
}
h3 {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.subtitle {
  margin-top: 6px;
  font-size: 15px;
  color: var(--text-2);
}
.body {
  flex: 999 1 480px;
  min-width: 0;
}
.body p {
  margin: 0;
  font-size: 17px;
}
.body p.lead {
  color: var(--text-3);
}
.body p.follow {
  margin-top: 14px;
  color: var(--text-2);
}
.stack {
  margin-top: 20px;
}
.diagram {
  padding: 0 0 40px;
}
</style>
