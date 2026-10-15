<script setup lang="ts">
import { profile } from '@/shared/profile'
</script>

<template>
  <footer class="footer">
    <div class="container inner">
      <span>{{ profile.name }} · {{ profile.role }}</span>
      <span>{{ profile.location }}</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 28px 24px;
  border-top: 1px solid var(--border);
}
.inner {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--muted);
}
</style>
