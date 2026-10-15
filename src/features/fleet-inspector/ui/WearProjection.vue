<script setup lang="ts">
import { computed } from 'vue'
import { projectWear, type FleetTire } from '../domain'
import WearChart from './WearChart.vue'
import WearSummary from './WearSummary.vue'

const props = defineProps<{ tire: FleetTire }>()

// Fitted once here; the chart and the summary read the same result.
const projection = computed(() => projectWear(props.tire))
</script>

<template>
  <div>
    <h3 class="label label-tracked">3 · PROJECT ITS WEAR</h3>
    <div class="body">
      <WearChart class="chart-col" :tire="tire" :projection="projection" />
      <WearSummary class="summary-col" :projection="projection" :readings="tire.readings.length" />
    </div>
  </div>
</template>

<style scoped>
.body {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 28px 40px;
  align-items: flex-start;
}
.chart-col {
  flex: 2 1 460px;
  min-width: 0;
}
.summary-col {
  flex: 1 1 240px;
  min-width: 0;
}
</style>
