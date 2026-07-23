<template>
  <div class="notepad-view">
    <ul role="menubar">
      <li role="menuitem" tabindex="0">File</li>
      <li role="menuitem" tabindex="0">Edit</li>
      <li role="menuitem" tabindex="0">View</li>
      <li role="menuitem" tabindex="0">Help</li>
    </ul>

    <div class="notepad-content has-scrollbar" contenteditable="true" v-html="contentUrl"></div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { marked } from 'marked'

const contentUrl = ref<string | null>(null)
const props = defineProps<{
  content: string
  showContentUrl?: boolean
}>()

function isUrl(str: string): boolean {
  try {
    new URL(str)
    return true
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return false
  }
}

watch(
  () => props.showContentUrl,
  async (newVal) => {
    if (newVal && isUrl(props.content) && props.showContentUrl) {
      const res = await fetch(props.content)
      const text = await res.text()
      return (contentUrl.value = await marked.setOptions({ breaks: true }).parse(text))
    }

    contentUrl.value = props.content
  },
  { immediate: true },
)
</script>

<style scoped>
.notepad-view {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #000000;
  background-color: #ffffff;
  width: 100%;
  height: 100%;
}

.notepad-content {
  padding: 10px;
  overflow-y: auto;
  max-height: calc(100% - 30px);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.notepad-content :deep(h1) {
  font-size: 20px;
  font-weight: bold;
}

.notepad-content :deep(h2) {
  font-size: 18px;
  font-weight: bold;
}

.notepad-content :deep(p) {
  margin-top: 10px;
}
</style>
