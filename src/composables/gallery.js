import { eraLabel, roundOutward, useSiteConfig } from '@museumwnf/viewer-core'
import {
  useGalleryData, useGalleryCollection, useGalleryTimeline, useGalleryPartner, useGallerySheet,
} from '@museumwnf/viewer-core/dxa'

// This gallery's own instance of the shared DXA gallery data layer (epic
// #1730): `useCollection.js`, `useTimeline.js`, `partner.js`, `sheet.js` and
// `useGalleryData.js` used to be byte-identical local copies of what carpets
// and amulets both wrote for themselves; they now ship from
// `@museumwnf/viewer-core/dxa`. This module is the one place that calls
// them, the same explicit `data`/`collection` parameters the package's
// README shows, threaded through once so every page reads the same refs
// rather than each view re-running `useGalleryData()` on its own. `config`
// is not passed to any of them: every export below reads no site name, no
// legacy project key, no UUID — amulets shares the same entity list and
// catalogue shape as every other DXA gallery, so there is nothing of its
// own to feed in.

export const data = useGalleryData()
export const collection = useGalleryCollection(data)
export const timeline = useGalleryTimeline(data, collection)
export const partner = useGalleryPartner(data, collection)
export const sheet = useGallerySheet(data)

// ── The data layer ──────────────────────────────────────────────────────
//
// Everything a page used to import from the local `useGalleryData.js`,
// still by the same names. `data.timelineEvents` (the raw `timeline_events`
// entity) is not re-exported here: nothing on this site reads it directly,
// only the merged spec `timeline.js` builds from it, exported below under
// the same name `useTimeline.js` used to export it under.
export const {
  manifest, defaultLang,
  tr, md, mdInline, mdStrip, loadEnglish, labelOf,
  availableLanguages, loadTranslations, translations,
  gallery, items, tags, partners, countries, languages, dynasties, glossary, timelines,
  itemById, partnerById, countryById, tagById, dynastyById, timelineById, languageByCode,
  itemRoute, partnerRoute, partnerObjectsRoute, itemFromUidPath, partnerFromKey,
  chromeImage, siblingGalleries, siblingUrl, pickSiblings,
} = data

// ── The catalogue spec ──────────────────────────────────────────────────

export const {
  FACETS, hasEveryTag, haystack, tile, collectionResults,
  countryIdForCode, tagIdForLegacy, tagLabelForLegacy,
} = collection

// The five THG facets and the page size are shared verbatim by both DXA
// families; `eraLabel`/`roundOutward` are viewer-core's own date helpers,
// not this gallery's, so pages read them straight from
// `@museumwnf/viewer-core` rather than through this module.
export { PAGE_SIZE, DATE_MODE, FACET_CATEGORIES, FACET_LABEL_KEYS, useFacetLabels } from '@museumwnf/viewer-core/dxa'

// ── The timeline spec ───────────────────────────────────────────────────
//
// `timeline.js`'s own `countryIdForCode` (legacy timeline codes, the
// `has_country_timeline`-less worldwide chronology) is a different function
// from the catalogue facet's `countryIdForCode` above — same name in the two
// former files, no collision there because they were separate modules.
// Renamed here, since both are now destructured into the same module scope;
// only the item sheet reads this one, aliasing it back on import.
export const {
  countryLabel, timelineEvents, timelineGalleryItems, timelineResults, timelineGallery,
  countryIdForCode: timelineCountryIdForCode,
} = timeline

// ── The partner specs ───────────────────────────────────────────────────

export const { partnerList, partnerSheet, partnerObjects } = partner

// ── The item sheet spec ─────────────────────────────────────────────────
//
// `sheet.js`'s own spec is what `RecordView` renders for every field, photo
// and citation; `RecordSheetView` (the DXA item sheet's composed view,
// inventory-app#1728) also reads a handful of keys that are genuinely this
// gallery's own, built here on top of `sheet.itemSheet` rather than forking
// the shared view: its project→colour chips (`dataset.config.js`'s
// `projectColors`, epic #1727 phase 4), its Explore-partner notice
// (`noticeProjects`), the holding-museum link, and the related-content
// block's outside references, cross-database links and timeline popout.
// `chipClass`/`notice.show` read `useSiteConfig()` lazily, inside the
// function `RecordSheetView` calls at render time — `dataset.config.js`
// itself imports this module before `createViewer()` sets the config, so a
// top-level read here would only ever see the empty default.

