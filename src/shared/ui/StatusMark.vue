<script setup lang="ts">
/** A dark glyph on a filled circle, so a status never depends on hue alone. */
defineProps<{ color: string; glyph?: string }>()
</script>

<template>
  <span class="mark" :style="{ background: color }" aria-hidden="true">{{ glyph }}</span>
</template>

<style scoped>
.mark {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  color: var(--bg);
}
</style>
