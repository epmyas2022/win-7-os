<template>
  <ul
    class="option-menu"
    role="menu"
    :style="{ width: '200px', height: '200px', left: `${props.x}px`, top: `${props.y}px` }"
  >
    <li role="menuitem" tabindex="0" aria-haspopup="true">View</li>
    <li role="menuitem" tabindex="0" aria-haspopup="true" >
      Sort by
      <ul role="menu">
        <li role="menuitem"><a href="#menu">Name</a></li>
        <li role="menuitem"><a href="#menu">Size</a></li>
        <li role="menuitem"><a href="#menu">Item type</a></li>
        <li role="menuitem"><a href="#menu">Date modified</a></li>
      </ul>
    </li>
    <li role="menuitem"><a href="#menu">Refresh</a></li>
    <li role="menuitem"><a href="#menu">Paste</a></li>
    <li role="menuitem"><a href="#menu">Paste shortcut</a></li>
  </ul>
</template>

<script setup lang="ts">

const props = defineProps<{
  x: number
  y: number
}>()






</script>

<style scoped>
.option-menu {
  position: absolute;
  z-index: 1000;
}
</style>
