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

export const { itemSheet } = sheet
