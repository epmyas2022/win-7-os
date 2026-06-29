<template>
  <div class="browser-view">
    <!-- Toolbar -->
    <div class="browser-toolbar">
      <button class="nav-btn" :disabled="historyIndex <= 0" @click="goBack" title="Back">◀</button>
      <button
        class="nav-btn"
        :disabled="historyIndex >= history.length - 1"
        @click="goForward"
        title="Forward"
      >
        ▶
      </button>
      <button class="nav-btn" @click="reload" title="Refresh">↻</button>
      <button class="nav-btn" @click="goHome" title="Home">🏠</button>

      <form class="url-bar-form" @submit.prevent="navigate">
        <input
          v-model="urlInput"
          class="url-bar"
          type="text"
          placeholder="http://"
          spellcheck="false"
          @focus="(event: FocusEvent) => (event.target as HTMLInputElement).select() "
        />
        <button type="submit" class="go-btn">Go</button>
      </form>
    </div>

    <!-- Favorites bar -->
    <div class="browser-favbar">
      <span class="favbar-label">Favorites:</span>
      <button v-for="fav in favorites" :key="fav.url" class="fav-btn" @click="loadUrl(fav.url)">
        {{ fav.label }}
      </button>
    </div>

    <!-- Frame area -->
    <div class="browser-frame-wrap">
      <!-- ponytail: most sites block iframes (X-Frame-Options). Nothing we can do client-side. -->
      <iframe
        v-if="currentUrl"
        ref="frame"
        :src="currentUrl"
        class="browser-frame"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        @load="onLoad"
        @error="onError"
      />
      <div v-else class="browser-empty">
        <img src="/icons/computer.png" alt="" class="browser-empty-icon" />
        <p>Internet Explorer</p>
        <p class="browser-empty-sub">Type a URL above or pick a favorite.</p>
      </div>

      <div v-if="loading" class="browser-loading">Loading...</div>
    </div>

    <!-- Status bar -->
    <div class="browser-statusbar">
      <span>{{ statusText }}</span>
      <span class="browser-zone">Internet</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const favorites = [
  { label: 'Google', url: 'https://www.google.com/webhp?igu=1' },
  { label: 'Wikipedia', url: 'https://en.m.wikipedia.org/wiki/Main_Page' },
  { label: 'YouTube', url: 'https://www.youtube.com' },
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'MDN', url: 'https://developer.mozilla.org' },
]

const HOME = favorites[0]?.url || 'https://www.google.com/webhp?igu=1'

const history = ref<string[]>([])
const historyIndex = ref(-1)
const urlInput = ref('')
const loading = ref(false)
const statusText = ref('Done')
const frame = ref<HTMLIFrameElement | null>(null)

const currentUrl = computed(() => history.value[historyIndex.value] ?? null)

function normalizeUrl(raw: string): string {
  const s = raw.trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  if (s.includes('.') && !s.includes(' ')) return 'https://' + s
  return 'https://www.google.com/search?q=' + encodeURIComponent(s)
}

function loadUrl(url: string) {
  const trimmed = normalizeUrl(url)
  if (!trimmed) return
  // Drop forward history
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(trimmed)
  historyIndex.value = history.value.length - 1
  urlInput.value = trimmed
  loading.value = true
  statusText.value = 'Connecting to ' + trimmed + '...'
}

function navigate() {
  loadUrl(urlInput.value)
}

function goBack() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    urlInput.value = currentUrl.value ?? ''
    loading.value = true
  }
}

function goForward() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    urlInput.value = currentUrl.value ?? ''
    loading.value = true
  }
}

function reload() {
  if (frame.value && currentUrl.value) {
    loading.value = true
    frame.value.src = currentUrl.value
  }
}

function goHome() {
  loadUrl(HOME)
}

function onLoad() {
  loading.value = false
  statusText.value = 'Done'
}

function onError() {
  loading.value = false
  statusText.value = 'Error loading page'
}
</script>

<style scoped>
.browser-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  font-family: 'Tahoma', 'Segoe UI', sans-serif;
  font-size: 12px;
}

/* ── Toolbar ── */
.browser-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px 4px;
  background: linear-gradient(to bottom, #dce9f7 0%, #c2d8f0 100%);
  border-bottom: 1px solid #9ab4d0;
}

.nav-btn {
  min-width: 26px;
  height: 24px;
  padding: 0 4px;
  background: linear-gradient(to bottom, #f0f6fd 0%, #d4e6f7 100%);
  border: 1px solid #7da4c4;
  border-radius: 3px;
  cursor: pointer;
  font-size: 13px;
  color: #1a3c6e;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.nav-btn:not(:disabled):hover {
  background: linear-gradient(to bottom, #e0f0ff 0%, #b8d8f8 100%);
}

.url-bar-form {
  flex: 1;
  display: flex;
  gap: 2px;
  margin-left: 4px;
}

.url-bar {
  flex: 1;
  height: 22px;
  padding: 0 6px;
  border: 1px solid #7da4c4;
  border-radius: 3px;
  background: #fff;
  font-size: 12px;
  font-family: inherit;
  color: #000;
  outline: none;
}

.url-bar:focus {
  border-color: #3d7ab5;
  box-shadow: 0 0 0 1px #3d7ab5;
}

.go-btn {
  height: 22px;
  padding: 0 10px;
  background: linear-gradient(to bottom, #f0f6fd 0%, #d4e6f7 100%);
  border: 1px solid #7da4c4;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  color: #1a3c6e;
}

.go-btn:hover {
  background: linear-gradient(to bottom, #e0f0ff 0%, #b8d8f8 100%);
}

/* ── Favorites bar ── */
.browser-favbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: linear-gradient(to bottom, #eaf3fc 0%, #d8eaf8 100%);
  border-bottom: 1px solid #b0c8e0;
}

.favbar-label {
  color: #555;
  margin-right: 4px;
  font-size: 11px;
}

.fav-btn {
  padding: 1px 8px;
  background: none;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  font-family: inherit;
  color: #1a3c6e;
}

.fav-btn:hover {
  background: linear-gradient(to bottom, #e0f0ff 0%, #c4dcf4 100%);
  border-color: #7da4c4;
}

/* ── Frame ── */
.browser-frame-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.browser-frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.browser-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #555;
  gap: 8px;
}

.browser-empty-icon {
  width: 48px;
  height: 48px;
  opacity: 0.5;
}

.browser-empty p {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #2c5f9e;
}

.browser-empty-sub {
  font-size: 12px !important;
  font-weight: normal !important;
  color: #888 !important;
}

.browser-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  color: #555;
  pointer-events: none;
}

/* ── Status bar ── */
.browser-statusbar {
  display: flex;
  justify-content: space-between;
  padding: 2px 8px;
  background: linear-gradient(to bottom, #dce9f7 0%, #c2d8f0 100%);
  border-top: 1px solid #9ab4d0;
  font-size: 11px;
  color: #333;
}

.browser-zone {
  color: #555;
}
</style>
