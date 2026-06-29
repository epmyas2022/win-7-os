<template>
  <Teleport to="body">
    <Transition name="window">
      <div
        @click="onClick"
        v-if="visible"
        class="window active"
        :class="{ maximized }"
        :style="
          maximized
            ? {
                zIndex: store.bringToFront === props.id ? 1000 : 'auto',
              }
            : {
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${props.width ? props.width + 'px' : 'fit-content'}`,
                height: `${props.height ? props.height + 'px' : 'fit-content'}`,
                maxWidth: `${props.maxWidth || 1000}px`,
                zIndex: store.bringToFront === props.id ? 1000 : 'auto',
              }
        "
      >
        <div class="title-bar" @mousedown="!maximized && startDrag($event)">
          <div class="title-bar-text">{{ props.title }}</div>
          <div class="title-bar-controls">
            <button disabled aria-label="Minimize" @click="minimized = !minimized"></button>
            <button aria-label="Maximize" @click="maximized = !maximized"></button>
            <button aria-label="Close" @click="visible = false"></button>
          </div>
        </div>
        <div
          v-show="!minimized"
          class="window-body has-space"
          :style="{
            height: 'calc(100% - 40px)',
          }"
        >
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useWindow } from '../composable/useWindow'
import { useWindowStore } from '../stores/window'

const props = defineProps<{
  id: number
  title: string
  width?: number
  number?: number
  maxWidth?: number
  height?: number
}>()

const store = useWindowStore()
const visible = defineModel('modelValue', { type: Boolean, default: false })

const { minimized, maximized, pos, startDrag } = useWindow(props.width, props.height)

const onClick = () => {
  store.bringToFrontProgram(props.id)
}
watch([pos, maximized], () => {
  if (pos || maximized) store.bringToFrontProgram(props.id)
})

watch(visible, (newValue) => {
  if (!newValue) {
    return store.removeProgramActive(props.id)
  }
})
</script>

<style scoped>
.window {
  position: fixed;
  cursor: default;
}

.window.maximized {
  left: 0 !important;
  top: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
  height: calc(100vh - 64px) !important;
}

.title-bar {
  cursor: grab;
  user-select: none;
}

.title-bar:active {
  cursor: grabbing;
}

/* open: scale up from 80% + fade in */
.window-enter-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
/* close: scale down to 80% + fade out */
.window-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.window-enter-from,
.window-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
