<template>
  <div
    class="doom-container"
    :style="{
      width: '100%',
      height: '100%',
    }"
  >
    <iframe
      src="https://archive.org/embed/doom_dos"
      frameborder="0"
      width="100%"
      height="100%"
      webkitallowfullscreen="true"
      mozallowfullscreen="true"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  width?: number
  height?: number
}>()
</script>

<style scoped></style>
