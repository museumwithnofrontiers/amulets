import { describeGallerySmoke } from '@museumwnf/viewer-layout/dxa/testing'
import { catalogues as sharedTexts } from '@museumwnf/viewer-i18n/gallery'
import manifest from '@inventory-data/manifest.json'
import ownTexts from '../locales/en.json'
import config from '../src/dataset.config.js'

// The gallery family's smoke test, run against this gallery's own dataset.
// The picks are records of that dataset the tests look for; each is described
// in the suite's own documentation (@museumwnf/viewer-layout/dxa/testing).
describeGallerySmoke({
  config,
  sharedTexts,
  ownTexts,
  manifest,
  namespace: 'amulets',
  picks: {
    collection: {
      tiles: 9,
      paginations: 2,
    },
    about: 'Amulets and Talismans',
    credits: 'LOCAL PROJECT TEAMS',
    chip: {
      item: '0dda7d39-b57f-5849-bcea-6897a0d0d4be',
      project: 'Sharing History',
      className: 'mwnf-chip--AWE',
    },
    noticeItem: 'e8cef6f7-62c2-5606-806d-9b7be4aaaae5',
    dynasty: {
      item: 'eeb73625-9b7f-5b6e-bac6-70835ba47781',
      name: 'Ottomans',
    },
    timeline: {
      code: 'gr',
      id: 'grc',
      country: 'Greece',
      rows: 11,
      event: 'Filiki Etaireia',
      gallery: 2,
      galleryTiles: 2,
      galleryItem: 'Amulet',
    },
    partner: {
      id: '2300bb0e-fc9f-55c5-ae2e-20f619a46cce',
      name: 'Weltmuseum Wien',
      city: 'Vienna',
      country: 'Austria',
      objects: 3,
    },
  },
})
