<script setup lang="ts">
import { stack } from './stack.content'
</script>

<template>
  <section id="stack" class="section">
    <div class="container">
      <div class="eyebrow">{{ stack.eyebrow }}</div>
      <h2 class="h2">{{ stack.title }}</h2>

      <div class="groups">
        <div v-for="g in stack.groups" :key="g.label" class="group">
          <div class="label">{{ g.label }}</div>
          <div class="chips tags">
            <span v-for="item in g.items" :key="item" class="tag">{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.groups {
  margin-top: 48px;
  display: flex;
  flex-wrap: wrap;
  gap: 40px 32px;
}
.group {
  flex: 1 1 320px;
}
.tags {
  margin-top: 16px;
}
.tag {
  padding: 4px 12px;
  border: 1px solid var(--border-2);
  border-radius: 6px;
  font-size: 15px;
  color: var(--text-3);
}
</style>
