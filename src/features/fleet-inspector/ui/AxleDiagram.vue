<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useElementSize } from '@/shared/composables/useElementSize'
import { axleLabel, NEW_TREAD_MM, type Assessed, type Layout } from '../domain'
import {
  BODY_START,
  createProjector,
  HORIZONTAL_CENTER,
  HORIZONTAL_HEIGHT,
  layoutGeometry,
  MAX_SCALE,
  tireBoxes,
  vehicleBody,
  VERTICAL_CENTER,
  viewSize,
  type Orientation,
} from './axle-geometry'
import { healthColor, healthGlyph } from './health-style'

const props = defineProps<{
  layout: Layout
  items: Assessed[]
  selectedId: string
}>()
const emit = defineEmits<{ select: [id: string] }>()

/** Below this card width the vehicle is drawn front-up, so nothing ever scrolls sideways. */
const VERTICAL_BELOW_PX = 560

const root = ref<HTMLElement | null>(null)
const { width } = useElementSize(root)
const vertical = computed(() => width.value > 0 && width.value < VERTICAL_BELOW_PX)
const orientation = computed<Orientation>(() => (vertical.value ? 'vertical' : 'horizontal'))

const geometry = computed(() => layoutGeometry(props.layout, orientation.value))
const projector = computed(() => createProjector(orientation.value))
const size = computed(() => viewSize(geometry.value, orientation.value))
const viewBox = computed(() => `0 0 ${size.value.width} ${size.value.height}`)
const maxWidth = computed(() => size.value.width * MAX_SCALE[orientation.value])

const body = computed(() => vehicleBody(geometry.value, projector.value))

const tires = computed(() => {
  const boxes = tireBoxes(
    geometry.value,
    props.items.map((i) => i.tire),
    projector.value,
  )
  return props.items.map(({ tire, evaluation }) => {
    const box = boxes.get(tire.id)!
    const barMax = box.w - 12
    return {
      tire,
      box,
      label: tire.kind === 'spare' ? 'SP' : tire.id,
      color: healthColor[evaluation.health],
      glyph: healthGlyph[evaluation.health],
      barMax,
      barW: barMax * Math.max(0, Math.min(1, evaluation.min / NEW_TREAD_MM)),
    }
  })
})

const axleMarks = computed(() =>
  geometry.value.axles.map((a) => {
    const span = a.dual ? 84 : 52
    const { place, point } = projector.value
    return {
      ...a,
      bar: place(a.at - 2, 4, -span, span * 2),
      badge: point(a.at),
      caption: vertical.value
        ? { x: 6, y: a.at + 4, anchor: 'start' }
        : { x: a.at, y: HORIZONTAL_HEIGHT - 12, anchor: 'middle' },
    }
  }),
)
// Beside the nose of the cab, not floating above the drawing.
const frontLabel = computed(() =>
  vertical.value
    ? { x: VERTICAL_CENTER, y: 14, anchor: 'middle' }
    : { x: BODY_START, y: HORIZONTAL_CENTER - 52, anchor: 'start' },
)

// Hover selects, but only for a real mouse, and only after a short pause, so sweeping the
// pointer across the page (or scrolling under it) does not flip the detail panels.
const HOVER_INTENT_MS = 120
let intent: ReturnType<typeof setTimeout> | undefined
function hoverSelect(id: string, event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  clearTimeout(intent)
  intent = setTimeout(() => emit('select', id), HOVER_INTENT_MS)
}
const cancelHover = () => clearTimeout(intent)
onBeforeUnmount(cancelHover)
</script>

