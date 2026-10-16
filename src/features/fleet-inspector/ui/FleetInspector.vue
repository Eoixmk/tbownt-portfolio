<script setup lang="ts">
import { computed, ref } from 'vue'
import Card from '@/shared/ui/Card.vue'
import StatusMark from '@/shared/ui/StatusMark.vue'
import {
  assess,
  buildTires,
  describeTire,
  findByFinding,
  healthLabel,
  layouts,
  NEW_TREAD_MM,
  pickDefaultTire,
  type Health,
} from '../domain'
import AxleDiagram from './AxleDiagram.vue'
import { healthColor, healthGlyph } from './health-style'
import { inspectorCopy as copy } from './inspector.content'
import TireDetail from './TireDetail.vue'
import WearProjection from './WearProjection.vue'

const layoutId = ref(layouts[1]!.id)
const layout = computed(() => layouts.find((l) => l.id === layoutId.value)!)
const items = computed(() => assess(buildTires(layout.value)))

const selectedId = ref(pickDefaultTire(items.value))
const selected = computed(() => items.value.find((i) => i.tire.id === selectedId.value) ?? items.value[0]!)

function chooseLayout(id: string) {
  layoutId.value = id
  if (!items.value.some((i) => i.tire.id === selectedId.value)) selectedId.value = pickDefaultTire(items.value)
}

// Guided examples: jump to a tire with a given kind of problem. A layout without one simply hides the button.
const examples = computed(() =>
  copy.examples
    .map((example) => ({ ...example, tireId: findByFinding(items.value, example.code) }))
    .filter((example): example is typeof example & { tireId: string } => example.tireId !== undefined),
)

const legend: Health[] = ['ok', 'watch', 'replace']

const announcement = computed(() => {
  const { tire, evaluation } = selected.value
  return `${tire.id}, ${describeTire(tire)}: ${evaluation.label}. Minimum tread ${evaluation.min.toFixed(1)} millimeters.`
})
</script>

<template>
  <section id="inspector" class="section" aria-labelledby="inspector-title">
    <div class="container">
      <div class="eyebrow">{{ copy.eyebrow }}</div>
      <h2 id="inspector-title" class="h2">{{ copy.title }}</h2>
      <p class="lede">{{ copy.lede }}</p>

      <div class="try" role="group" aria-label="Jump to an example">
        <span class="try-label">{{ copy.tryLabel }}</span>
        <button v-for="e in examples" :key="e.code" type="button" class="try-btn" @click="selectedId = e.tireId">
          {{ e.label }}
        </button>
      </div>

      <div class="grid">
        <Card class="layout">
          <h3 class="label label-tracked">1 · CHOOSE A LAYOUT</h3>
          <p class="step-note">{{ copy.steps.layout }}</p>

          <div role="group" aria-label="Vehicle layout" class="picker">
            <button
              v-for="l in layouts"
              :key="l.id"
              type="button"
              class="opt"
              :class="{ active: l.id === layoutId }"
              :aria-pressed="l.id === layoutId"
              @click="chooseLayout(l.id)"
            >
              {{ l.name }}
            </button>
          </div>

          <AxleDiagram :layout="layout" :items="items" :selected-id="selectedId" @select="selectedId = $event" />

          <ul class="legend" role="list" aria-label="Status legend">
            <li v-for="health in legend" :key="health">
              <StatusMark :color="healthColor[health]" :glyph="healthGlyph[health]" />{{ healthLabel(health) }}
            </li>
            <li class="legend-note">Select a tire. Bar = tread left ({{ NEW_TREAD_MM }} mm when new).</li>
          </ul>

          <p class="selected-line">
            <StatusMark
              :color="healthColor[selected.evaluation.health]"
              :glyph="healthGlyph[selected.evaluation.health]"
            />
            <span>
              Selected: {{ selected.tire.id }} · {{ describeTire(selected.tire) }} · {{ selected.evaluation.label }}
            </span>
          </p>

          <div role="group" aria-label="Tires" class="chips-row">
            <button
              v-for="i in items"
              :key="i.tire.id"
              type="button"
              class="tire-chip"
              :class="{ active: i.tire.id === selectedId }"
              :aria-pressed="i.tire.id === selectedId"
              :aria-label="`${i.tire.id}, ${describeTire(i.tire)}, ${i.evaluation.label}`"
              @click="selectedId = i.tire.id"
            >
              <StatusMark :color="healthColor[i.evaluation.health]" :glyph="healthGlyph[i.evaluation.health]" />{{
                i.tire.id
              }}
            </button>
          </div>
        </Card>

        <Card class="side">
          <TireDetail :item="selected" />
        </Card>

        <Card class="wide">
          <WearProjection :tire="selected.tire" />
        </Card>
      </div>

      <div class="hood">
        <span class="hood-label">{{ copy.hood.label }}</span>
        <ul class="hood-list" role="list">
          <li v-for="item in copy.hood.items" :key="item" class="chip">{{ item }}</li>
        </ul>
        <a :href="copy.hood.source.href" target="_blank" rel="noopener" class="hood-link">
          {{ copy.hood.source.label }}<span aria-hidden="true"> ↗</span
          ><span class="sr-only"> (opens in a new tab)</span>
        </a>
      </div>

      <p class="sr-only" aria-live="polite">{{ announcement }}</p>
    </div>
  </section>