function museumRoute(partnerId) {
  const p = partnerById.value.get(partnerId)
  return p ? partnerRoute(p) : null
}

// `DynastyList` wants the raw records plus a `tr` function, not the merged
// shape a local popout used to build: it renders one `DynastyPopout` per
// entry regardless, so the "has a history to show" filter stays here.
function dynastyTranslation(dynasty, language) {
  return translations('dynasties', language)[dynasty.id] ?? translations('dynasties', defaultLang)[dynasty.id] ?? {}
}
function itemDynasties(record, language) {
  const records = (record.dynasty_ids ?? [])
    .map((id) => dynastyById.value.get(id))
    .filter((d) => d && dynastyTranslation(d, language).history)
  return records.length ? { records, tr: (d) => dynastyTranslation(d, language) } : null
}

const { countries: timelineCountries, findEvents } = timelineEvents

// The one popout `RecordSheetView` does not build itself, its shape unique
// to each DXA family (a gallery's own countries, events lookup and search
// route): `TimelineLookup` (`@museumwnf/viewer-layout/content`) renders the
// `info` object this builds, for the record's own date range.
function itemTimeline(record, ctx) {
  const [from, to] = roundOutward(record.start_date, record.end_date)
  if (from == null) return null
  return {
    heading: 'gallery.section.timeline',
    countries: timelineCountries.value.map((c) => ({ value: c.value, label: c.label ?? ctx.t('timeline.form.allCountries') })),
    defaultCountry: () => {
      for (const { value: code } of timelineCountries.value) {
        if (timelineCountryIdForCode(code) === record.country_id) return code
      }
      return 'all'
    },
    events: (country) => findEvents({ country, begin: from, end: to }),
    range: [from, to],
    era: (year) => eraLabel(year, ctx.t),
    searchTo: (country, [begin, end]) => ({ name: 'timeline-results', query: { country, begin, end } }),
  }
}

export const itemSheet = {
  ...sheet.itemSheet,
  sourceDatabase: {
    chipClass: (record) => useSiteConfig().projectColors?.[record.project_id] ?? null,
  },
  notice: {
    show: (record) => (useSiteConfig().noticeProjects ?? []).includes(record.project_id),
    label: 'gallery.item.explorePartnerNote',
  },
  museum: {
    route: (partnerId) => museumRoute(partnerId),
    label: (partnerId) => labelOf('partners', partnerId),
  },
  related: {
    ...sheet.itemSheet.related,
    title: 'gallery.related.title',
    description: 'gallery.related.description',
    notInPackageLabel: 'gallery.results.notInThisGallery',
    // amulets-data has carried `project_id` on every related-item stub,
    // in_package or not, since amulets#60 — ahead of the exporter fix that
    // gave carpets-data the same field (inventory-app#1807, carpets#67). The
    // outside reference's chip class resolves through the same
    // `projectColors` map as the source-database chip, keyed by
    // `project_id`, not `project_key`. `RecordSheetView` itself still
    // renders the chip's own text as the reference's raw `project_key`
    // (docs/slot-catalogue.md's `related.outsideChip` key only drives the
    // chip's class, not its label) — see the story's platform-gap note.
    outsideChip: (ref) => useSiteConfig().projectColors?.[ref.project_id] ?? null,
    artisticIntroductionLabel: 'gallery.nav.artisticIntroduction',
    databaseLabel: 'gallery.search.relatedDatabase',
    overallDatabase: { label: 'gallery.search.overallDatabase', linkLabel: 'gallery.nav.overallDatabase' },
    onDisplayIn: { linkPendingLabel: 'gallery.item.linkPending' },
    dynasties: (record, language) => itemDynasties(record, language),
    timeline: itemTimeline,
  },
}
