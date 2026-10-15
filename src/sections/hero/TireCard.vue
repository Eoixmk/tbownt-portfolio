<script setup lang="ts">
import Card from '@/shared/ui/Card.vue'
import { computed, ref } from 'vue'
import { tires } from './hero.content'

const CIRCUMFERENCE = 2 * Math.PI * 84
const TREAD_MAX_MM = 16

const selected = ref(0)

const cur = computed(() => {
  const t = tires[selected.value]!
  const treadPct = Math.round((t.tread / TREAD_MAX_MM) * 100)
  const treadText = `${t.tread.toFixed(1)} mm`
  return {
    ...t,
    color: t.color ?? 'var(--accent)',
    treadText,
    dash: `${((treadPct / 100) * CIRCUMFERENCE).toFixed(1)} 600`,
    aria: `${t.label}, ${t.position}, ${t.status}, tread depth ${t.tread.toFixed(1)} millimeters`,
    rows: [
      { label: 'Mileage', value: t.mileage, w: `${t.mileagePct}%` },
      { label: 'Pressure', value: t.pressure, w: `${t.pressurePct}%` },
      { label: 'Tread depth', value: treadText, w: `${treadPct}%` },
    ],
  }
})
</script>

<template>
  <Card class="hero-card">
    <div class="head">
      <div class="title">TIRE LIFECYCLE</div>
      <div class="note">Illustrative data, not client data</div>
    </div>

    <div role="group" aria-label="Choose a tire" class="picker">
      <button
        v-for="(t, i) in tires"
        :key="t.label"
        type="button"
        class="tire-btn"
        :class="{ active: i === selected }"
        :aria-pressed="i === selected"
        @click="selected = i"
        @mouseenter="selected = i"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="body">
      <div class="ring">
        <svg viewBox="0 0 200 200" width="170" height="170" role="img" :aria-label="cur.aria">
          <circle cx="100" cy="100" r="84" fill="none" stroke="var(--track)" stroke-width="28" />
          <circle
            class="tread"
            cx="100"
            cy="100"
            r="84"
            fill="none"
            :stroke="cur.color"
            stroke-width="28"
            :stroke-dasharray="cur.dash"
            transform="rotate(-90 100 100)"
          />
          <circle cx="100" cy="100" r="62" fill="var(--bg)" stroke="var(--border-2)" stroke-width="2" />
          <text x="100" y="102" text-anchor="middle" class="ring-value">
            {{ cur.treadText }}
          </text>
          <text x="100" y="124" text-anchor="middle" class="ring-label">tread depth</text>
        </svg>
      </div>

      <div class="details">
        <div class="status" :style="{ borderColor: cur.color }">
          <span class="status-dot" :style="{ background: cur.color }"></span>{{ cur.status }}
        </div>
        <div class="position">{{ cur.position }}</div>
        <div v-for="r in cur.rows" :key="r.label" class="row">
          <div class="row-head">
            <span>{{ r.label }}</span
            ><span class="row-value">{{ r.value }}</span>
          </div>
          <div class="gauge">
            <div class="gauge-fill" :style="{ width: r.w, background: cur.color }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="hint">Hover or tap a tire to see its lifecycle: status, mileage, pressure and tread depth.</div>
  </Card>
</template>

<style scoped>
.hero-card {
  --card-pad: 24px;
}
.head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 6px 16px;
}
.title {
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.06em;
  color: var(--accent);
}
.picker {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tire-btn {
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
.tire-btn.active {
  border-color: var(--accent);
  background: var(--active-bg);
}
.tire-btn:hover,
.tire-btn:focus-visible {
  border-color: var(--accent);
}
.body {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px 24px;
  align-items: center;
}
.ring {
  flex: 0 0 auto;
  margin: 0 auto;
}
.ring-value {
  font-family: var(--mono);
  font-size: 24px;
  fill: var(--text);
}
.ring-label {
  font-family: var(--sans);
  font-size: 12px;
  fill: var(--text-2);
}
.tread {
  transition:
    stroke-dasharray 0.6s ease,
    stroke 0.3s ease;
}
.details {
  flex: 1 1 200px;
  min-width: 0;
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border: 1px solid;
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--text);
}
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.position {
  margin-top: 10px;
  font-size: 15px;
  color: var(--text-2);
}
.row {
  margin-top: 14px;
}
.row-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: var(--text-2);
}
.row-value {
  font-family: var(--mono);
  color: var(--text);
}
.gauge {
  margin-top: 6px;
  height: 6px;
  border-radius: 3px;
  background: var(--track);
  overflow: hidden;
}
.gauge-fill {
  height: 100%;
  transition:
    width 0.6s ease,
    background 0.3s ease;
}
.hint {
  margin-top: 18px;
  font-size: 13px;
  color: var(--muted);
}
</style>