</template>

<style scoped>
.lede {
  margin: 20px 0 0;
  max-width: 720px;
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-2);
}
.try {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.try-label {
  margin-right: 4px;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--muted);
}
.try-btn {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--border-3);
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
}
.try-btn:hover {
  border-color: var(--accent);
}
.hood {
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
}
.hood-label {
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.hood-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.hood-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--accent);
  text-decoration: none;
}
.grid {
  --card-pad: 28px;
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.layout {
  flex: 1.7 1 430px; /* narrow enough to share a row with the detail card from ~820px */
}
.side {
  flex: 1 1 320px;
}
.wide {
  flex: 1 1 100%;
}
.picker {
  margin: 16px 0 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.opt,
.tire-chip {
  min-height: 44px;
  border-radius: 8px;
  border: 1px solid var(--border-2);
  background: transparent;
  color: var(--text);
  cursor: pointer;
}
.opt {
  padding: 0 16px;
  font-size: 14px;
}
.tire-chip {
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--mono);
  font-size: 13px;
}
.opt.active,
.tire-chip.active {
  border-color: var(--accent);
  background: var(--active-bg);
}
.opt:hover,
.tire-chip:hover {
  border-color: var(--accent);
}
.legend {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  font-size: 13px;
  color: var(--text-2);
}
.legend li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.legend-note {
  margin-left: auto;
  color: var(--muted);
}
.chips-row {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  align-content: start;
  gap: 6px;
  min-height: 94px; /* two rows, so the card keeps its height across layouts */
}
.tire-chip {
  justify-content: center;
}
.selected-line {
  display: none;
  margin: 12px 0 0;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-2);
}

/* Stacked layout: the detail card is below the diagram, so say what is selected right here. */
@media (max-width: 860px) {
  .selected-line {
    display: flex;
  }
  .chips-row {
    min-height: 144px; /* three rows */
  }
}

@media (max-width: 520px) {
  .grid {
    --card-pad: 20px;
  }
  .picker {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  .opt {
    padding: 0 8px;
    font-size: 13px;
    line-height: 1.25;
  }
  .chips-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .tire-chip {
    padding: 0 6px;
    gap: 6px;
  }
  .legend-note {
    margin-left: 0;
    flex-basis: 100%;
  }
}

/* Very narrow phones: three columns keep every chip inside the card. */
@media (max-width: 360px) {
  .chips-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    min-height: 194px; /* four rows */
  }
}
</style>
