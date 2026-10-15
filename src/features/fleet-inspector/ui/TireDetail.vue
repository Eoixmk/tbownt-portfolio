<script setup lang="ts">
import { computed } from 'vue'
import {
  describeTire,
  fmtKm,
  LIMIT_MM,
  NEW_TREAD_MM,
  pressureInRange,
  treadZone,
  WARN_MM,
  type Assessed,
} from '../domain'
import { KM_SCALE, PRESSURE_SCALE_PSI } from './gauge-scales'
import { healthColor } from './health-style'

const props = defineProps<{ item: Assessed }>()

const tire = computed(() => props.item.tire)
const evaluation = computed(() => props.item.evaluation)
const color = computed(() => healthColor[evaluation.value.health])

const toPct = (value: number, max: number) => Math.max(0, Math.min(100, (value / max) * 100))
const zoneColor = (mm: number) => healthColor[treadZone(mm)]

const gauges = computed(() => {
  const { outer, center, inner } = tire.value.depths
  return [
    { label: 'Outer', mm: outer },
    { label: 'Center', mm: center },
    { label: 'Inner', mm: inner },
  ].map((g) => ({ ...g, pct: toPct(g.mm, NEW_TREAD_MM), color: zoneColor(g.mm), isMin: g.mm === evaluation.value.min }))
})

const pressure = computed(() => ({
  from: toPct(tire.value.minPressure, PRESSURE_SCALE_PSI),
  span: toPct(tire.value.maxPressure - tire.value.minPressure, PRESSURE_SCALE_PSI),
  at: toPct(tire.value.pressure, PRESSURE_SCALE_PSI),
  ok: pressureInRange(tire.value),
}))
const kmPct = computed(() => toPct(tire.value.km, KM_SCALE))

// Zone boundaries of the tread scale, shared by the threshold ticks and their labels.
const zones = {
  '--zone-limit': `${toPct(LIMIT_MM, NEW_TREAD_MM)}%`,
  '--zone-warn': `${toPct(WARN_MM, NEW_TREAD_MM)}%`,
}
</script>

<template>
  <div :style="zones">
    <h3 class="label label-tracked">2 · INSPECT A TIRE</h3>

    <div class="ident">
      <div class="code">{{ tire.id }}</div>
      <div>
        <div class="title">{{ describeTire(tire) }}</div>
        <div class="sub">Retreads: {{ tire.retreads }}</div>
      </div>
    </div>

    <div class="status-row">
      <div class="status" :style="{ borderColor: color }">
        <span class="dot" :style="{ background: color }"></span>{{ evaluation.label }}
      </div>
    </div>

    <div class="findings">
      <ul v-if="evaluation.flags.length" class="flags">
        <li v-for="f in evaluation.flags" :key="f">{{ f }}</li>
      </ul>
      <p v-else class="clear">No findings: wear is even and pressure is in range.</p>
    </div>

    <div class="gauges" role="group" aria-label="Tread depth at three points">
      <div class="scale" aria-hidden="true">
        <span class="t-top">{{ NEW_TREAD_MM }}</span>
        <span class="t-warn">{{ WARN_MM }}</span>
        <span class="t-limit">{{ LIMIT_MM }}</span>
      </div>
      <div class="ticks" aria-hidden="true">
        <span class="tick-line warn"></span>
        <span class="tick-line limit"></span>
      </div>
      <div v-for="g in gauges" :key="g.label" class="gauge">
        <div class="mm" :class="{ min: g.isMin }">{{ g.mm.toFixed(1) }}<small> mm</small></div>
        <div class="pill" aria-hidden="true">
          <div class="fill" :style="{ height: `${g.pct}%`, background: g.color }"></div>
          <div class="marker" :style="{ bottom: `${g.pct}%` }"></div>
        </div>
        <div class="gl">{{ g.label }}</div>
      </div>
    </div>
    <div class="caption">Limit {{ LIMIT_MM }} mm · warning {{ WARN_MM }} mm</div>

    <div class="row">
      <div class="row-head">
        <span>Pressure</span><span class="val">{{ tire.pressure }} psi</span>
      </div>
      <div class="track">
        <div class="band" :style="{ left: `${pressure.from}%`, width: `${pressure.span}%` }"></div>
        <div class="tick" :class="{ out: !pressure.ok }" :style="{ left: `${pressure.at}%` }"></div>
      </div>
      <div class="hint">target range {{ tire.minPressure }}–{{ tire.maxPressure }} psi</div>
    </div>

    <div class="row">
      <div class="row-head">
        <span>Mileage</span><span class="val">{{ fmtKm(tire.km) }}</span>
      </div>
      <div class="track"><div class="fillbar" :style="{ width: `${kmPct}%` }"></div></div>
    </div>
  </div>
