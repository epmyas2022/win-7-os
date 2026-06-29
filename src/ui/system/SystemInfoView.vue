<template>
  <div class="sysinfo-view has-scrollbar">
    <div class="sysinfo-header">
      <img src="/icons/computer.png" alt="Computer" class="sysinfo-os-logo" />
      <div>
        <div class="sysinfo-os-name">Windows 7 - Epmyas OS</div>

        <div class="sysinfo-os-edition">Ultimate</div>
        <div class="sysinfo-os-copy">© 2009 Microsoft Corporation. All rights reserved.</div>
      </div>
    </div>

    <hr />

    <table class="sysinfo-table">
      <tbody>
        <tr>
          <th>Rating:</th>
          <td>⭐ 5.9 Windows Experience Index</td>
        </tr>
        <tr>
          <th>Processor:</th>
          <td>Intel® Core™ i7-2600 CPU @ 3.40GHz 3.40 GHz</td>
        </tr>
        <tr>
          <th>Installed memory (RAM):</th>
          <td>8.00 GB</td>
        </tr>
        <tr>
          <th>System type:</th>
          <td>64-bit Operating System</td>
        </tr>
        <tr>
          <th>Pen and Touch:</th>
          <td>No Pen or Touch Input is available for this Display</td>
        </tr>
      </tbody>
    </table>

    <hr />

    <table class="sysinfo-table">
      <tbody>
        <tr>
          <th>Computer name:</th>
          <td>USER-PC</td>
        </tr>
        <tr>
          <th>Full computer name:</th>
          <td>USER-PC</td>
        </tr>
        <tr>
          <th>Computer description:</th>
          <td></td>
        </tr>
        <tr>
          <th>Workgroup:</th>
          <td>WORKGROUP</td>
        </tr>
      </tbody>
    </table>

    <hr />

    <!-- ponytail: fake activation, purely cosmetic -->
    <div class="sysinfo-activation">
      <img src="/icons/computer.png" alt="" class="sysinfo-activated-icon" />
      <div>
        <strong>Windows is activated</strong>
        <div class="sysinfo-product-id">Product ID: 00426-OEM-8992662-00006</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ponytail: no props, no state — pure static display
</script>

<style scoped>
.sysinfo-view {
  padding: 16px;
  font-size: 12px;
  height: 100%;
  overflow-y: auto;
  background: white;
}

.sysinfo-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.sysinfo-os-logo {
  width: 48px;
  height: 48px;
}

.sysinfo-os-name {
  font-size: 20px;
  font-weight: bold;
  color: #003087;
}

.sysinfo-os-edition {
  font-size: 13px;
  color: #003087;
}

.sysinfo-os-copy {
  font-size: 10px;
  color: #666;
  margin-top: 2px;
}

hr {
  border: none;
  border-top: 1px solid #ccc;
  margin: 12px 0;
}

.sysinfo-table {
  width: 100%;
  border-collapse: collapse;
}

.sysinfo-table th {
  text-align: right;
  padding: 3px 12px 3px 0;
  color: #444;
  font-weight: normal;
  white-space: nowrap;
  width: 220px;
  vertical-align: top;
}

.sysinfo-table td {
  padding: 3px 0;
  color: #000;
}

.sysinfo-activation {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.sysinfo-activated-icon {
  width: 24px;
  height: 24px;
}

.sysinfo-product-id {
  font-size: 11px;
  color: #444;
  margin-top: 2px;
}
</style>
