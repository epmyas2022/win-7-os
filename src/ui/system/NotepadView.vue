<template>
  <div class="notepad-view">
    <ul role="menubar">
      <li role="menuitem" tabindex="0">File</li>
      <li role="menuitem" tabindex="0">Edit</li>
      <li role="menuitem" tabindex="0">View</li>
      <li role="menuitem" tabindex="0">Help</li>
    </ul>

    <div class="notepad-content has-scrollbar" contenteditable="true" v-html="content"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  content: string
}>()
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
}
</style>
