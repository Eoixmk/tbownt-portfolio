<script setup lang="ts">
import SiteHeader from '@/sections/site-header/SiteHeader.vue'
import HeroSection from '@/sections/hero/HeroSection.vue'
import { FleetInspector } from '@/features/fleet-inspector'
import FocusSection from '@/sections/focus/FocusSection.vue'
import WorkSection from '@/sections/work/WorkSection.vue'
import ProjectsSection from '@/sections/projects/ProjectsSection.vue'
import ExperienceSection from '@/sections/experience/ExperienceSection.vue'
import StackSection from '@/sections/stack/StackSection.vue'
import ContactSection from '@/sections/contact/ContactSection.vue'
import SiteFooter from '@/sections/site-footer/SiteFooter.vue'
</script>

<template>
  <div class="page">
    <SiteHeader />
    <main id="main" tabindex="-1">
      <HeroSection />
      <FleetInspector />
      <FocusSection />
      <WorkSection />
      <ProjectsSection />
      <ExperienceSection />
      <StackSection />
      <ContactSection />
    </main>
    <SiteFooter />
  </div>
</template>
