<template>
  <AppMenu :open="menuOpen" username="User" @close="menuOpen = false" />
  <div class="menu-win">
    <div class="menu-win-content">
      <a class="start-button" @click.stop="menuOpen = !menuOpen">
        <img src="/assets/win-home.png" alt="Windows 7 Logo" />
      </a>

      <div v-for="app in store.getPinnedApplications()" :key="app.id" class="menu-item">
        <a @click.stop="store.addProgramActive(app.id)">
          <img :src="app.icon" :alt="app.name" />
        </a>
      </div>

      <div v-for="program in store.programActives" :key="program.id" class="menu-item active">
        <a @click.stop="store.bringToFrontProgram(program.id)">
          <img :src="program.icon" :alt="program.name" />
        </a>
      </div>
    </div>

    <!-- System tray: pushed to the right via margin-left:auto -->
    <div class="tray">
      <div class="tray-battery" :title="batteryTitle">
        <span class="tray-battery-icon">{{ batteryIcon }}</span>
        <span>{{ battery !== null ? battery + '%' : '--' }}</span>
      </div>
      <div class="tray-clock">
        <div class="tray-time">{{ time }}</div>
        <div class="tray-date">{{ date }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppMenu from './AppMenuComponent.vue'
import { useWindowStore } from '../stores/window'
const store = useWindowStore()
const menuOpen = ref(false)

// ── Clock ──
const now = ref(new Date())
const timer = setInterval(() => {
  now.value = new Date()
}, 1000)
onUnmounted(() => clearInterval(timer))

const time = computed(() =>
  now.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
)
const date = computed(() =>
  now.value.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' }),
)

// ── Battery (native API) ──
// ponytail: navigator.getBattery() not available in all envs, graceful fallback
const battery = ref<number | null>(null)
const batteryCharging = ref(false)

onMounted(async () => {
  if ('getBattery' in navigator) {
    const b = await (
      navigator as {
        getBattery(): Promise<{
          level: number
          charging: boolean
          addEventListener: (event: string, callback: () => void) => void
        }>
      }
    ).getBattery()
    const update = () => {
      battery.value = Math.round(b.level * 100)
      batteryCharging.value = b.charging
    }
    update()
    b.addEventListener('levelchange', update)
    b.addEventListener('chargingchange', update)
  }
})

const batteryIcon = computed(() => {
  if (battery.value === null) return '🔋'
  if (batteryCharging.value) return '⚡'
  if (battery.value > 80) return '🔋'
  if (battery.value > 40) return '🪫'
  return '⚠️'
})

const batteryTitle = computed(() =>
  battery.value === null
    ? 'Battery info unavailable'
    : `${battery.value}% — ${batteryCharging.value ? 'Charging' : 'On battery'}`,
)
</script>

<style scoped>
.menu-win {
  position: fixed;
  bottom: 0px;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 40px;
  padding: 0em 1em;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  /* 1. Degradado base Aero (Combinación de tonos azulados y grisáceos translúcidos) */
  background: linear-gradient(
    to bottom,
    rgba(165, 195, 225, 0.45) 0%,
    /* Tono claro superior */ rgba(130, 165, 200, 0.35) 30%,
    /* Transición suave */ rgba(105, 140, 175, 0.5) 80%,
    /* Base más oscura */ rgba(115, 150, 185, 0.55) 100% /* Reflejo inferior sutil */
  );

  /* 2. El clásico borde superior brillante de Windows 7 */
  border-top: 1px solid rgba(255, 255, 255, 0.4);

  /* 3. Desenfoque de fondo para simular el efecto cristal (Aero Glass) */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  /* 4. Sombra superior interna y externa para dar profundidad */
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.3),
    0 -1px 4px rgba(0, 0, 0, 0.15);
}
.start-button {
  border: none;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: rgb(26, 77, 119);
}

.start-button img {
  background-color: transparent;
  width: 80%;
  height: 80%;
  object-fit: cover;
}

.menu-item {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5em;
  width: 40px;
  height: 100%;
}

.menu-item img {
  width: 32px;
  height: 32px;
  object-fit: cover;
}

.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%; /* Solo cubre la mitad superior */
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border-radius: 2px 2px 0 0;
  pointer-events: none;
}

.active {
  position: relative;
  width: 40px;
  height: 100%;
  /* 1. Esquinas redondeadas muy sutiles típicas de Windows 7 */
  border-radius: 3px;

  /* 2. El borde exterior blanco semi-transparente */
  border: 1px solid rgba(255, 255, 255, 0.45);

  /* 3. Fondo degradado de cristal azulado (Aero Glass) */
  background: linear-gradient(
    to bottom,
    rgba(235, 245, 255, 0.45) 0%,
    rgba(195, 220, 245, 0.35) 50%,
    rgba(160, 195, 230, 0.5) 51%,
    rgba(185, 215, 245, 0.6) 100%
  );

  /* 4. Múltiples sombras: el reflejo superior interno y el relieve oscuro inferior */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    /* Brillo superior interno */ inset 0 -1px 2px rgba(255, 255, 255, 0.3),
    /* Suavizado inferior */ 0 1px 2px rgba(0, 0, 0, 0.15); /* Sombra externa suave */
}

.menu-win-content {
  display: flex;
  align-items: center;
  gap: 15px;
  height: 100%;
  flex: 1;
}

/* ── System tray ── */
.tray {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  padding: 0 8px;
  height: 100%;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.tray-battery {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #fff;
  cursor: default;
  white-space: nowrap;
}

.tray-battery-icon {
  font-size: 13px;
}

.tray-clock {
  text-align: center;
  cursor: default;
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  padding-left: 10px;
}

.tray-time {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  line-height: 1.2;
}

.tray-date {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
