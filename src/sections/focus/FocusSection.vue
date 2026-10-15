<script setup lang="ts">
import { ref } from 'vue'
import Card from '@/shared/ui/Card.vue'
import { focus } from './focus.content'

type ApiStyle = 'rest' | 'graphql'
const apiStyles: { id: ApiStyle; label: string }[] = [
  { id: 'rest', label: 'REST' },
  { id: 'graphql', label: 'GraphQL' },
]
const apiStyle = ref<ApiStyle>('rest')

/** Splits a GraphQL line into plain text, the operation keyword and the argument list, for light highlighting. */
const tokens = (line: string) =>
  line
    .split(/(\bquery\b|\([^)]*\))/)
    .filter(Boolean)
    .map((text) => ({ text, kind: text === 'query' ? 'kw' : text.startsWith('(') ? 'args' : '' }))
</script>

<template>
  <section id="focus" class="section">
    <div class="container">
      <div class="eyebrow">{{ focus.eyebrow }}</div>
      <h2 class="h2">{{ focus.title }}</h2>

      <div class="bento">
        <Card class="frontend">
          <div class="frontend-copy">
            <div class="label">{{ focus.frontend.label }}</div>
            <h3>{{ focus.frontend.title }}</h3>
            <p>{{ focus.frontend.text }}</p>
          </div>
          <div aria-hidden="true" class="mini-table">
            <div class="mini-head">
              <span v-for="f in focus.frontend.filters" :key="f" class="pill-sm">{{ f }}</span>
              <span class="mini-pag">{{ focus.frontend.pagination }}</span>
            </div>
            <div v-for="r in focus.frontend.rows" :key="r.id" class="mini-row">
              <span class="mini-id">{{ r.id }}</span>
              <span class="mini-pos">{{ r.position }}</span>
              <span class="mini-bar"><span :style="{ width: r.width + '%', background: r.color }"></span></span>
            </div>
          </div>
        </Card>

        <Card class="backend">
          <div class="label">{{ focus.backend.label }}</div>
          <h3>{{ focus.backend.title }}</h3>
          <p>{{ focus.backend.text }}</p>
          <div role="group" aria-label="API style" class="api-switch">
            <button
              v-for="a in apiStyles"
              :key="a.id"
              type="button"
              class="api-opt"
              :class="{ active: a.id === apiStyle }"
              :aria-pressed="a.id === apiStyle"
              @click="apiStyle = a.id"
            >
              {{ a.label }}
            </button>
          </div>
          <!-- Both panels share one grid cell, so the box is as tall as the taller one and nothing is guessed. -->
          <div class="endpoints" role="region" tabindex="0" aria-label="API example">
            <div class="panels">
              <div class="panel" :class="{ inactive: apiStyle !== 'rest' }">
                <div class="code">
                  <div v-for="e in focus.backend.endpoints" :key="e.method + e.path">
                    <span class="method">{{ e.method }}</span> {{ e.path }}
                  </div>
                </div>
                <div class="endpoints-note">{{ focus.backend.note }}</div>
              </div>
              <div class="panel" :class="{ inactive: apiStyle !== 'graphql' }">
                <div class="code">
                  <div v-for="(line, i) in focus.backend.graphql.lines" :key="i" class="gql-line">
                    <span v-for="(t, j) in tokens(line)" :key="j" :class="t.kind">{{ t.text }}</span>
                  </div>
                </div>
                <div class="endpoints-note">{{ focus.backend.graphql.note }}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card class="async">
          <div class="async-copy">
            <div class="label">{{ focus.async.label }}</div>
            <h3>{{ focus.async.title }}</h3>
            <p>{{ focus.async.text }}</p>
          </div>
          <div aria-hidden="true" class="steps">
            <template v-for="(s, i) in focus.async.steps" :key="s">
              <span v-if="i > 0" class="arrow">→</span>
              <span class="step" :class="{ last: i === focus.async.steps.length - 1 }">{{ s }}</span>
            </template>
          </div>
        </Card>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bento {
  margin-top: 48px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
h3 {
  margin: 12px 0 0;
  font-size: 22px;
  font-weight: 600;
}
p {
  margin: 12px 0 0;
  font-size: 16px;
  color: var(--text-2);
}

.frontend {
  flex: 2 1 560px;
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
}
.frontend-copy {
  flex: 1 1 240px;
  min-width: 0;
}
.mini-table {
  flex: 1.3 1 300px;
  min-width: 0;
  align-self: flex-start;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  overflow: hidden;
}
.mini-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
}
.pill-sm {
  padding: 2px 8px;
  border: 1px solid var(--border-2);
  border-radius: 999px;
}
.mini-pag {
  margin-left: auto;
}
.mini-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--grid);
  font-size: 14px;
  color: var(--text-3);
}
.mini-row:last-child {
  border-bottom: 0;
}
.mini-id {
  flex: 0 0 52px;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--text-2);
}
.mini-pos {
  flex: 1 1 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mini-bar {
  flex: 0 0 64px;
  height: 6px;
  border-radius: 3px;
  background: var(--track);
  overflow: hidden;
}
.mini-bar span {
  display: block;
  height: 100%;
}

.backend {
  flex: 1 1 320px;
}
.api-switch {
  margin-top: 20px;
  display: flex;
  gap: 8px;
}
.api-opt {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid var(--border-2);
  background: transparent;
  color: var(--text);
  font-family: var(--mono);
  font-size: 13px;
  cursor: pointer;
}
.api-opt.active {
  border-color: var(--accent);
  background: var(--active-bg);
}
.api-opt:hover {
  border-color: var(--accent);
}
.endpoints {
  margin-top: 12px;
  padding: 14px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-family: var(--mono);
  font-size: 13px;
  line-height: 1.9;
  color: var(--chip);
  overflow-x: auto; /* a long query scrolls inside its box instead of spilling out of it */
}
.panels {
  display: grid;
  width: max-content;
  min-width: 100%;
}
.panel {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
}
.panel.inactive {
  visibility: hidden; /* also removes it from the accessibility tree */
}
.code {
  padding-bottom: 10px;
}
.method,
.kw {
  color: var(--accent);
}
.args {
  color: var(--text-2);
}
.gql-line {
  white-space: pre;
}
/* a caption for the box, not a line of code */
.endpoints-note {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  line-height: 1.5;
  color: var(--muted);
}

.async {
  flex: 1 1 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px 40px;
}
.async-copy {
  flex: 1 1 320px;
  min-width: 0;
}
.steps {
  flex: 1.2 1 360px;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-family: var(--mono);
  font-size: 13px;
}
.step {
  padding: 6px 12px;
  border: 1px solid var(--border-2);
  border-radius: 999px;
  color: var(--chip);
}
.step.last {
  border-color: var(--accent);
  color: var(--text);
}
.arrow {
  color: var(--muted);
}
</style>
