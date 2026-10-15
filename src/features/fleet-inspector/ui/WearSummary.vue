<script setup lang="ts">
import { computed } from 'vue'
import { fmtKm, type Projection } from '../domain'

const props = defineProps<{ projection: Projection; readings: number }>()

// The limit is rounded to the nearest 1,000 km (five noisy readings do not justify more), and the
// distance left is taken from that rounded figure, so the two numbers on screen always subtract.
const roundedLimit = computed(() =>
  props.projection.limitKm === null ? null : Math.round(props.projection.limitKm / 1000) * 1000,
)
const limitText = computed(() => (roundedLimit.value === null ? '' : `~${fmtKm(roundedLimit.value)}`))
const leftText = computed(() => {
  if (props.projection.pastLimit || roundedLimit.value === null) return 'Past the limit'
  const left = roundedLimit.value - props.projection.currentKm
  return left > 0 ? `~${fmtKm(left)}` : 'At the limit'
})
const wearRate = computed(() => `${(Math.abs(props.projection.slope) * 1000).toFixed(2)} mm per 1,000 km`)
</script>

<template>
  <div class="summary">
    <template v-if="projection.limitKm !== null">
      <div class="stat">
        <div class="stat-label">Estimated replacement at</div>
        <div class="stat-value hero">{{ limitText }}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Left before the limit</div>
        <div class="stat-value">{{ leftText }}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Wear rate</div>
        <div class="stat-value small">{{ wearRate }}</div>
      </div>
    </template>
    <p v-else-if="projection.fit === 'none'" class="empty">At least two readings are needed to fit a wear line.</p>
    <p v-else class="empty">These readings do not give a usable wear trend, so there is nothing to project.</p>

    <div class="confidence">
      <span class="dot"></span>{{ projection.fitLabel }}
      <span v-if="readings >= 2" class="basis">· {{ readings }} readings · R² {{ projection.r2.toFixed(2) }}</span>
    </div>

    <p class="method">Straight-line fit through the lowest tread reading of each inspection.</p>
  </div>
</template>

<style scoped>
/* Reserved height so the card does not resize when a tire has no readings. */
.summary {
  min-height: 330px;
}
.stat + .stat {
  margin-top: 18px;
}
.stat-label {
  font-size: 14px;
  color: var(--text-2);
}
.stat-value {
  margin-top: 2px;
  font-family: var(--mono);
  font-size: 22px;
  font-weight: 500;
  color: var(--text);
}
.stat-value.hero {
  font-size: 34px;
  line-height: 1.15;
}
.stat-value.small {
  font-size: 15px;
  font-weight: 400;
}
.confidence {
  margin-top: 22px;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  padding: 6px 12px;
  border: 1px solid var(--border-3);
  border-radius: 6px;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--text);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--text-2);
}
.basis {
  color: var(--text-2);
}
.method,
.empty {
  margin: 18px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--muted);
}
.empty {
  font-size: 15px;
  color: var(--text-2);
}
</style>
