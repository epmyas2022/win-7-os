<template>
  <div class="recycle-view">
    <!-- Toolbar -->
    <div class="recycle-toolbar">
      <button class="rc-btn" disabled>Empty Recycle Bin</button>
      <div class="rc-sep"></div>
      <button class="rc-btn" disabled>Restore all items</button>
    </div>

    <!-- Column headers -->
    <div class="recycle-header">
      <span class="col-name">Name</span>
      <span class="col-date">Date deleted</span>
      <span class="col-type">Type</span>
      <span class="col-size">Size</span>
    </div>

    <!-- Empty state -->
    <!-- ponytail: no items state only, no delete logic needed yet -->
    <div class="recycle-empty">
      <p>The Recycle Bin is empty.</p>
    </div>

    <!-- Status bar -->
    <div class="recycle-statusbar">0 items</div>
  </div>
</template>

<script setup lang="ts">
// ponytail: no props, no state — static empty view
</script>

<style scoped>
.recycle-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  font-family: 'Tahoma', 'Segoe UI', sans-serif;
  font-size: 12px;
}

/* ── Toolbar ── */
.recycle-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(to bottom, #dce9f7 0%, #c2d8f0 100%);
  border-bottom: 1px solid #9ab4d0;
}

.rc-btn {
  padding: 3px 12px;
  background: linear-gradient(to bottom, #f0f6fd 0%, #d4e6f7 100%);
  border: 1px solid #7da4c4;
  border-radius: 3px;
  font-size: 12px;
  font-family: inherit;
  color: #1a3c6e;
  cursor: default;
  opacity: 0.6;
}

.rc-sep {
  width: 1px;
  height: 18px;
  background: #9ab4d0;
  margin: 0 4px;
}

/* ── Column headers ── */
.recycle-header {
  display: flex;
  padding: 3px 12px;
  background: linear-gradient(to bottom, #eaf3fc 0%, #d8eaf8 100%);
  border-bottom: 1px solid #b0c8e0;
  color: #444;
  font-size: 11px;
  font-weight: bold;
}

.col-name {
  flex: 2;
}
.col-date {
  flex: 2;
}
.col-type {
  flex: 1;
}
.col-size {
  flex: 1;
  text-align: right;
}

/* ── Empty state ── */
.recycle-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
  gap: 10px;
}

.rc-icon {
  width: 64px;
  height: 64px;
  opacity: 0.6;
}

.recycle-empty p {
  margin: 0;
  font-size: 13px;
}

/* ── Status bar ── */
.recycle-statusbar {
  padding: 2px 8px;
  background: linear-gradient(to bottom, #dce9f7 0%, #c2d8f0 100%);
  border-top: 1px solid #9ab4d0;
  font-size: 11px;
  color: #333;
}
</style>
