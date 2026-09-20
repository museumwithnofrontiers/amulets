<script setup>
import { TextPageView } from '@museumwnf/viewer-layout/views'

// Editorial page, shared by every gallery. The whole essay is about MySQL
// boolean full-text operators, which is why composables/gallery.js implements that
// grammar rather than a plain substring match. `back` points at the
// collection entrance, the only page that links here (its own how-to link,
// over the same route name) — the view's `back` is a fixed destination, not
// `router.back()`, so there is no page-agnostic answer.
const searchHowToSpec = {
  body: 'catalogue.search.howToEssay',
  back: { label: 'core.action.back', to: { name: 'collection' } },
}
</script>

<template>
  <TextPageView :spec="searchHowToSpec" class="editorial" />
</template>

<style scoped>
.editorial { background: #fff; width: 100%; min-height: 400px; padding-bottom: 40px; }
.editorial :deep(.mwnf-text-page__back) { padding: 12px 0 0 50px; }
.editorial :deep(.mwnf-prose) { padding: 10px 50px 20px; max-width: 900px; line-height: 1.55; }
</style>