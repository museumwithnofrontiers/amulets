<script setup>
import { computed } from 'vue'
import { I18nText, useFacets } from '@museumwnf/viewer-core'
import { SearchFormView } from '@museumwnf/viewer-layout/views'
import { items, FACETS, FACET_CATEGORIES, FACET_LABEL_KEYS } from '../composables/gallery.js'

// The collection entrance, on the platform's composed search form
// (`mode: 'facets'`): legacy's shape — one dropdown per facet, over the
// *whole* member universe, choosing one navigates straight to the results —
// is the view's own `immediate` behaviour for this mode, and the from/to
// year buckets are its `dates: 'buckets'`. What stays here is only what
// those two engines need fed in: the options, and which categories this
// gallery's data actually has anything to offer for (`artist` has no
// dropdown in dxa-client, but the exporter ships the category, so it appears
// whenever it has a value — never a different answer, only a fuller one).
//
// No `howTo` on the spec: `gallery.collection.intro` already ends with its
// own "[How to search](#/how-to-search)" link, so adding the view's own
// would duplicate it.
const options = useFacets(items, FACETS)
const visibleFacets = computed(() => FACET_CATEGORIES.filter((c) => (options.value[c] ?? []).length > 0))

const collectionSearchSpec = computed(() => ({
  mode: 'facets',
  target: 'collection-results',
  dates: 'buckets',
  facets: [
    { key: 'country', label: 'catalogue.facet.selectCountry', options: options.value.country },
    ...visibleFacets.value.map((category) => ({ key: category, label: FACET_LABEL_KEYS[category], options: options.value[category] })),
  ],
}))
</script>

<template>
  <div id="collection-search-container">
    <SearchFormView :spec="collectionSearchSpec">
      <template #before>
        <div id="dropdown-label">{{ $t('catalogue.facet.filterBy') }}</div>
      </template>
    </SearchFormView>

    <!-- Legacy hardcoded this copy in English and named the gallery in the
         middle of the first sentence. It is a shared entry now, and it names
         "this Gallery" instead: a text takes nothing inserted into it, and the
         three internal links are Markdown links to the same hash routes. -->
    <I18nText id="description" class="mwnf-prose" dir="auto" keypath="gallery.collection.intro" />
  </div>
</template>

<style scoped>
#collection-search-container { display: flex; background: #fff; width: 100%; }
#collection-search-container :deep(.mwnf-search-form) { display: flex; flex-direction: column; width: 40%; padding: 50px; gap: 10px; }
#dropdown-label { max-width: 300px; padding-bottom: 6px; font-size: 125%; font-weight: 700; }
#collection-search-container :deep(.mwnf-search-form__panel) { width: 100%; max-width: 300px; display: flex; flex-direction: column; gap: 10px; }
#collection-search-container :deep(.mwnf-search-form__dates) { display: flex; gap: 10px; max-width: 300px; }
#collection-search-container :deep(.mwnf-search-form__dates) > * { flex: 1; min-width: 0; }
#description { width: 60%; padding: 50px 75px 50px 0; margin-top: 45px; }
#description a { color: var(--link-blue); }

@media only screen and (max-width: 849px) {
  #collection-search-container { flex-direction: column; }
  #collection-search-container :deep(.mwnf-search-form) { width: 100%; padding: 30px; }
  #description { width: 100%; padding: 30px; margin-top: 0; }
}
</style>