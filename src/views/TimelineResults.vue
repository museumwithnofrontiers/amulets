<script setup>
import { BackLink } from '@museumwnf/viewer-layout/content'
import { TimelineResultsView } from '@museumwnf/viewer-layout/views'
import { timelineResults } from '../composables/gallery.js'

// Timeline results, on the platform's composed timeline view: the filters in
// the URL, the country and period controls, the events list, its pagination
// and the "See gallery" cross-link — shown whenever the chosen country and
// period contain member items — are the view's, from the spec in
// composables/gallery.js. What is this gallery's fills the one slot
// this page needs: the back link.
</script>

<template>
  <TimelineResultsView :spec="timelineResults" id="timeline-results-wrapper">
    <template #before>
      <BackLink />
    </template>
  </TimelineResultsView>
</template>

<style scoped>
#timeline-results-wrapper { background: #fff; width: 100%; min-height: 400px; padding-bottom: 30px; }
#timeline-results-wrapper :deep(.mwnf-timeline__filters),
#timeline-results-wrapper :deep(.mwnf-summary),
#timeline-results-wrapper :deep(.mwnf-timeline__gallery),
#timeline-results-wrapper :deep(.mwnf-pagination) { margin-inline: 20px; }
</style>