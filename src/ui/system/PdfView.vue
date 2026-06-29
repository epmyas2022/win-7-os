<template>
  <div class="pdf-view">
    <!-- Toolbar -->
    <div class="pdf-toolbar">
      <div class="pdf-toolbar-group pdf-toolbar-center">
        <img src="/icons/application-pdf.png" alt="pdf" class="pdf-icon" />
        <span class="pdf-title">{{ title }}</span>
      </div>
    </div>

    <!-- Viewer -->
    <!-- ponytail: iframe nativo, el browser ya sabe renderizar PDFs -->
    <div class="pdf-frame-wrapper">
      <iframe :src="iframeSrc" class="pdf-frame" title="PDF Viewer" frameborder="0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ src: string; title?: string }>()

const page = ref(1)
const zoom = ref(100)

// ponytail: append #page and zoom via PDF open params (works in Chromium)
const iframeSrc = computed(() => `${props.src}#page=${page.value}&zoom=${zoom.value}`)
</script>

<style scoped>
.pdf-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #525659;
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #444;
  padding: 4px 8px;
  gap: 8px;
  flex-shrink: 0;
  border-bottom: 1px solid #222;
}

.pdf-toolbar-center {
  flex: 1;
  justify-content: center;
  overflow: hidden;
}

.pdf-title {
  color: #eee;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

.pdf-icon {
  width: 16px;
  height: 16px;
}

.pdf-page-info,
.pdf-zoom {
  color: #eee;
  font-size: 11px;
  min-width: 60px;
  text-align: center;
}

.pdf-frame-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: center;
  padding: 12px;
  background: #525659;
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  background: white;
}
</style>
