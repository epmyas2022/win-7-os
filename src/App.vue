<script setup lang="ts">
import Menu from './components/MenuComponent.vue'
import Option from './components/OptionComponent.vue'
import Application from './components/ApplicationComponent.vue'
import { useContextMenu } from './composable/useWindow.ts'
import { useWindowStore } from './stores/window.ts'
import { useApp } from './composable/useApp.ts'

const { showOption, coordinates, handleContextMenu } = useContextMenu()
const store = useWindowStore()
const { notepadApp } = useApp()

const Readme = notepadApp(
  'https://raw.githubusercontent.com/github/docs/main/README.md',
  false,
  true,
)

Readme.run()
</script>

<template>
  <div>
    <div
      class="app"
      @contextmenu.prevent="(event) => handleContextMenu(event, 200, 200)"
      @click.prevent="() => (showOption = false)"
    >
      <Menu />
      <div class="application-container">
        <template
          v-for="(app, key) in store.getAllApplications().filter((app) => app.render)"
          :key="key"
        >
          <Application
            v-if="app.render"
            v-show="app.desktop"
            :show="app.show"
            :id="app.id"
            :name="app.name"
            :icon="app.icon"
            :type="app.type"
            :render="app.render"
            :size="app.size"
          />
        </template>
      </div>
    </div>
  </div>

  <Option v-if="showOption" :x="coordinates.x" :y="coordinates.y" />
</template>

<style scoped>
.app {
  height: 100dvh;
  width: 100%;
  position: relative;

  background-image: url('/assets/Img0_(Windows_7).jpg');
  background-size: cover;
  background-position: center;
}

.application-container {
  position: absolute;
  top: 10px;
  left: 10px;
  display: grid;
  grid-template-rows: repeat(6, 80px); /* máximo 4 filas */
  grid-auto-flow: column;
  grid-auto-columns: 80px; /* ancho de cada nueva columna */
  gap: 15px;
}
</style>
