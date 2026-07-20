<template>
  <div style="width: 100%; height: 100%; position: relative">
    <iframe
      v-on:load="loading = false"
      src="https://jspaint.app"
      width="100%"
      height="100%"
      style="border: none; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1)"
    >
    </iframe>

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

const loading = ref(true)
</script>

<style></style>
