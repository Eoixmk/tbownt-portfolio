<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useElementSize } from '@/shared/composables/useElementSize'
import { fmtKm, LIMIT_MM, NEW_TREAD_MM, WARN_MM, type FleetTire, type Projection } from '../domain'

const props = defineProps<{ tire: FleetTire; projection: Projection }>()

// The chart redraws itself for narrow containers (fewer ticks, larger text) instead of scrolling.
// Below this width the full chart's 11-unit text would render under 10 px.
const COMPACT_BELOW_PX = 580
const FULL = { w: 640, h: 300, l: 52, r: 28, t: 28, b: 44, ticks: 6 }
const COMPACT = { h: 250, l: 40, r: 12, t: 28, b: 44 }
const COMPACT_MIN_WIDTH = 240
const KM_STEPS = [10_000, 20_000, 25_000, 50_000, 100_000, 200_000]
const MAX_KM = 600_000
const MIN_KM = 50_000
const Y_TICKS = Array.from({ length: 5 }, (_, i) => (i * NEW_TREAD_MM) / 4)

const chartEl = ref<HTMLElement | null>(null)
const { width } = useElementSize(chartEl)
const compact = computed(() => width.value > 0 && width.value < COMPACT_BELOW_PX)

// Compact: the viewBox is as wide as the container, so one unit is one pixel and text keeps its size.
const view = computed(() =>
  compact.value
    ? { ...COMPACT, w: Math.max(COMPACT_MIN_WIDTH, Math.round(width.value)), ticks: width.value < 340 ? 3 : 4 }
    : FULL,
)
const plotW = computed(() => view.value.w - view.value.l - view.value.r)
const plotH = computed(() => view.value.h - view.value.t - view.value.b)

const readings = computed(() => props.tire.readings)
const hasLine = computed(() => props.projection.fit !== 'none' && props.projection.slope < 0)

const rawMaxKm = computed(() =>
  Math.min(MAX_KM, Math.max(props.projection.currentKm * 1.15, (props.projection.limitKm ?? 0) * 1.08, MIN_KM)),
)
const xStep = computed(() => KM_STEPS.find((s) => rawMaxKm.value / s <= view.value.ticks) ?? KM_STEPS.at(-1)!)
const xMax = computed(() => Math.ceil(rawMaxKm.value / xStep.value) * xStep.value)
const xTicks = computed(() => Array.from({ length: xMax.value / xStep.value + 1 }, (_, i) => i * xStep.value))

const sx = (km: number) => view.value.l + (Math.max(0, Math.min(km, xMax.value)) / xMax.value) * plotW.value
const sy = (mm: number) => view.value.t + (1 - Math.max(0, Math.min(NEW_TREAD_MM, mm)) / NEW_TREAD_MM) * plotH.value
const trend = (km: number) => props.projection.intercept + props.projection.slope * km

const paths = computed(() => {
  const { currentKm: k, limitKm, pastLimit } = props.projection
  const start = `M${sx(0)},${sy(trend(0))} L${sx(k)},${sy(trend(k))}`
  return {
    solid: start,
    area: `${start} L${sx(k)},${sy(0)} L${sx(0)},${sy(0)} Z`,
    dashed:
      limitKm !== null && !pastLimit && limitKm <= xMax.value
        ? `M${sx(k)},${sy(trend(k))} L${sx(limitKm)},${sy(LIMIT_MM)}`
        : null,
  }
})

const thousands = (km: number) => `${Math.round(km / 1000)}K`
const marker = computed(() => {
  const km = props.projection.limitKm
  if (km === null || km > xMax.value) return null
  const x = sx(km)
  const nearLeft = x < view.value.l + 80
  return {
    x,
    labelX: nearLeft ? x + 10 : x - 10,
    anchor: nearLeft ? 'start' : 'end',
    text: `${props.projection.pastLimit ? 'crossed at ' : '~'}${thousands(km)} km`,
  }
})

