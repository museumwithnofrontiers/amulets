<script setup>
import { RouterLink } from 'vue-router'
import { I18nText } from '@museumwnf/viewer-core'
import { BackLink } from '@museumwnf/viewer-layout/content'
import { PartnerListView } from '@museumwnf/viewer-layout/views'
import { partnerObjectsRoute, labelOf, partnerList } from '../composables/gallery.js'

// The partners list, grouped by country with an A–Z / Z–A toggle, on the
// platform's composed partner-list view: the grouping, the sort toggle and
// the query are the view's, from the spec in composables/gallery.js. What
// is this gallery's fills the one slot the default row cannot: legacy's
// "Read more"/"View objects" pair and the "no objects" line a partner
// holding none still gets (decision MWNF-384, recorded in
// @museumwnf/viewer-core/dxa's `useGalleryPartner`).
</script>

<template>
  <div id="partners-container">
    <PartnerListView :spec="partnerList">
      <template #before>
        <BackLink />
        <I18nText id="partners-list-description" class="mwnf-prose" dir="auto" keypath="gallery.partners.intro" />
      </template>

      <template #row="{ partner, row }">
        <div class="partner-text-links-container">
          <div class="partner-name">
            <RouterLink :to="row.route">
              {{ labelOf('partners', partner.id) }}<span v-if="row.city">, {{ row.city }}</span>
            </RouterLink>
          </div>
          <div class="partner-meta" v-if="partner.item_count">
            {{ partner.item_count }} {{ $t('partner.item.objectsInSite') }}
          </div>
          <div class="partner-meta partner-meta-empty" v-else>
            {{ $t('gallery.partner.noObjectsInGallery') }}
          </div>
          <div class="partner-links">
            <RouterLink :to="row.route">{{ $t('gallery.action.readMore') }}</RouterLink>
            <template v-if="partner.item_count">
              <span class="partner-link-divider">|</span>
              <RouterLink :to="partnerObjectsRoute(partner)">{{ $t('gallery.action.viewObjects') }}</RouterLink>
            </template>
          </div>
        </div>
        <div class="partner-logo" v-if="row.logo">
          <img :src="row.logo" :alt="labelOf('partners', partner.id)" loading="lazy" />
        </div>
      </template>
    </PartnerListView>
  </div>
</template>

<style scoped>
#partners-container { background: #fff; width: 100%; min-height: 400px; padding-bottom: 30px; }
#partners-container :deep(.mwnf-partner-list__title) { padding: 0 40px; }
#partners-container :deep(.mwnf-partner-list__toggle) { padding: 0 40px 12px; }
#partners-list-description { padding: 6px 40px 20px; max-width: 900px; line-height: 1.5; }
#partners-container :deep(.mwnf-partner-list__groups) { padding: 0 40px; }
#partners-container :deep(.mwnf-partner-list__group-title) {
  font-size: 20px;
  font-weight: 700;
  color: var(--theme-dark);
  border-bottom: 2px solid var(--theme-medium);
  margin-top: 22px;
  padding-bottom: 3px;
}
#partners-container :deep(.mwnf-partner-list__row) {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--background-color);
}
.partner-text-links-container { flex: 1; min-width: 0; }
.partner-name a { font-weight: 700; color: var(--link-blue); text-decoration: none; }
.partner-name a:hover { text-decoration: underline; }
.partner-meta { font-size: 13px; color: #666; margin: 3px 0; }
.partner-meta-empty { font-style: italic; }
.partner-links a { color: var(--link-blue); font-size: 13px; text-decoration: none; }
.partner-links a:hover { text-decoration: underline; }
.partner-link-divider { margin: 0 6px; color: #999; }
.partner-logo img { max-width: 120px; max-height: 70px; object-fit: contain; display: block; }
</style>