</template>

<style scoped>
/*
 * Blocks are sized in `lh`/`em` or fixed px so that switching tires never moves
 * anything: the findings area always reserves three lines, and gauge columns
 * and value labels have fixed widths.
 */
.ident {
  margin-top: 18px;
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.code {
  flex: 0 0 auto;
  font-family: var(--mono);
  font-size: 28px;
  font-weight: 500;
  color: var(--text);
}
.title {
  font-size: 16px;
  line-height: 1.3;
  color: var(--text);
}
.sub {
  margin-top: 2px;
  font-size: 14px;
  color: var(--text-2);
}

.status-row {
  margin-top: 14px;
  min-height: 32px;
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid;
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--text);
  transition: border-color 0.25s ease-out;
}
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.findings {
  margin-top: 8px;
  min-height: 63px; /* fallback for browsers without the lh unit */
  min-height: 3lh;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-2);
}
.flags {
  margin: 0;
  padding-left: 18px;
}
.clear {
  margin: 0;
}

.gauges {
  position: relative;
  margin-top: 16px;
  height: 171px;
  display: flex;
  gap: 12px;
  /* scale (22) + three gauges (64) + gaps (12) + a little air: the threshold lines stop at the last gauge */
  width: min(100%, 266px);
}
.scale {
  position: relative;
  flex: 0 0 22px;
  margin-top: 30px; /* value label (22px) + gap (8px) */
  height: 120px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
}
.scale span {
  position: absolute;
  right: 0;
  transform: translateY(50%);
}
.t-top {
  bottom: 100%;
}
.t-warn {
  bottom: var(--zone-warn);
}
.t-limit {
  bottom: var(--zone-limit);
}
/* thresholds drawn across all three gauges */
.ticks {
  position: absolute;
  left: 34px;
  right: 0;
  top: 30px;
  height: 120px;
  pointer-events: none;
}
.tick-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 1px solid var(--border-3);
  border-top-color: color-mix(in srgb, var(--text) 28%, transparent);
}
.tick-line.warn {
  bottom: var(--zone-warn);
}
.tick-line.limit {
  bottom: var(--zone-limit);
}
.gauge {
  flex: 1 1 0;
  min-width: 0;
  max-width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.mm {
  height: 22px;
  font-family: var(--mono);
  font-size: 15px;
  line-height: 22px;
  color: var(--text-2);
  white-space: nowrap;
}
.mm.min {
  color: var(--text);
  font-weight: 500;
}
.mm small {
  font-size: 11px;
  color: var(--muted);
}
.pill {
  position: relative;
  flex: 0 0 120px;
  width: 24px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--track);
}
.fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  transition:
    height 0.3s ease-out,
    background 0.25s ease-out;
}
.marker {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  margin-bottom: -1.5px;
  background: var(--text);
  transition: bottom 0.3s ease-out;
}
.gl {
  font-size: 13px;
  line-height: 1;
  color: var(--text-2);
}
.caption {
  min-height: 21px;
  min-height: 1.5lh;
  margin-top: 10px;
  font-size: 13px;
  color: var(--muted);
}

.row {
  margin-top: 16px;
  min-height: 56px;
}
.row-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  line-height: 21px;
  color: var(--text-2);
}
.val {
  font-family: var(--mono);
  color: var(--text);
  white-space: nowrap;
}
.track {
  position: relative;
  margin-top: 6px;
  height: 6px;
  border-radius: 3px;
  background: var(--track);
  overflow: hidden;
}
.band {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--border-3);
}
.tick {
  position: absolute;
  top: -1px;
  bottom: -1px;
  width: 3px;
  margin-left: -1.5px;
  border-radius: 2px;
  background: var(--text);
  transition: left 0.3s ease-out;
}
/* pressure is only coloured when it is out of range */
.tick.out {
  background: var(--warn);
}
.fillbar {
  height: 100%;
  background: var(--text-2);
  transition: width 0.3s ease-out;
}
.hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
}
</style>
