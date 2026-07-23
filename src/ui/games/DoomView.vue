<template>
  <div
    class="doom-container"
    :style="{
      width: '100%',
      height: '100%',
    }"
  >
    <iframe
      v-on:load="loading = false"
      src="https://archive.org/embed/doom_dos"
      frameborder="0"
      width="100%"
      height="100%"
      webkitallowfullscreen="true"
      mozallowfullscreen="true"
      allowfullscreen
    ></iframe>

    <div
      v-if="loading"
      style="
        justify-content: center;
        align-items: center;
        display: flex;
        position: absolute;
        inset: 0;
        background-color: rgba(255, 255, 255, 0.7);
      "
    >
      <span class="loader animate" aria-label="Processing your request"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps<{
  width?: number
  height?: number
}>()

const loading = ref(true)
</script>

<style scoped></style>
