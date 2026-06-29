<template>
  <div>
    <a class="application-component" @click.stop="open">
      <img
        :src="icon"
        :alt="name"
        :style="{
          width: iconSize?.width ? iconSize.width + 'px' : '40px',
          height: iconSize?.height ? iconSize.height + 'px' : '40px',
        }"
      />
      <p v-if="!hiddenTitle" :style="styleTitle">{{ name }}</p>
    </a>
    <Window
      :id="id"
      :title="name"
      v-model="isWindowOpen"
      :width="size?.width"
      :height="size?.height"
    >
      <component v-if="render" :is="render.component" v-bind="render.props" />
    </Window>
  </div>
</template>

<script setup lang="ts">
import { nextTick, computed } from 'vue'
import Window from './WindowComponent.vue'
import type { ApplicationInterface } from '../types/window'
import { useWindowStore } from '@/stores/window.ts'

const store = useWindowStore()

const props = defineProps<ApplicationInterface>()

const isWindowOpen = computed({
  get() {
    return store.getVisibleProgram(props.id)
  },
  set(value: boolean) {
    if (!value) {
      store.removeProgramActive(props.id)
    }
  },
})

const open = async () => {
  await nextTick()
  store.addProgramActive(props.id)
}
</script>

<style scoped>
.application-component {
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.application-component:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  cursor: pointer;
}

.application-component img {
  object-fit: contain;
}

.application-component p {
  color: white;
  text-align: center;
  margin-top: 5px;
}
</style>
