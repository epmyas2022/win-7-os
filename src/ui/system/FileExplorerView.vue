<template>
  <div class="explorer-view">
    <ul role="menubar">
      <li role="menuitem" tabindex="0">File</li>
      <li role="menuitem" tabindex="0">Edit</li>
      <li role="menuitem" tabindex="0">View</li>
      <li role="menuitem" tabindex="0">Tools</li>
      <li role="menuitem" tabindex="0">Help</li>
    </ul>

    <div class="explorer-body">
      <!-- Sidebar -->
      <div class="explorer-sidebar">
        <div class="tree-header">Folders</div>
        <ul class="tree-view has-connector">
          <li v-for="node in tree" :key="node.name">
            <span
              :class="['folder', { open: node.name === currentFolder }]"
              @click.prevent="navigate(node)"
              >{{ node.name }}</span
            >
            <ul v-if="node.children">
              <li v-for="child in node.children" :key="child.name">
                <span
                  :class="['folder', { open: child.name === currentFolder }]"
                  @click.stop="navigate(child)"
                  >{{ child.name }}</span
                >
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Main pane -->
      <div class="explorer-main has-scrollbar">
        <div v-for="item in currentItems" :key="item.name" class="explorer-item">
          <a v-if="item.type === 'folder'" href="#" @click.stop="navigate(item)">
            <img :src="item.icon" alt="Folder Icon" />
            <span>{{ item.name }}</span>
          </a>

          <ApplicationComponent
            v-if="item.type !== 'folder'"
            :id="item.id"
            :show="item.show"
            :key="item.id"
            :name="item.name"
            :icon="item.icon"
            :type="item.type"
            :render="item.render"
            :size="item.size"
            :style-title="{
              color: 'dodgerblue',
            }"
            :icon-size="{
              width: 32,
              height: 32,
            }"
          />
        </div>
      </div>
    </div>

    <!-- Status bar -->
    <div class="status-bar">
      <p class="status-bar-field">{{ currentItems.length }} object(s)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowStore } from '../../stores/window'
import type { ApplicationInterface } from '../../types/window'
import ApplicationComponent from '@/components/ApplicationComponent.vue'
const props = defineProps<{
  indexNode?: number
}>()

const store = useWindowStore()
// ponytail: static fake filesystem — no real fs access in browser

const tree = store.applications.filter((app) => app.type === 'folder')

const currentNode = ref<ApplicationInterface | null>(tree.at(props?.indexNode || 0) ?? null)
const currentFolder = computed(() => currentNode.value?.name)
const currentItems = computed(() => currentNode.value?.children ?? [])

function navigate(node: ApplicationInterface) {
  if (node.type === 'folder') {
    currentNode.value = node
    return
  }

  console.log(node.id)

  store.addProgramActive(node.id)
}
</script>

<style scoped>
.explorer-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-size: 12px;
}

.explorer-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  border-top: 1px solid #ccc;
}

.explorer-sidebar {
  width: 160px;
  border-right: 1px solid #ccc;
  overflow-y: auto;
  padding: 4px;
  flex-shrink: 0;
}

.tree-header {
  font-weight: bold;
  margin-bottom: 4px;
  padding: 2px 4px;
  background: #003087;
  color: white;
}

.explorer-main {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 8px;
  padding: 8px;
  overflow-y: auto;
}

.explorer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 72px;
  cursor: default;
  text-align: center;
  padding: 4px;
  gap: 4px;
  margin-left: 1.5em;
}

.explorer-item img {
  width: 32px;
  height: 32px;
}

.explorer-item span {
  word-break: break-word;
  font-size: 11px;
}

.folder {
  cursor: pointer;
}

.folder.open {
  font-weight: bold;
}
</style>
