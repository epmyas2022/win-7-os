<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

// ponytail: native <video>. VLC classic Win7 skin — light gray chrome, not dark.
const props = defineProps<{ src?: string }>()

const videoEl = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const muted = ref(false)
const seeking = ref(false)
const localSrc = ref(props.src ?? '')
const isDragging = ref(false)
const speed = ref(1)
const repeat = ref(false)
const filename = ref('No media')

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('video/')) openFile(file)
}

function onFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) openFile(file)
}

function openFile(file: File) {
  if (localSrc.value.startsWith('blob:')) URL.revokeObjectURL(localSrc.value)
  localSrc.value = URL.createObjectURL(file)
  filename.value = file.name
}

function fmt(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = Math.floor(s % 60).toString().padStart(2, '0')
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${ss}`
}

const progress = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0))
const volPct = computed(() => (muted.value ? 0 : volume.value) * 100)

function togglePlay() {
  if (!videoEl.value) return
  videoEl.value.paused ? videoEl.value.play() : videoEl.value.pause()
}

function stop() {
  if (!videoEl.value) return
  videoEl.value.pause()
  videoEl.value.currentTime = 0
}

function seekClick(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  if (videoEl.value) videoEl.value.currentTime = ratio * duration.value
}

function onSeekDown(e: MouseEvent) { seeking.value = true; seekClick(e) }
function onSeekMove(e: MouseEvent) { if (seeking.value) seekClick(e) }
function onSeekUp() { seeking.value = false }

function volClick(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  volume.value = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  muted.value = false
  if (videoEl.value) { videoEl.value.volume = volume.value; videoEl.value.muted = false }
}

function toggleMute() {
  muted.value = !muted.value
  if (videoEl.value) videoEl.value.muted = muted.value
}

function skip(s: number) {
  if (!videoEl.value) return
  videoEl.value.currentTime = Math.max(0, Math.min(duration.value, currentTime.value + s))
}

function setSpeed(s: number) {
  speed.value = s
  if (videoEl.value) videoEl.value.playbackRate = s
}

onUnmounted(() => {
  if (localSrc.value.startsWith('blob:')) URL.revokeObjectURL(localSrc.value)
})
</script>

<template>
  <div class="vlc-root" @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop="onDrop">

    <!-- Menu bar — Win7 light style -->
    <div class="vlc-menubar">
      <label class="vlc-menu-item">
        Media
        <input type="file" accept="video/*" style="display:none" @change="onFileInput" />
      </label>
      <span class="vlc-menu-item">Playback</span>
      <span class="vlc-menu-item">Audio</span>
      <span class="vlc-menu-item">Video</span>
      <span class="vlc-menu-item">Tools</span>
      <span class="vlc-menu-item">View</span>
      <span class="vlc-menu-item">Help</span>
    </div>

    <!-- Video / drop area -->
    <div class="vlc-video-area" @dblclick="togglePlay">
      <video
        v-if="localSrc"
        ref="videoEl"
        :src="localSrc"
        class="vlc-video"
        @timeupdate="currentTime = videoEl?.currentTime ?? 0"
        @loadedmetadata="duration = videoEl?.duration ?? 0; if(videoEl) { videoEl.volume = volume }"
        @play="playing = true"
        @pause="playing = false"
        @ended="playing = false; if(repeat && videoEl) { videoEl.currentTime = 0; videoEl.play() }"
      />
      <div v-else class="vlc-dropzone" :class="{ dragging: isDragging }">
        <svg viewBox="0 0 80 90" width="52" class="vlc-cone-svg">
          <defs>
            <linearGradient id="cG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ffb830" />
              <stop offset="100%" stop-color="#e05500" />
            </linearGradient>
          </defs>
          <polygon points="40,8 74,82 6,82" fill="url(#cG)" />
          <polygon points="40,8 58,48 22,48" fill="#fff" opacity="0.2" />
          <ellipse cx="40" cy="82" rx="34" ry="8" fill="#b84000" />
          <rect x="26" y="5" width="28" height="7" rx="3.5" fill="#fff" opacity="0.95" />
          <circle cx="40" cy="5" r="5.5" fill="#fff" />
        </svg>
        <p class="vlc-hint">Drag a video file here or click <strong>Media</strong></p>
      </div>
    </div>

    <!-- Seek bar row — gray background, blue thumb like VLC -->
    <div class="vlc-seek-row">
      <button class="vlc-sm-btn" title="Rewind" @click="skip(-10)">
        <!-- |◀◀ -->
        <svg viewBox="0 0 14 14" width="12" height="12">
          <rect x="0" y="1" width="2" height="12" fill="currentColor"/>
          <polygon points="12,1 4,7 12,13" fill="currentColor"/>
        </svg>
      </button>
      <div
        class="vlc-seek-track"
        @mousedown="onSeekDown"
        @mousemove="onSeekMove"
        @mouseup="onSeekUp"
        @mouseleave="onSeekUp"
      >
        <!-- yellow buffer bg -->
        <div class="vlc-seek-buf" />
        <!-- orange/yellow played fill -->
        <div class="vlc-seek-fill" :style="{ width: progress + '%' }" />
        <!-- blue thumb -->
        <div class="vlc-seek-thumb" :style="{ left: progress + '%' }" />
      </div>
      <button class="vlc-sm-btn" title="Forward" @click="skip(10)">
        <!-- ▶▶| -->
        <svg viewBox="0 0 14 14" width="12" height="12">
          <polygon points="2,1 10,7 2,13" fill="currentColor"/>
          <rect x="12" y="1" width="2" height="12" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <!-- Controls row — matches screenshot exactly -->
    <div class="vlc-controls-row">
      <!-- Group 1: play transport -->
      <div class="vlc-group">
        <!-- Pause/Play -->
        <button class="vlc-btn" title="Play/Pause" @click="togglePlay">
          <svg v-if="!playing" viewBox="0 0 14 14" width="14" height="14">
            <polygon points="2,1 13,7 2,13" fill="currentColor"/>
          </svg>
          <svg v-else viewBox="0 0 14 14" width="14" height="14">
            <rect x="2" y="1" width="4" height="12" fill="currentColor"/>
            <rect x="8" y="1" width="4" height="12" fill="currentColor"/>
          </svg>
        </button>
        <!-- Stop -->
        <button class="vlc-btn" title="Stop" @click="stop">
          <svg viewBox="0 0 14 14" width="14" height="14">
            <rect x="2" y="2" width="10" height="10" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div class="vlc-sep" />

      <!-- Group 2: media nav -->
      <div class="vlc-group">
        <!-- Prev media -->
        <button class="vlc-btn" title="Previous">
          <svg viewBox="0 0 14 14" width="14" height="14">
            <rect x="0" y="1" width="2" height="12" fill="currentColor"/>
            <polygon points="13,1 5,7 13,13" fill="currentColor"/>
          </svg>
        </button>
        <!-- Next media -->
        <button class="vlc-btn" title="Next">
          <svg viewBox="0 0 14 14" width="14" height="14">
            <polygon points="1,1 9,7 1,13" fill="currentColor"/>
            <rect x="12" y="1" width="2" height="12" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div class="vlc-sep" />

      <!-- Group 3: view toggles -->
      <div class="vlc-group">
        <!-- Toggle playlist -->
        <button class="vlc-btn" title="Toggle playlist">
          <svg viewBox="0 0 14 14" width="14" height="14">
            <rect x="0" y="2" width="14" height="2" fill="currentColor"/>
            <rect x="0" y="6" width="14" height="2" fill="currentColor"/>
            <rect x="0" y="10" width="14" height="2" fill="currentColor"/>
          </svg>
        </button>
        <!-- Extended settings -->
        <button class="vlc-btn" title="Extended settings">
          <svg viewBox="0 0 14 14" width="14" height="14">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <rect x="8" y="1" width="5" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <rect x="1" y="8" width="5" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <rect x="8" y="8" width="5" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>
        <!-- Equalizer -->
        <button class="vlc-btn" title="Equalizer">
          <svg viewBox="0 0 14 14" width="14" height="14">
            <rect x="1" y="8" width="2" height="5" fill="currentColor"/>
            <rect x="4" y="5" width="2" height="8" fill="currentColor"/>
            <rect x="7" y="2" width="2" height="11" fill="currentColor"/>
            <rect x="10" y="6" width="2" height="7" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div class="vlc-sep" />

      <!-- Group 4: chapter nav -->
      <div class="vlc-group">
        <button class="vlc-btn" title="Previous chapter" @click="skip(-60)">
          <svg viewBox="0 0 14 14" width="14" height="14">
            <polygon points="7,2 1,7 7,12" fill="currentColor"/>
            <polygon points="13,2 7,7 13,12" fill="currentColor"/>
          </svg>
        </button>
        <button class="vlc-btn" title="Next chapter" @click="skip(60)">
          <svg viewBox="0 0 14 14" width="14" height="14">
            <polygon points="1,2 7,7 1,12" fill="currentColor"/>
            <polygon points="7,2 13,7 7,12" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <!-- Spacer -->
      <div style="flex:1" />

      <!-- Volume: speaker + diagonal bar (VLC style) -->
      <div class="vlc-vol-group">
        <button class="vlc-btn" title="Mute" @click="toggleMute">
          <svg viewBox="0 0 16 16" width="15" height="15">
            <polygon points="1,5 5,5 9,2 9,14 5,11 1,11" fill="currentColor"/>
            <template v-if="!muted && volume > 0">
              <path d="M11 4.5 Q14 8 11 11.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path v-if="volume > 0.4" d="M12.5 2.5 Q17 8 12.5 13.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </template>
            <template v-else>
              <line x1="11" y1="5" x2="15" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="15" y1="5" x2="11" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </template>
          </svg>
        </button>
        <!-- Diagonal gradient volume bar like VLC screenshot -->
        <div class="vlc-vol-wrap" @mousedown="volClick" @mousemove="(e) => e.buttons===1 && volClick(e)" title="Volume">
          <svg class="vlc-vol-svg" viewBox="0 0 80 16" preserveAspectRatio="none">
            <!-- track background -->
            <rect x="0" y="4" width="80" height="8" rx="4" fill="#c8c8c8"/>
            <!-- fill: green→yellow gradient clipped to volPct -->
            <defs>
              <linearGradient id="vG" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#5abf3f"/>
                <stop offset="70%" stop-color="#c8e840"/>
                <stop offset="100%" stop-color="#f0e800"/>
              </linearGradient>
              <clipPath id="vClip">
                <rect :x="0" y="0" :width="volPct * 0.8" height="16"/>
              </clipPath>
            </defs>
            <rect x="0" y="4" width="80" height="8" rx="4" fill="url(#vG)" clip-path="url(#vClip)"/>
          </svg>
          <div class="vlc-vol-pct-label">{{ Math.round(volPct) }}%</div>
        </div>
      </div>
    </div>

    <!-- Status bar — dark, filename left, speed center, time right -->
    <div class="vlc-statusbar">
      <span class="vlc-status-file">{{ filename }}</span>
      <span class="vlc-status-speed">
        <select class="vlc-speed-select" :value="speed" @change="setSpeed(+($event.target as HTMLSelectElement).value)">
          <option v-for="s in SPEEDS" :key="s" :value="s">{{ s.toFixed(2) }}x</option>
        </select>
      </span>
      <span class="vlc-status-time">{{ fmt(currentTime) }} / {{ fmt(duration) }}</span>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.vlc-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  font-family: 'Segoe UI', Tahoma, sans-serif;
  font-size: 12px;
  color: #222;
  overflow: hidden;
  user-select: none;
}

/* Menu bar — Win7 light */
.vlc-menubar {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border-bottom: 1px solid #d0d0d0;
  padding: 2px 4px;
  flex-shrink: 0;
}

.vlc-menu-item {
  padding: 3px 10px;
  cursor: pointer;
  font-size: 12px;
  color: #222;
  border-radius: 2px;
  white-space: nowrap;
}

.vlc-menu-item:hover {
  background: #c8daf5;
  color: #000;
}

/* Video area */
.vlc-video-area {
  flex: 1;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
}

.vlc-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.vlc-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
  height: 100%;
  color: #888;
}

.vlc-dropzone.dragging { background: rgba(255,140,0,0.06); }

.vlc-hint { margin: 0; font-size: 12px; color: #999; }

/* Seek bar row */
.vlc-seek-row {
  display: flex;
  align-items: center;
  background: #e8e8e8;
  border-top: 1px solid #c8c8c8;
  border-bottom: 1px solid #c8c8c8;
  padding: 4px 6px;
  gap: 4px;
  flex-shrink: 0;
}

.vlc-seek-track {
  flex: 1;
  position: relative;
  height: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.vlc-seek-buf {
  position: absolute;
  left: 0; right: 0; top: 50%;
  transform: translateY(-50%);
  height: 4px;
  background: #c8c8c8;
  border-radius: 2px;
}

.vlc-seek-fill {
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  height: 4px;
  background: linear-gradient(to right, #5abf3f, #c8e840);
  border-radius: 2px;
  pointer-events: none;
}

/* Blue thumb — matches VLC exactly */
.vlc-seek-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 11px;
  height: 11px;
  background: linear-gradient(to bottom, #6ab0f0, #2060c0);
  border-radius: 50%;
  border: 1px solid #1050a0;
  pointer-events: none;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

/* Controls row */
.vlc-controls-row {
  display: flex;
  align-items: center;
  background: #e8e8e8;
  border-bottom: 1px solid #c0c0c0;
  padding: 4px 6px;
  gap: 2px;
  flex-shrink: 0;
}

.vlc-group {
  display: flex;
  align-items: center;
  gap: 0;
}

.vlc-sep {
  width: 1px;
  height: 20px;
  background: #b8b8b8;
  margin: 0 4px;
  flex-shrink: 0;
}

.vlc-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #444;
  padding: 4px 5px;
  cursor: pointer;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background 0.1s, border-color 0.1s;
}

.vlc-btn:hover {
  background: #d0e4f8;
  border-color: #90b8e0;
  color: #000;
}

.vlc-btn:active {
  background: #b8d0f0;
}

.vlc-sm-btn {
  background: transparent;
  border: none;
  color: #555;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 2px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.vlc-sm-btn:hover { color: #000; background: #d0e4f8; }

/* Volume group */
.vlc-vol-group {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.vlc-vol-wrap {
  position: relative;
  width: 80px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.vlc-vol-svg {
  width: 80px;
  height: 16px;
  display: block;
}

.vlc-vol-pct-label {
  position: absolute;
  right: -30px;
  font-size: 10px;
  color: #555;
  white-space: nowrap;
  width: 28px;
  text-align: right;
}

/* Status bar — dark like screenshot */
.vlc-statusbar {
  display: flex;
  align-items: center;
  background: #3c3c3c;
  color: #d0d0d0;
  padding: 3px 8px;
  font-size: 11px;
  flex-shrink: 0;
  gap: 8px;
}

.vlc-status-file {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #ccc;
}

.vlc-status-speed {
  flex-shrink: 0;
}

.vlc-speed-select {
  background: #3c3c3c;
  color: #ccc;
  border: none;
  font-size: 11px;
  cursor: pointer;
  padding: 0 2px;
}

.vlc-speed-select:focus { outline: none; }
.vlc-speed-select option { background: #2a2a2a; }

.vlc-status-time {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  color: #ccc;
  letter-spacing: 0.3px;
}
</style>
