<script setup lang="ts">
import { computed, ref } from 'vue'
import Card from '@/shared/ui/Card.vue'
import StatusMark from '@/shared/ui/StatusMark.vue'
import {
  assess,
  buildTires,
  describeTire,
  healthLabel,
  layouts,
  NEW_TREAD_MM,
  pickDefaultTire,
  type Health,
} from '../domain'
import AxleDiagram from './AxleDiagram.vue'
import { healthColor, healthGlyph } from './health-style'
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

const legend: Health[] = ['ok', 'watch', 'replace']

const announcement = computed(() => {
  const { tire, evaluation } = selected.value
  return `${tire.id}, ${describeTire(tire)}: ${evaluation.label}. Minimum tread ${evaluation.min.toFixed(1)} millimeters.`
})
</script>

<template>
  <section id="inspector" class="section" aria-labelledby="inspector-title">
    <div class="container">
      <div class="eyebrow">Interactive demo</div>
      <h2 id="inspector-title" class="h2">From axle layout to wear projection.</h2>
      <p class="disclaimer">Illustrative data, not client data.</p>

      <div class="grid">
        <Card class="layout">
          <h3 class="label label-tracked">1 · CHOOSE A LAYOUT</h3>

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

      <p class="sr-only" aria-live="polite">{{ announcement }}</p>
    </div>
  </section>
</template>

<style scoped>
.disclaimer {
  margin: 12px 0 0;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--muted);
}
.grid {
  --card-pad: 28px;
  margin-top: 36px;
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
