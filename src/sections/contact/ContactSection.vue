<script setup lang="ts">
import { profile } from '@/shared/profile'
import { contact } from './contact.content'
</script>

<template>
  <section id="contact" class="contact">
    <div class="container">
      <div class="eyebrow">{{ contact.eyebrow }}</div>
      <h2>{{ contact.title }}</h2>
      <p>{{ contact.text }}</p>
      <div class="btn-row links">
        <a :href="`mailto:${profile.email}`" class="btn btn-primary">{{ profile.email }}</a>
        <a :href="profile.linkedin" class="btn btn-ghost">LinkedIn</a>
        <a :href="profile.github" class="btn btn-ghost">GitHub</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding: 96px 24px;
  border-top: 1px solid var(--border);
  background: var(--card);
}
h2 {
  margin: 16px 0 0;
  max-width: 820px;
  font-size: clamp(34px, 5vw, 60px);
  line-height: 1.06;
  font-weight: 600;
  letter-spacing: -0.025em;
}
p {
  margin: 24px 0 0;
  max-width: 620px;
  font-size: 18px;
  color: var(--text-2);
}
.links {
  margin-top: 40px;
}
</style>
