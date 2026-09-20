<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from '@museumwnf/viewer-core'
import { RecordLanguages, MediaGallery, PartnerMap, BackLink } from '@museumwnf/viewer-layout/content'
import { RecordView } from '@museumwnf/viewer-layout/views'
import { partnerObjectsRoute, labelOf, md, partnerSheet } from '../composables/gallery.js'

// The partner profile, on the platform's composed record view: the
// language, the loads, the glossary and the "not found" fallback are the
// view's, from the spec in composables/gallery.js. Legacy's own tab strip
// (About/Contact/Logo/homepage) is not a sheet of labelled fields, so it
// fills the `header` slot in place of the default title, and its panels
// fill `before-sheet`; the photo carousel and its lightbox are the layout's
// `MediaGallery`, the map its `PartnerMap`.
//
// The language buttons now list every language the partners.json package
// carries a translation for at all (`RecordView`'s own default, since a
// partner record carries no per-record `languages` array the way an item
// does) rather than only the ones this specific partner has content in; a
// language this partner lacks falls back to English, exactly as every other
// text on this page already does.
const props = defineProps({ id: { type: String, required: true } })

// Also handed down through the `header` slot, on every composed record view
// — bound here too so `npx viewer-i18n-check` can tell a bare `t(...)` in the
// template is the text lookup and not some other function of the same name,
// exactly as the item sheet's own RecordView page already does.
const { t } = useI18n()

const tab = ref('description')

const contacts = (record) => [record?.contact_person_1, record?.contact_person_2].filter(Boolean)
const hasContact = (record, text) =>
  Boolean(text.address || text.phone || text.email || text.website || contacts(record).length)

function website(text) {
  const url = text.website
  if (!url) return null
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}
</script>

<template>
  <RecordView :spec="partnerSheet" :id="props.id" class="partner-profile-page">
    <template #header="{ record, text, languages, language, select, ready }">
      <div id="profile-languages">
        <RecordLanguages :languages="languages" :language="language" @select="select" />
      </div>

      <BackLink />

      <div v-if="!ready" class="mwnf-loader">{{ t('core.status.loading') }}</div>
      <template v-else>
        <p id="partner-name">{{ labelOf('partners', record.id) }}</p>
        <p id="partner-location">
          <span v-if="text.city">{{ text.city }}, </span>{{ labelOf('countries', record.country_id) }}
        </p>

        <div id="partner-links-container">
          <div id="partner-links">
            <button :class="{ active: tab === 'description' }" @click="tab = 'description'">{{ t('partner.info.about') }}</button>
            <template v-if="hasContact(record, text)">
              <span class="divider">|</span>
              <button :class="{ active: tab === 'contact' }" @click="tab = 'contact'">{{ t('partner.info.contact') }}</button>
            </template>
            <template v-if="record.logos?.length">
              <span class="divider">|</span>
              <button :class="{ active: tab === 'logo' }" @click="tab = 'logo'">{{ t('partner.info.logo') }}</button>
            </template>
            <template v-if="website(text)">
              <span class="divider">|</span>
              <a :href="website(text)" target="_blank" rel="noopener">↗ {{ t('partner.nav.homepage') }}</a>
            </template>
          </div>
          <div id="partner-objects-link" v-if="record.item_count">
            <RouterLink class="mwnf-button" :to="partnerObjectsRoute(record)">{{ t('gallery.partner.viewObjects') }}</RouterLink>
          </div>
        </div>
      </template>
    </template>

    <template #before-sheet="{ record, text, language, ready }">
      <div v-if="ready" id="profile-photo-wrapper">
        <MediaGallery
          v-if="record.images?.length"
          class="profile-photo-container"
          :images="record.images.map((p) => ({
            url: p.url,
            alt: labelOf('partners', record.id),
            caption: p.captions?.[language] ?? p.captions?.en ?? '',
            photographer: p.photographer ?? '',
            copyright: p.copyright ?? '',
          }))"
        />

        <div id="profile-info-container">
          <div class="mwnf-prose" v-if="tab === 'description'" v-html="md(text.description)"></div>

          <div v-else-if="tab === 'contact'">
            <p class="contact-header">{{ $t('partner.info.addresses') }}</p>
            <div class="mwnf-prose" v-html="md(text.address)"></div>
            <p v-if="text.phone">{{ $t('partner.info.phone') }} {{ text.phone }}</p>
            <p v-if="text.email"><a :href="`mailto:${text.email}`">{{ text.email }}</a></p>
            <p v-if="website(text)"><a :href="website(text)" target="_blank" rel="noopener">{{ text.website }}</a></p>
            <div class="contact-person" v-for="person in contacts(record)" :key="person.name ?? person.email">
              <p class="contact-title" v-if="person.title">{{ person.title }}</p>
              <p v-if="person.name">{{ person.name }}</p>
              <p v-if="person.phone">{{ $t('partner.info.phone') }} {{ person.phone }}</p>
              <p v-if="person.fax">{{ $t('partner.info.fax') }} {{ person.fax }}</p>
              <p v-if="person.email"><a :href="`mailto:${person.email}`">{{ person.email }}</a></p>
            </div>
            <div class="additional-urls" v-if="record.additional_urls?.length">
              <p v-for="entry in record.additional_urls" :key="entry.url">
                <a :href="entry.url" target="_blank" rel="noopener">{{ entry.url }}</a>
              </p>
            </div>
          </div>

          <div id="partner-logo-container" v-else-if="tab === 'logo'">
            <img v-for="logo in record.logos" :key="logo.url" :src="logo.url" :alt="labelOf('partners', record.id)" />
          </div>
        </div>
      </div>
    </template>

    <template #after-sheet="{ record }">
      <!-- 2.10.0's `PartnerMap` names its own three entries by default
           (`partner.map.map`, `.mapOf`, `.openInOpenStreetMap`); this gallery
           no longer overrides them. -->
      <PartnerMap
        :latitude="record.latitude"
        :longitude="record.longitude"
        :zoom="record.map_zoom"
        :label="labelOf('partners', record.id)"
      />
    </template>
  </RecordView>