<template>
  <div ref="root" class="wrap" :class="{ vertical }">
    <svg class="diagram" :viewBox="viewBox" :style="{ maxWidth: maxWidth + 'px' }" aria-hidden="true">
      <!-- cab, hood and mirrors -->
      <rect :x="body.hood.x" :y="body.hood.y" :width="body.hood.w" :height="body.hood.h" rx="8" class="cab" />
      <rect :x="body.cab.x" :y="body.cab.y" :width="body.cab.w" :height="body.cab.h" rx="10" class="cab" />
      <rect v-for="(m, i) in body.mirrors" :key="i" :x="m.x" :y="m.y" :width="m.w" :height="m.h" rx="2" class="cab" />
      <line
        :x1="body.windshield[0]!.x"
        :y1="body.windshield[0]!.y"
        :x2="body.windshield[1]!.x"
        :y2="body.windshield[1]!.y"
        class="glass"
      />
      <text :x="frontLabel.x" :y="frontLabel.y" :text-anchor="frontLabel.anchor" class="caption">FRONT</text>

      <!-- chassis -->
      <rect
        :x="body.tractorRail.x"
        :y="body.tractorRail.y"
        :width="body.tractorRail.w"
        :height="body.tractorRail.h"
        rx="4"
        class="rail"
      />
      <template v-if="body.trailerBody && body.trailerRail && body.link && body.kingpin">
        <line :x1="body.link[0]!.x" :y1="body.link[0]!.y" :x2="body.link[1]!.x" :y2="body.link[1]!.y" class="link" />
        <rect
          :x="body.trailerBody.x"
          :y="body.trailerBody.y"
          :width="body.trailerBody.w"
          :height="body.trailerBody.h"
          rx="6"
          class="trailer"
        />
        <rect
          :x="body.trailerRail.x"
          :y="body.trailerRail.y"
          :width="body.trailerRail.w"
          :height="body.trailerRail.h"
          rx="4"
          class="rail"
        />
        <circle :cx="body.kingpin.x" :cy="body.kingpin.y" r="5" class="kingpin" />
      </template>

      <!-- axles -->
      <g v-for="a in axleMarks" :key="a.number">
        <rect :x="a.bar.x" :y="a.bar.y" :width="a.bar.w" :height="a.bar.h" class="axle" />
        <circle :cx="a.badge.x" :cy="a.badge.y" r="12" class="badge-bg" />
        <text :x="a.badge.x" :y="a.badge.y + 4" text-anchor="middle" class="badge">{{ a.number }}</text>
        <text :x="a.caption.x" :y="a.caption.y" :text-anchor="a.caption.anchor" class="caption">
          {{ axleLabel(a.kind).toUpperCase() }}
        </text>
      </g>

      <!-- tires: pointer-only here; the button list under the diagram is the keyboard path -->
      <g
        v-for="t in tires"
        :key="t.tire.id"
        class="tire"
        :class="{ selected: t.tire.id === selectedId }"
        @pointerenter="hoverSelect(t.tire.id, $event)"
        @pointerleave="cancelHover"
        @click="emit('select', t.tire.id)"
      >
        <rect :x="t.box.x - 4" :y="t.box.y - 4" :width="t.box.w + 8" :height="t.box.h + 8" class="hit" />
        <rect
          v-if="t.tire.id === selectedId"
          :x="t.box.x - 4"
          :y="t.box.y - 4"
          :width="t.box.w + 8"
          :height="t.box.h + 8"
          rx="9"
          class="ring"
        />
        <rect
          :x="t.box.x"
          :y="t.box.y"
          :width="t.box.w"
          :height="t.box.h"
          rx="6"
          class="rubber"
          :style="{ stroke: t.color }"
        />
        <rect
          :x="t.box.x"
          :y="t.box.y"
          :width="t.box.w"
          :height="t.box.h"
          rx="6"
          class="tint"
          :style="{ fill: t.color }"
        />
        <text :x="t.box.x + t.box.w / 2" :y="t.box.y + t.box.h / 2 - 2" text-anchor="middle" class="code">
          {{ t.label }}
        </text>
        <rect
          :x="t.box.x + (t.box.w - t.barMax) / 2"
          :y="t.box.y + t.box.h - 9"
          :width="t.barMax"
          height="4"
          rx="2"
          class="track"
        />
        <rect
          class="bar"
          :x="t.box.x + (t.box.w - t.barMax) / 2"
          :y="t.box.y + t.box.h - 9"
          :width="t.barW"
          height="4"
          rx="2"
          :style="{ fill: t.color }"
        />
        <g v-if="t.glyph" class="flag">
          <circle :cx="t.box.x + t.box.w - 2" :cy="t.box.y + 2" r="8" :style="{ fill: t.color }" />
          <text :x="t.box.x + t.box.w - 2" :y="t.box.y + 6" text-anchor="middle">{{ t.glyph }}</text>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  justify-content: center;
}
/* Horizontal drawings scale up to 1.3x (262 x 1.3), shorter layouts less: reserve the tallest. */
.wrap:not(.vertical) {
  align-items: center;
  min-height: 341px;
}
.diagram {
  display: block;
  flex: 1 1 auto;
  width: 100%;
  height: auto;
}

.cab,
.rail,
.trailer,
.axle {
  stroke-width: 1.5;
}
.cab {
  fill: var(--rubber);
  stroke: var(--border-3);
}
.glass {
  stroke: var(--border-3);
  stroke-width: 2;
}
.rail {
  fill: var(--rail);
  stroke: var(--border-3);
}
.trailer {
  fill: var(--trailer-body);
  stroke: var(--border-2);
}
.link {
  stroke: var(--border-3);
  stroke-width: 3;
}
.kingpin {
  fill: var(--border-3);
}
.axle {
  fill: var(--border-3);
  stroke: none;
}
.badge-bg {
  fill: var(--bg);
  stroke: var(--border-3);
}

.caption {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 1px;
  fill: var(--muted);
}
.badge {
  font-family: var(--mono);
  font-size: 12px;
  fill: var(--text-2);
}
.code {
  font-family: var(--mono);
  font-size: 11px;
  fill: var(--text);
  pointer-events: none;
}

.tire {
  cursor: pointer;
}
.hit {
  fill: transparent;
}
.rubber {
  fill: var(--rubber);
  stroke-width: 1.5;
  transition:
    fill 0.2s ease-out,
    stroke-width 0.2s ease-out;
}
.tire:hover .rubber {
  fill: var(--rubber-hi);
  stroke-width: 2;
}
.tire.selected .rubber {
  fill: var(--rubber-hi);
  stroke-width: 2.5;
}
.tint {
  opacity: 0.1;
  pointer-events: none;
}
.ring {
  fill: none;
  stroke: var(--text);
  stroke-width: 1.5;
}
.track {
  fill: var(--track);
}
.bar {
  transition: width 0.25s ease-out;
  pointer-events: none;
}
.flag text {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  fill: var(--bg);
  pointer-events: none;
}
</style>