const hovered = ref<number | null>(null)
watch(
  () => props.tire.id,
  () => (hovered.value = null),
)
const tip = computed(() => {
  if (hovered.value === null) return null
  const r = readings.value[hovered.value]
  if (!r) return null
  const x = sx(r.km) / view.value.w
  const y = sy(r.depth) / view.value.h
  return {
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    below: y < 0.3, // flip under the point when it is near the top edge
    align: x < 0.18 ? 'start' : x > 0.82 ? 'end' : 'center',
    n: hovered.value + 1,
    ...r,
  }
})
</script>

<template>
  <div>
    <div ref="chartEl" class="chart" :class="{ compact }">
      <svg
        :viewBox="`0 0 ${view.w} ${view.h}`"
        role="img"
        :aria-label="`Tread depth against mileage for ${tire.id}. ${projection.fitLabel}.`"
      >
        <rect :x="view.l" :y="sy(WARN_MM)" :width="plotW" :height="sy(LIMIT_MM) - sy(WARN_MM)" class="band-warn" />
        <rect :x="view.l" :y="sy(LIMIT_MM)" :width="plotW" :height="sy(0) - sy(LIMIT_MM)" class="band-limit" />

        <g class="axes">
          <template v-for="v in Y_TICKS" :key="v">
            <line :x1="view.l" :x2="view.w - view.r" :y1="sy(v)" :y2="sy(v)" class="grid" />
            <text :x="view.l - 8" :y="sy(v) + 4" text-anchor="end">{{ v }}</text>
          </template>
          <text v-for="km in xTicks" :key="km" :x="sx(km)" :y="view.h - 24" text-anchor="middle">
            {{ km === 0 ? '0' : thousands(km) }}
          </text>
          <text x="4" y="12" text-anchor="start">Tread (mm)</text>
          <text :x="view.w - view.r" :y="view.h - 5" text-anchor="end">Mileage (km)</text>
        </g>

        <line :x1="view.l" :x2="view.w - view.r" :y1="sy(LIMIT_MM)" :y2="sy(LIMIT_MM)" class="limit" />
        <text :x="view.l + 8" :y="sy(LIMIT_MM) - 7" class="limit-label">Limit · {{ LIMIT_MM }} mm</text>
        <text :x="view.w - view.r - 8" :y="sy(WARN_MM) + 15" text-anchor="end" class="limit-label">
          Warning · {{ WARN_MM }} mm
        </text>

        <template v-if="hasLine">
          <line :x1="sx(projection.currentKm)" :x2="sx(projection.currentKm)" :y1="view.t" :y2="sy(0)" class="now" />
          <text :x="sx(projection.currentKm)" :y="view.t - 8" text-anchor="middle" class="now-label">now</text>
          <path :d="paths.area" class="area" />
          <path :d="paths.solid" class="trend" />
          <path v-if="paths.dashed" :d="paths.dashed" class="trend projected" />
          <template v-if="marker">
            <line :x1="marker.x" :x2="marker.x" :y1="sy(LIMIT_MM)" :y2="sy(0)" class="drop" />
            <circle :cx="marker.x" :cy="sy(LIMIT_MM)" r="5" class="limit-dot" />
            <text :x="marker.labelX" :y="sy(LIMIT_MM) + 22" :text-anchor="marker.anchor" class="limit-km">
              {{ marker.text }}
            </text>
          </template>
        </template>

        <template v-for="(r, i) in readings" :key="`${r.km}-${i}`">
          <circle :cx="sx(r.km)" :cy="sy(r.depth)" r="6.5" class="ring" />
          <circle :cx="sx(r.km)" :cy="sy(r.depth)" r="4.5" class="point" />
          <circle
            :cx="sx(r.km)"
            :cy="sy(r.depth)"
            r="22"
            class="hit"
            @pointerenter="hovered = i"
            @pointerleave="hovered = null"
            @click="hovered = i"
          />
        </template>

        <text v-if="projection.fit === 'none'" :x="view.w / 2" :y="view.h / 2" text-anchor="middle" class="empty-note">
          No readings yet: nothing to project.
        </text>
      </svg>

      <div
        v-if="tip"
        class="tip"
        :class="[`align-${tip.align}`, { below: tip.below }]"
        :style="{ left: tip.left, top: tip.top }"
      >
        <span class="tip-n">Reading {{ tip.n }}</span>
        {{ fmtKm(tip.km) }} · {{ tip.depth.toFixed(1) }} mm
      </div>
    </div>

    <details class="table-view">
      <summary>View data table</summary>
      <table>
        <caption class="sr-only">
          Tread readings for
          {{
            tire.id
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Mileage</th>
            <th scope="col">Min tread</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in readings" :key="`${r.km}-${i}`">
            <td>{{ i + 1 }}</td>
            <td>{{ fmtKm(r.km) }}</td>
            <td>{{ r.depth.toFixed(1) }} mm</td>
          </tr>
          <tr v-if="!readings.length">
            <td colspan="3">No readings yet</td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>

<style scoped>
.chart {
  position: relative;
}
svg {
  display: block;
  width: 100%;
  height: auto;
}

/* chart marks */
.axes text {
  font-family: var(--mono);
  font-size: 11px;
  fill: var(--muted);
}
.grid {
  stroke: var(--grid);
  stroke-width: 1;
}
.band-warn {
  fill: var(--warn);
  fill-opacity: 0.06;
}
.band-limit {
  fill: var(--danger);
  fill-opacity: 0.07;
}
.limit {
  stroke: var(--danger);
  stroke-width: 1.5;
}
.limit-label,
.now-label {
  font-family: var(--mono);
  font-size: 11px;
  fill: var(--text-2);
}
.now {
  stroke: var(--border-3);
  stroke-width: 1;
}
.area {
  fill: var(--accent);
  fill-opacity: 0.1;
}
.trend {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.trend.projected {
  stroke-dasharray: 6 5;
  opacity: 0.75;
}
.drop {
  stroke: var(--border-2);
  stroke-width: 1;
}
.limit-dot {
  fill: var(--card);
  stroke: var(--accent);
  stroke-width: 2;
}
.limit-km {
  font-family: var(--mono);
  font-size: 12px;
  fill: var(--text);
}
.ring {
  fill: var(--card);
}
.point {
  fill: var(--accent);
}
.hit {
  fill: transparent;
  cursor: pointer;
}
.empty-note {
  font-size: 15px;
  fill: var(--text-2);
}

.tip {
  position: absolute;
  padding: 6px 10px;
  background: var(--bg);
  border: 1px solid var(--border-2);
  border-radius: 8px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text);
  white-space: nowrap;
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 14px));
}
.tip.below {
  transform: translate(-50%, 14px);
}
.tip.align-start {
  transform: translate(-14px, calc(-100% - 14px));
}
.tip.align-end {
  transform: translate(calc(-100% + 14px), calc(-100% - 14px));
}
.tip.below.align-start {
  transform: translate(-14px, 14px);
}
.tip.below.align-end {
  transform: translate(calc(-100% + 14px), 14px);
}
.tip-n {
  display: block;
  color: var(--muted);
}

.table-view {
  margin-top: 14px;
  font-size: 14px;
  color: var(--text-2);
}
.table-view summary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border-2);
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--text-3);
}
.table-view summary:hover {
  border-color: var(--accent);
}
.table-view summary::before {
  content: '▸';
  font-size: 10px;
  transition: transform 0.15s ease-out;
}
.table-view[open] summary::before {
  transform: rotate(90deg);
}
.table-view table {
  margin-top: 10px;
}
.table-view table {
  width: 100%;
  max-width: 420px;
  border-collapse: collapse;
  font-family: var(--mono);
  font-size: 13px;
}
.table-view th,
.table-view td {
  padding: 6px 10px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.table-view th {
  color: var(--muted);
  font-weight: 400;
}
.table-view td {
  color: var(--text-3);
}
</style>