</template>

<style scoped>
.partner-profile-page { background: #fff; width: 100%; min-height: 400px; padding-bottom: 40px; }
#profile-languages { display: flex; flex-wrap: wrap; gap: 2px; background: var(--background-color); padding: 6px 20px; }

.partner-profile-page :deep(.mwnf-record__body) { padding: 0 40px; }
#partner-name { font-size: 24px; font-weight: 700; color: var(--theme-dark); }
#partner-location { color: #555; margin-bottom: 12px; }

#partner-links-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--background-color);
  padding: 8px 12px;
}
#partner-links { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
#partner-links button {
  background: none;
  border: none;
  font-family: inherit;
  font-size: 15px;
  color: var(--theme-dark);
  cursor: pointer;
}
#partner-links button.active { font-weight: 700; text-decoration: underline; }
#partner-links a { color: var(--link-blue); font-size: 14px; }
.divider { color: #b08; opacity: 0.4; }
#partner-objects-link a { text-decoration: none; }

#profile-photo-wrapper { display: flex; gap: 26px; align-items: flex-start; padding-top: 18px; }
.profile-photo-container { flex: 0 0 38%; max-width: 38%; }

#profile-info-container { flex: 1; min-width: 0; line-height: 1.55; }
.contact-header { font-weight: 700; color: var(--theme-dark); margin-bottom: 4px; }
.contact-person { margin-top: 12px; }
.contact-title { font-style: italic; }
#profile-info-container a { color: var(--link-blue); }
#partner-logo-container img { max-width: 200px; display: block; margin-bottom: 12px; }
.additional-urls { margin-top: 12px; word-break: break-all; }

@media only screen and (max-width: 849px) {
  #profile-photo-wrapper { flex-direction: column; }
  .profile-photo-container { max-width: 100%; flex: none; width: 100%; }
}
</style>