<script setup lang="ts">
import Card from '@/shared/ui/Card.vue'
import { architecture } from './work.content'

// Each node lights up two seconds after the previous one, on a 12 s loop.
const delay = (i: number) => `${-12 + i * 2}s`
</script>

<template>
  <Card class="arch">
    <div class="arch-head">
      <div class="arch-label">{{ architecture.label }}</div>
      <div class="arch-note">{{ architecture.note }}</div>
    </div>
    <div
      class="scroll"
      role="region"
      tabindex="0"
      aria-label="Report generation architecture, scrolls sideways on small screens"
    >
      <div class="inner">
        <div class="grid">
          <div
            v-for="(n, i) in architecture.nodes"
            :key="n.title"
            class="arch-node"
            :style="{ animationDelay: delay(i) }"
          >
            <div class="node-num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="node-title">{{ n.title }}</div>
            <div class="node-text">{{ n.text }}</div>
          </div>
        </div>
        <div aria-hidden="true" class="track">
          <div class="rail"></div>
          <div class="travel">
            <div class="arch-dot"></div>
          </div>
        </div>
      </div>
    </div>
    <p class="caption">{{ architecture.caption }}</p>
  </Card>
</template>

<style scoped>
.arch {
  --card-pad: 24px;
}
.arch-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 6px 24px;
}
.arch-label {
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.06em;
  color: var(--accent);
}
.arch-note {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
}
.scroll {
  margin-top: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.inner {
  min-width: 880px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  column-gap: 28px;
}
.arch-node {
  position: relative;
  padding: 14px 14px 16px;
  border: 1px solid var(--border-2);
  border-radius: 10px;
  background: var(--card);
  animation: archGlow 12s linear infinite;
}
.arch-node:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -28px;
  width: 28px;
  height: 1px;
  background: var(--border-3);
}
.node-num {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
}
.node-title {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}
.node-text {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-2);
}
.track {
  position: relative;
  height: 28px;
  margin-top: 18px;
}
.rail {
  position: absolute;
  left: calc((100% - 140px) / 12);
  right: calc((100% - 140px) / 12);
  top: 13px;
  height: 2px;
  border-radius: 1px;
  background: var(--border-2);
}
.travel {
  position: absolute;
  left: calc((100% - 140px) / 12);
  right: calc((100% - 140px) / 12);
  top: 0;
  height: 28px;
}
.arch-dot {
  position: absolute;
  top: 7px;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 14px var(--accent);
  animation: archDot 12s linear infinite;
}
.caption {
  margin: 16px 0 0;
  font-size: 15px;
  color: var(--text-2);
}

@keyframes archGlow {
  0%,
  15% {
    border-color: var(--accent);
    background: var(--active-bg);
  }
  17%,
  100% {
    border-color: var(--border-2);
    background: var(--card);
  }
}
@keyframes archDot {
  0% {
    left: 0;
    opacity: 1;
  }
  83.33% {
    left: 100%;
    opacity: 1;
  }
  90% {
    left: 100%;
    opacity: 0;
  }
  100% {
    left: 0;
    opacity: 0;
  }
}
</style>
