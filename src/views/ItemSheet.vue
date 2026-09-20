<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
// Every project literal in this file now reads `manifest.projects` through
// `useProjects()` — amulets-data 1.0.15 carries `project_id` on every item
// and on every related-item stub, in_package or not, so no project literal
// needs to fall back to the deprecated legacy-key helpers.
import { eraLabel, roundOutward, useI18n, useProjects, useSiteConfig } from '@museumwnf/viewer-core'
import { BackLink, DynastyList, GlossaryTool, RecordLanguages, RelatedRecords, SheetSection } from '@museumwnf/viewer-layout/content'
import { RecordView } from '@museumwnf/viewer-layout/views'
import {
  labelOf, partnerById, partnerRoute, dynastyById, translations, defaultLang, md, itemById,
  timelineEvents, timelineCountryIdForCode as countryIdForCode, itemSheet,
} from '../composables/gallery.js'

const { countries: timelineCountries, findEvents } = timelineEvents

// The item sheet is the platform's composed record page, rendering the spec
// in composables/gallery.js: the record's language and loads, the glossary
// terms and the click on one, the rows, the gallery, the credits, the
// citation and the related records are the view's. What this page owns
// fills the view's slots — the blocks only a gallery has: the source database
// and the portal links, the partner link in the sheet, the related-content
// container (the layout's `GlossaryTool` and `DynastyList` inside it, a
// local timeline popout, the cross-references to sibling sites) and the
// print action.

const props = defineProps({ id: { type: String, required: true } })

const { t } = useI18n()
const { links, projectColors, noticeProjects } = useSiteConfig()
const { label: projectLabel, links: projectLinks } = useProjects()

const item = computed(() => itemById.value.get(props.id) ?? null)
const era = (year) => eraLabel(year, t)

const sourceProject = (record) => projectLabel(record.project_id)

// The related-database link is now purely data-driven: a project with no
// `related_database_url` in the manifest (DCA, "Discover Carpet Art", and
// "The Hijaz Railway" among them — legacy never had a public database search
// to point at for either) simply renders no link, with no fixed list of
// project ids to maintain here.
const relatedDatabase = (record) => projectLinks(record.project_id)?.relatedDatabaseUrl ?? null
const artisticIntroduction = (record) => projectLinks(record.project_id)?.artisticIntroductionUrl ?? null
// `noticeProjects` (dataset.config.js) is this site's own editorial list of
// project ids the "added within ..." notice applies to — legacy's EPM notice,
// generalised to whatever project id a site chooses, not a literal key.
const showEiacNotice = (record) => noticeProjects.includes(record.project_id)

// ── Related content ───────────────────────────────────────────────────────
//
// Decision Q3: none of these become a constructed URL. A related item the
// package holds opens locally (the view's rows); one it does not is shown
// as the reference it is; a sibling site is linked only where the import
// carried a host.

const byName = (a, b) => (a.name ?? '').localeCompare(b.name ?? '')
const galleryRefs = (record) => (record.gallery_references ?? []).filter((g) => g.kind === 'gallery').sort(byName)
// Legacy suppressed every exhibition link whose host was
// exhibitions.museumwnf.org; decision Q3 says outbound links are not
// dropped, so they are shown here.
const exhibitionRefs = (record) => (record.gallery_references ?? []).filter((g) => g.kind === 'exhibition').sort(byName)

// The one popout still built here: the timeline. Glossary and dynasty are
// now `GlossaryTool`/`DynastyList`'s own native `<details>` toggles below.
const openPopup = ref(null)
function togglePopup(which) {
  openPopup.value = openPopup.value === which ? null : which
}

// `DynastyList` wants the raw records plus a `tr` function, not the merged
// shape the local popouts used to build: it renders one `DynastyPopout` per
// entry regardless, so the "has a history to show" filter stays here.
function dynastyTranslation(dynasty, language) {
  return translations('dynasties', language)[dynasty.id] ?? translations('dynasties', defaultLang)[dynasty.id] ?? {}
}
function dynastiesFor(record, language) {
  return (record.dynasty_ids ?? [])
    .map((id) => dynastyById.value.get(id))
    .filter((d) => d && dynastyTranslation(d, language).history)
}

