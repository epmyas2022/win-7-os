<template>
  <!-- Overlay to close on outside click -->
  <Teleport to="body">
    <div v-if="open" class="start-overlay" @click.self="$emit('close')" />

    <div v-if="open" class="start-menu">
      <!-- Header: user avatar + name -->
      <div class="sm-header">
        <img src="/icons/profile-info.png" alt="User" class="sm-avatar" />
        <span class="sm-username">{{ username }}</span>
      </div>

      <div class="sm-body">
        <!-- Left column: pinned + recently active programs -->
        <div class="sm-left">
          <ul class="sm-list">
            <li v-for="app in pinnedApps" :key="app.id" class="sm-item" @click="open_(app.id)">
              <img :src="app.icon" :alt="app.name" class="sm-icon" />
              <span>{{ app.name }}</span>
            </li>
          </ul>

          <div class="sm-sep"></div>

          <!-- All programs shortcut -->
          <div class="sm-all-programs" @click="$emit('close')">
            All Programs <span class="sm-arrow">▶</span>
          </div>
        </div>

        <!-- Right column: system places -->
        <div class="sm-right">
          <ul class="sm-list">
            <li
              v-for="place in systemPlaces"
              :key="place.id"
              class="sm-item sm-item--right"
              @click="open_(place.id)"
            >
              <img :src="place.icon" :alt="place.name" class="sm-icon" />
              <span>{{ place.name }}</span>
            </li>
          </ul>

          <div class="sm-sep sm-sep--right"></div>

          <!-- Shutdown row -->
          <div class="sm-shutdown-row">
            <button class="sm-power-btn" title="Shut down">⏻</button>
            <div class="sm-power-arrow" title="More options">▶</div>
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

// ponytail: show all pinned apps in start menu (not filtered by active like taskbar)
const pinnedApps = computed(() =>
  store.applications.filter((a: ApplicationInterface) => a.pinned),
)

// ponytail: system places reuse existing app entries by id
const systemPlaces = computed(() => {
  const ids = [8, 5, 13] // Desktop, Documents, Recycle Bin
  return ids
    .map((id) => store.applications.find((a: ApplicationInterface) => a.id === id))
    .filter(Boolean) as ApplicationInterface[]
})

function open_(id: number) {
  store.addProgramActive(id)
  emit('close')
}
</script>

<style scoped>
.start-overlay {
  position: fixed;
  inset: 0;
  z-index: 1099;
}

.start-menu {
  position: fixed;
  bottom: 40px;
  left: 4px;
  z-index: 1100;
  width: 480px;
  border-radius: 6px 6px 0 0;
  overflow: hidden;
  font-family: 'Segoe UI', 'Tahoma', sans-serif;
  font-size: 12px;

  /* Aero glass */
  background: rgba(30, 60, 110, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.4),
    0 8px 32px rgba(0, 0, 0, 0.6);
}

/* ── Header ── */
.sm-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(to right, #1f5fa6 0%, #1a4a80 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.sm-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
}

.sm-username {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

/* ── Body ── */
.sm-body {
  display: flex;
  height: 360px;
}

/* Left */
.sm-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.96);
  padding: 6px 0;
}

/* Right */
.sm-right {
  width: 180px;
  display: flex;
  flex-direction: column;
  background: rgba(180, 200, 230, 0.25);
  padding: 6px 0;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

/* ── Lists ── */
.sm-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.sm-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  color: #000;
  border-left: 3px solid transparent;
  transition: background 0.1s;
}

.sm-item:hover {
  background: linear-gradient(to right, #3a8ee6 0%, #2f7cd6 100%);
  color: #fff;
  border-left-color: #1a5fa8;
}

.sm-item--right {
  color: #e8f0fa;
  font-size: 12px;
}

.sm-item--right:hover {
  color: #fff;
}

.sm-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
}

/* ── Separators ── */
.sm-sep {
  height: 1px;
  background: #c8c8c8;
  margin: 4px 8px;
}

.sm-sep--right {
  background: rgba(255, 255, 255, 0.15);
}

/* ── All Programs ── */
.sm-all-programs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  color: #000;
  font-weight: bold;
  font-size: 12px;
}

.sm-all-programs:hover {
  background: linear-gradient(to right, #3a8ee6 0%, #2f7cd6 100%);
  color: #fff;
}

.sm-arrow {
  font-size: 10px;
}

/* ── Shutdown ── */
.sm-shutdown-row {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  gap: 4px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sm-power-btn {
  padding: 3px 14px;
  background: linear-gradient(to bottom, #3a6ea8 0%, #1e4a80 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.sm-power-btn:hover {
  background: linear-gradient(to bottom, #4a7ec0 0%, #2a5a98 100%);
}

.sm-power-arrow {
  padding: 3px 6px;
  background: linear-gradient(to bottom, #3a6ea8 0%, #1e4a80 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  color: #fff;
  font-size: 10px;
  cursor: pointer;
}
</style>
