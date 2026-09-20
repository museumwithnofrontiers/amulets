<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Pagination } from '@museumwnf/viewer-layout/content'
import { CatalogueResultsView } from '@museumwnf/viewer-layout/views'
import { BackLink } from '@museumwnf/viewer-layout/content'
import { partnerById, partnerRoute, labelOf, tr, defaultLang, partnerObjects } from '../composables/gallery.js'

// The member items one partner holds, on the platform's composed results
// view: the join, the sort and the pages are the view's, from the base spec
// in composables/gallery.js, `scope` added here over the route's own id —
// `CatalogueResultsView` takes no record id of its own, unlike `RecordView`.
const route = useRoute()
const partner = computed(() => partnerById.value.get(route.params.id) ?? null)
const spec = computed(() => ({
  ...partnerObjects,
  scope: (item) => item.partner_id === route.params.id,
}))

const city = computed(() => (partner.value ? tr('partners', partner.value.id, defaultLang).city ?? '' : ''))
</script>

<template>
  <div id="partner-objects-container" v-if="partner">
    <CatalogueResultsView :spec="spec">
      <template #before>
        <BackLink />
        <div id="partner-objects-header">
          <p id="partner-name">{{ labelOf('partners', partner.id) }}</p>
          <p id="partner-location">{{ [city, labelOf('countries', partner.country_id)].filter(Boolean).join(', ') }}</p>
        </div>
      </template>

      <template #actions="{ pageInfo, goToPage }">
        <Pagination class="pages" :page-info="pageInfo" jump @navigate="goToPage" />
      </template>

      <template #after>
        <div id="profile-link-container">
          <RouterLink id="profile-link" :to="partnerRoute(partner)">➤ {{ $t('gallery.action.partnerProfile') }}</RouterLink>
        </div>
      </template>
    </CatalogueResultsView>
  </div>
</template>

<style scoped>
#partner-objects-container { background: #fff; width: 100%; min-height: 400px; padding-bottom: 30px; }
#partner-objects-header { padding: 0 20px 12px; }
#partner-name { font-size: 22px; font-weight: 700; color: var(--theme-dark); }
#partner-location { color: #555; }
#partner-objects-container :deep(.mwnf-summary) { padding: 0 20px 12px; font-size: 13px; color: #666; }
#partner-objects-container :deep(.mwnf-catalogue__body) { padding: 0 20px 20px; }
#profile-link-container { padding-top: 16px; }
#profile-link { color: var(--link-blue); }
</style>