const timelineCountry = ref('')
watch(item, (it) => { timelineCountry.value = it ? (countryCodeOf(it.country_id) ?? 'all') : 'all' }, { immediate: true })
function countryCodeOf(countryId) {
  for (const { value: code } of timelineCountries.value) {
    if (countryIdForCode(code) === countryId) return code
  }
  return null
}
const itemRange = computed(() => roundOutward(item.value?.start_date, item.value?.end_date))
const itemEvents = computed(() => {
  const [from, to] = itemRange.value
  if (from == null) return []
  return findEvents({ country: timelineCountry.value, begin: from, end: to })
})

// Legacy's "As PDF (including images)" was the browser's own print dialog.
function printSheet() {
  window.print()
}
</script>

<template>
  <RecordView :spec="itemSheet" :id="id" class="database-page">
    <!-- No title over the sheet: the name is its first row, as legacy's was. -->
    <template #header="{ languages, language, select }">
      <div class="languages">
        <RecordLanguages :languages="languages" :language="language" @select="select" />
      </div>
      <BackLink />
    </template>

    <template #before-sheet="{ record, languages }">
      <div class="links-container">
        <!-- Decision Q3: legacy's `remote-object` URL came from a
             hand-maintained table with no counterpart in the new model, so
             the source is named, not linked. -->
        <!-- The chip used to carry the short legacy project key (e.g. "ISL");
             the manifest only carries the project's full name, so the chip
             and the label now share that one name instead of a short form. -->
        <p class="source-reference">
          {{ t('record.sheet.sourceDatabase') }}:
          <span class="mwnf-chip" :class="projectColors[record.project_id]">{{ sourceProject(record) }}</span>
        </p>
        <p class="source-uid"><code>{{ record.backward_compatibility }}</code></p>
        <p class="add-collection-link">
          <a :href="links.myCollection" target="_blank" rel="noopener">↗ {{ t('record.action.addToCollection') }}</a>
        </p>
      </div>
      <div class="info-eiac" v-if="showEiacNotice(record)">
        {{ t('gallery.item.explorePartnerNote') }} <strong><em>{{ languages.map((l) => l.label).join(', ') }}</em></strong>
      </div>
    </template>

    <template #museum="{ record }">
      <RouterLink :to="partnerRoute(partnerById.get(record.partner_id))">{{ labelOf('partners', record.partner_id) }}</RouterLink>
    </template>

    <template #related="{ record, language, records, outside }">
      <div class="related-content-container">
        <p class="related-header related-header--caps">{{ $t('gallery.related.title') }}</p>
        <p class="related-description">{{ t('gallery.related.description') }}</p>

        <RelatedRecords :heading="t('record.related.items')" :records="records" variant="grid" :action-label="t('gallery.action.seeDatabaseEntry')">
          <!-- Related items this gallery does not ship: the reference it is, awaiting a resolver. -->
          <ul v-if="outside.length" class="reference-list">
            <li v-for="r in outside" :key="r.id">
              <!-- Unlike carpets-data, amulets-data 1.0.15's `related_items` stubs
                   carry `project_id` on every entry, in_package or not (confirmed
                   via `npm pack @museumwnf/amulets-data`), so this chip resolves
                   through the manifest too, ahead of the carpets port it was cloned
                   from — see the TODO on carpets' own `ItemSheet.vue` for the gap
                   that still applies there. -->
              <span class="mwnf-chip" :class="projectColors[r.project_id]">{{ sourceProject(r) }}</span>
              <code>{{ r.backward_compatibility }}</code>
              <span class="unresolved-note">{{ $t('gallery.results.notInThisGallery') }}</span>
            </li>
          </ul>
        </RelatedRecords>

        <!-- Artistic Introduction — an Islamic Art site feature legacy linked
             from ISL/EPM sheets; now gated purely on the manifest carrying a
             URL for this record's project, not on which project it is. -->
        <div v-if="artisticIntroduction(record)">
          <p class="related-line">
            <a :href="artisticIntroduction(record)" target="_blank" rel="noopener">↗ {{ t('gallery.nav.artisticIntroduction') }}</a>
          </p>
        </div>

        <!-- Timeline for this item -->
        <div v-if="itemEvents.length || itemRange[0] != null">
          <p class="related-line clickable" @click="togglePopup('timeline')">➤ {{ t('record.related.timelineForItem') }}</p>
          <div class="popout" v-if="openPopup === 'timeline'" dir="ltr">
            <div class="popout-close" @click="openPopup = null">✕</div>
            <div class="popout-title">{{ $t('gallery.section.timeline') }}</div>
            <div class="popout-option">
              <label>{{ $t('timeline.form.searchIntro') }}</label>
              <select v-model="timelineCountry">
                <option v-for="c in timelineCountries" :key="c.value" :value="c.value">{{ c.label ?? $t('timeline.form.allCountries') }}</option>
              </select>
              <RouterLink
                class="popout-full-link"
                :to="{ name: 'timeline-results', query: { country: timelineCountry, begin: itemRange[0], end: itemRange[1] } }"
              >➤ {{ $t('timeline.action.beginFullSearch') }}</RouterLink>
            </div>
            <div class="popout-scroll">
              <div class="popout-subheader">
                {{ timelineCountries.find(c => c.value === timelineCountry)?.label ?? $t('timeline.form.allCountries') }},
                {{ era(itemRange[0]) }} – {{ era(itemRange[1]) }}
              </div>
              <div v-if="!itemEvents.length" class="popout-empty">{{ $t('timeline.results.noEvents') }}</div>
              <div class="timeline-event" v-for="event in itemEvents" :key="event.id">
                <div class="timeline-date">{{ era(event.year_from) }}</div>
                <div v-html="md(event.text.description)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Glossary tool -->
        <GlossaryTool :language="language" />

        <!-- Dynasties -->
        <DynastyList
          :heading="t('record.dynasty.list')"
          :dynasties="dynastiesFor(record, language)"
          :tr="(d) => dynastyTranslation(d, language)"
        />

        <!-- Audio / video -->
        <SheetSection v-if="record.media?.length" :heading="t('record.related.audioVideo')">
          <p class="related-line" v-for="file in record.media" :key="file.url">
            <a :href="file.url" target="_blank" rel="noopener">↗ {{ file.title ?? file.url }}</a>
          </p>
        </SheetSection>

        <!-- On display in -->
        <div v-if="galleryRefs(record).length || exhibitionRefs(record).length">
          <p class="related-header">{{ t('record.related.onDisplayIn') }}</p>
          <div v-if="exhibitionRefs(record).length">
            <p class="related-sub">{{ t('record.related.exhibitions') }}</p>
            <p class="related-line" v-for="ref in exhibitionRefs(record)" :key="ref.id">
              <a v-if="ref.legacy_host" :href="ref.legacy_host" target="_blank" rel="noopener">↗ {{ ref.name }}</a>
              <span v-else>{{ ref.name }} <span class="unresolved-note">{{ $t('gallery.item.linkPending') }}</span></span>
            </p>
          </div>
          <div v-if="galleryRefs(record).length">
            <p class="related-sub">{{ t('record.related.galleries') }}</p>
            <p class="related-line" v-for="ref in galleryRefs(record)" :key="ref.id">
              <a v-if="ref.legacy_host" :href="ref.legacy_host" target="_blank" rel="noopener">↗ {{ ref.name }}</a>
              <span v-else>{{ ref.name }} <span class="unresolved-note">{{ $t('gallery.item.linkPending') }}</span></span>
            </p>
          </div>
        </div>

        <!-- Search related database: the gate is on the block, as legacy's
             was, but the block itself is now one manifest-driven link
             instead of three branches picking a sibling site by legacy key. -->
        <div v-if="relatedDatabase(record)">
          <p class="related-header">{{ t('gallery.search.relatedDatabase') }}</p>
          <p class="related-line">
            <a :href="relatedDatabase(record)" target="_blank" rel="noopener">↗ {{ sourceProject(record) }}</a>
          </p>
        </div>

        <div>
          <p class="related-header">{{ t('gallery.search.overallDatabase') }}</p>
          <p class="related-line">
            <a :href="links.overallDatabase" target="_blank" rel="noopener">↗ {{ t('gallery.nav.overallDatabase') }}</a>
          </p>
        </div>

        <div>
          <p class="related-header">{{ t('record.action.download') }}</p>
          <p class="related-line clickable" @click="printSheet()">➤ {{ t('record.action.downloadPdf') }}</p>
        </div>
      </div>
    </template>
  </RecordView>
