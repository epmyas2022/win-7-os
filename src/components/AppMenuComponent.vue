<template>
  <Teleport to="body">
    <div v-if="open" class="start-overlay" @click.self="$emit('close')" />

    <div v-if="open" class="start-menu">
      <!-- Body: left white + right translucent blue -->
      <div class="sm-body">
        <!-- LEFT: pinned apps list -->
        <div class="sm-left">
          <ul class="sm-list">
            <li v-for="app in pinnedApps" :key="app.id" class="sm-item" @click="open_(app)">
              <img :src="app.icon" :alt="app.name" class="sm-icon" />
              <span class="sm-item-name">{{ app.name }}</span>
              <!-- arrow indicator for apps with children -->
              <span v-if="app.children?.length" class="sm-item-arrow">▶</span>
            </li>
          </ul>

          <div class="sm-sep" />

          <!-- All Programs row -->
          <div class="sm-all-programs" @click="$emit('close')">
            <svg viewBox="0 0 16 16" width="16" height="16" style="flex-shrink: 0">
              <rect x="1" y="2" width="14" height="2" fill="currentColor" />
              <rect x="1" y="7" width="14" height="2" fill="currentColor" />
              <rect x="1" y="12" width="14" height="2" fill="currentColor" />
            </svg>
            <span>All Programs</span>
            <span class="sm-arrow">▶</span>
          </div>

          <!-- Search bar -->
          <div class="sm-search">
            <input type="text" placeholder="Search programs and files" class="sm-search-input" />
            <svg viewBox="0 0 16 16" width="14" height="14" class="sm-search-icon">
              <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8" />
              <line
                x1="10"
                y1="10"
                x2="14.5"
                y2="14.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>

        <!-- RIGHT: user photo + system places + shutdown -->
        <div class="sm-right">
          <!-- User photo at top -->
          <div class="sm-user-photo">
            <img src="/icons/profile-info.png" alt="User" class="sm-avatar" />
          </div>

          <!-- System places — text only, no icons, matching reference -->
          <ul class="sm-right-list">
            <li class="sm-right-item sm-right-name">{{ username || 'User' }}</li>
            <li class="sm-right-sep" />
            <li
              v-for="place in systemPlaces"
              :key="place.id ?? place.name"
              class="sm-right-item"
              @click="place.id && open_(place)"
            >
              {{ place.name }}
            </li>
            <li class="sm-right-sep" />
            <li class="sm-right-item">Control Panel</li>
            <li class="sm-right-item">Devices and Printers</li>
            <li class="sm-right-item">Default Programs</li>
            <li class="sm-right-sep" />
            <li class="sm-right-item">Help and Support</li>
          </ul>

          <!-- Shutdown row -->
          <div class="sm-shutdown-row">
            <button class="sm-power-btn" title="Shut down">
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path d="M8 2 v5" stroke="white" stroke-width="2" stroke-linecap="round" />
                <path
                  d="M5 3.8 A5.5 5.5 0 1 0 11 3.8"
                  fill="none"
                  stroke="white"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
              Shut down
            </button>
            <button class="sm-power-arrow" title="More options">▶</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowStore } from '../stores/window'
import type { ApplicationInterface } from '@/types/window'

defineProps<{ open: boolean; username?: string }>()
const emit = defineEmits<{ close: []; open: [id: number] }>()

const store = useWindowStore()

const pinnedApps = computed(() => store.applications.filter((a: ApplicationInterface) => a.pinned))

// ponytail: system places reuse existing app entries by id
const systemPlaces = computed(() => {
  const ids = [8, 5, 4, 13] // Desktop, Documents, Computer, Recycle Bin
  return ids
    .map((id) => store.applications.find((a: ApplicationInterface) => a.id === id))
    .filter(Boolean) as ApplicationInterface[]
})

function open_(app: ApplicationInterface) {
  emit('close')

  if (!app.app) return store.addProgramActive(app.id)

  app.app().run()
}
</script>

<style scoped>
.start-overlay {
  position: fixed;
  inset: 0;
  z-index: 1099;
}

