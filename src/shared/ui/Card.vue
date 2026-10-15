<script setup lang="ts">
/**
 * Dark rounded surface used across the page. Padding comes from `--card-pad`,
 * so a parent can adjust it (for example on small screens) without touching this file.
 */
</script>

<template>
  <div class="card"><slot /></div>
</template>

<style scoped>
.card {
  min-width: 0;
  padding: var(--card-pad, 28px);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
}
</style>