</template>

<style scoped>
.database-page { background: #fff; width: 100%; min-height: 400px; }

.languages { background: var(--background-color); padding: 6px 20px; }

/* Legacy's two columns — the photos on the left, the sheet on the right, the
   related content under both — over the view's single main column: the
   gallery takes the first column, everything else the second, and the
   related block spans the two. */
.database-page :deep(.mwnf-record__body) { padding: 0 20px 30px; }
.database-page :deep(.mwnf-record__main) {
  display: grid;
  grid-template-columns: 42% minmax(0, 1fr);
  column-gap: 26px;
  align-items: start;
}
.database-page :deep(.mwnf-record__main > *) { grid-column: 2; }
.database-page :deep(.mwnf-record__main > .mwnf-media) { grid-column: 1; grid-row: 1 / span 12; }
.database-page :deep(.mwnf-record__main > .related-content-container) { grid-column: 1 / -1; }

.links-container { padding-top: 14px; font-size: 14px; }
.links-container p { margin-bottom: 6px; }
.source-uid code { font-size: 12px; color: #666; word-break: break-all; }
.add-collection-link a { color: var(--link-blue); }

.info-eiac {
  background: var(--background-color);
  padding: 10px 12px;
  margin-bottom: 14px;
  font-size: 13px;
}
.info-label { font-weight: 700; color: var(--theme-dark); margin-top: 12px; }
.database-page :deep(.mwnf-sheet__value a) { color: var(--link-blue); }

.related-content-container { margin-top: 30px; border-top: 3px solid var(--theme-medium); padding-top: 16px; }
.related-header {
  font-weight: 700;
  color: var(--theme-dark);
  font-size: 16px;
  margin-top: 18px;
  border-bottom: 1px solid var(--theme-light);
}
.related-header--caps { text-transform: uppercase; }
.related-sub { font-weight: 700; margin-top: 12px; }
.related-description { font-size: 13px; color: #555; margin-top: 6px; }
.related-line { margin-top: 6px; }
.related-line a { color: var(--link-blue); }
.related-line.clickable { color: var(--theme-medium-dark); cursor: pointer; }
.related-line.clickable:hover { text-decoration: underline; }

.reference-list { list-style: none; margin-top: 6px; }
.reference-list li { padding: 3px 0; font-size: 13px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.reference-list code { color: #555; }
.unresolved-note { color: #8a8a8a; font-style: italic; font-size: 12px; }

.popout {
  position: relative;
  background: #fff;
  border: 2px solid var(--theme-medium-dark);
  margin: 8px 0 14px;
  max-width: 640px;
}
.popout-close {
  position: absolute;
  top: 4px;
  inset-inline-end: 8px;
  cursor: pointer;
  color: #fff;
  font-size: 16px;
  z-index: 2;
}
.popout-title { background: var(--theme-dark); color: #fff; padding: 6px 12px; font-weight: 700; }
.popout-instructions { padding: 8px 12px; font-size: 13px; }
.popout-option { padding: 8px 12px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 13px; }
.popout-option select { font-family: inherit; padding: 3px; }
.popout-full-link { color: var(--link-blue); }
.popout-scroll { max-height: 320px; overflow: auto; padding: 10px 12px; font-size: 14px; }
.popout-subheader { font-weight: 700; margin-bottom: 8px; }
.popout-empty { color: #777; font-style: italic; }
.timeline-event { display: flex; gap: 10px; padding: 5px 0; border-bottom: 1px solid #eee; }
.timeline-date { flex: 0 0 90px; font-weight: 700; }

.database-page :deep(.mwnf-glossary-tool),
.database-page :deep(.mwnf-dynasty-list) { margin-top: 14px; }

@media only screen and (max-width: 849px) {
  .database-page :deep(.mwnf-record__main) { display: block; }
}
</style>