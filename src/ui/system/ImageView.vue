<template>
  <div class="img-view">
    <!-- Toolbar -->
    <div class="img-toolbar">
      <button class="img-btn" @click="zoom(-0.25)" title="Zoom out">🔍−</button>
      <span class="img-zoom-label">{{ Math.round(scale * 100) }}%</span>
      <button class="img-btn" @click="zoom(0.25)" title="Zoom in">🔍+</button>
      <button class="img-btn" @click="fit" title="Fit to window">⊡ Fit</button>
      <button class="img-btn" @click="actual" title="Actual size">1:1</button>
    </div>

    <!-- Image area: overflow so scrollbars appear when zoomed -->
    <div class="img-canvas has-scrollbar" @wheel.prevent="onWheel">
      <img
        :src="src"
        :alt="title"
        class="img-content"
        :style="{ transform: `scale(${scale})`, transformOrigin: 'center center' }"
        draggable="false"
      />
    </div>

    <!-- Status bar -->
    <div class="img-statusbar">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ src: string; title?: string }>()

// ponytail: scale only, no pan — overflow:auto handles it for free
const scale = ref(1)

function zoom(delta: number) {
  scale.value = Math.min(8, Math.max(0.1, scale.value + delta))
}

function fit() {
  scale.value = 1
}
function actual() {
  scale.value = 1
} // ponytail: actual px size needs ResizeObserver, skip

function onWheel(e: WheelEvent) {
  zoom(e.deltaY < 0 ? 0.1 : -0.1)
}
</script>

<style scoped>
.img-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #2c2c2c;
  font-family: 'Tahoma', 'Segoe UI', sans-serif;
  font-size: 12px;
}

.img-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(to bottom, #f0f0f0 0%, #d8d8d8 100%);
  border-bottom: 1px solid #aaa;
}

.img-btn {
  padding: 2px 8px;
  background: linear-gradient(to bottom, #f8f8f8 0%, #e0e0e0 100%);
  border: 1px solid #aaa;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
}

.img-btn:hover {
  background: linear-gradient(to bottom, #e8f4ff 0%, #c8dff5 100%);
  border-color: #7da4c4;
}

.img-zoom-label {
  min-width: 36px;
  text-align: center;
  font-size: 11px;
  color: #444;
}

.img-canvas {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-content {
  max-width: none;
  display: block;
  /* ponytail: smooth zoom */
  transition: transform 0.1s ease;
  user-select: none;
}

.img-statusbar {
  padding: 2px 8px;
  background: linear-gradient(to bottom, #e0e0e0 0%, #d0d0d0 100%);
  border-top: 1px solid #aaa;
  font-size: 11px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