/* Main panel — matches Win7 start menu shape */
.start-menu {
  position: fixed;
  bottom: 40px;
  left: 4px;
  z-index: 1100;
  width: 490px;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, sans-serif;
  font-size: 13px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.5),
    0 8px 40px rgba(0, 0, 0, 0.7);
}

/* ── Body ── */
.sm-body {
  display: flex;
  height: 480px;
}

/* ── LEFT column ── */
.sm-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.97);
  min-width: 0;
}

.sm-list {
  list-style: none;
  margin: 0;
  padding: 8px 0 0;
  flex: 1;
  overflow-y: auto;
}

.sm-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  cursor: pointer;
  color: #111;
  transition: background 0.1s;
}

.sm-item:hover {
  background: linear-gradient(to right, #fde8c0 0%, #fad898 100%);
}

.sm-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.sm-item-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12.5px;
}

.sm-item-arrow {
  font-size: 9px;
  color: #888;
}

/* Separator */
.sm-sep {
  height: 1px;
  background: #d8d8d8;
  margin: 4px 0;
}

/* All Programs */
.sm-all-programs {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  cursor: pointer;
  color: #111;
  font-size: 12.5px;
  transition: background 0.1s;
}

.sm-all-programs:hover {
  background: linear-gradient(to right, #fde8c0 0%, #fad898 100%);
}

.sm-arrow {
  margin-left: auto;
  font-size: 9px;
  color: #555;
}

/* Search bar */
.sm-search {
  display: flex;
  align-items: center;
  background: #e8e8e8;
  border-top: 1px solid #bbb;
  padding: 6px 10px;
  gap: 6px;
}

.sm-search-input {
  flex: 1;
  border: 1px solid #aaa;
  border-radius: 10px;
  padding: 4px 10px;
  font-size: 11px;
  color: #555;
  background: #fff;
  outline: none;
  font-family: inherit;
}

.sm-search-input:focus {
  border-color: #5a9fd4;
  box-shadow: 0 0 0 2px rgba(90, 159, 212, 0.25);
}

.sm-search-icon {
  color: #666;
  flex-shrink: 0;
}

/* ── RIGHT column ── */
.sm-right {
  width: 185px;
  display: flex;
  flex-direction: column;
  /* Aero glass translucent blue-gray */
  background: linear-gradient(to bottom, rgba(70, 100, 140, 0.82) 0%, rgba(55, 85, 125, 0.88) 100%);
  backdrop-filter: blur(6px);
  border-left: 1px solid rgba(255, 255, 255, 0.12);
}

/* User photo at top-right */
.sm-user-photo {
  display: flex;
  justify-content: center;
  padding: 14px 12px 10px;
}

.sm-avatar {
  width: 56px;
  height: 56px;
  border-radius: 3px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

/* Right list — text only, no icons */
.sm-right-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  flex: 1;
  overflow-y: auto;
}

.sm-right-name {
  font-size: 13px;
  font-weight: bold;
  color: #fff;
  padding: 6px 14px 8px;
}

.sm-right-sep {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 3px 8px;
  list-style: none;
}

.sm-right-item {
  padding: 6px 14px;
  cursor: pointer;
  color: rgba(220, 235, 255, 0.92);
  font-size: 12px;
  transition: background 0.1s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sm-right-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* ── Shutdown row ── */
.sm-shutdown-row {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  gap: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.15);
}

.sm-power-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  background: linear-gradient(to bottom, #4a7ab8 0%, #2a5090 100%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 3px;
  color: #fff;
  font-size: 12px;
  font-family: 'Segoe UI', Tahoma, sans-serif;
  cursor: pointer;
  flex: 1;
  justify-content: center;
  transition: background 0.1s;
}

.sm-power-btn:hover {
  background: linear-gradient(to bottom, #5a8acc 0%, #3a60a8 100%);
}

.sm-power-arrow {
  padding: 4px 8px;
  background: linear-gradient(to bottom, #4a7ab8 0%, #2a5090 100%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 3px;
  color: #fff;
  font-size: 9px;
  cursor: pointer;
  transition: background 0.1s;
}

.sm-power-arrow:hover {
  background: linear-gradient(to bottom, #5a8acc 0%, #3a60a8 100%);
}
</style>
