<script setup lang="ts">
import { ref, computed } from 'vue'

// ponytail: all game state flat — Expert preset (30x16, 99 mines), matching Win7 default
const ROWS = 16
const COLS = 30
const TOTAL_MINES = 99

type Cell = {
  mine: boolean
  revealed: boolean
  flagged: boolean
  wrongFlag: boolean // ponytail: shown on loss when flag was wrong
  adjacent: number
}

type GameState = 'idle' | 'playing' | 'won' | 'lost'

const grid = ref<Cell[][]>([])
const state = ref<GameState>('idle')
const startTime = ref<number | null>(null)
const elapsed = ref(0)
const flagCount = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null
const facePressed = ref(false)
const cellPressed = ref<[number, number] | null>(null)

const minesLeft = computed(() => TOTAL_MINES - flagCount.value)
const displayTime = computed(() => Math.min(elapsed.value, 999).toString().padStart(3, '0'))
const displayMines = computed(() => {
  const n = minesLeft.value
  if (n < 0) return '-' + Math.abs(n).toString().padStart(2, '0')
  return n.toString().padStart(3, '0')
})

// 7-segment: which segments are on per digit
// Segments: top, top-right, bot-right, bot, bot-left, top-left, mid
const SEG: Record<string, boolean[]> = {
  '0': [true,  true,  true,  true,  true,  true,  false],
  '1': [false, true,  true,  false, false, false, false],
  '2': [true,  true,  false, true,  true,  false, true ],
  '3': [true,  true,  true,  true,  false, false, true ],
  '4': [false, true,  true,  false, false, true,  true ],
  '5': [true,  false, true,  true,  false, true,  true ],
  '6': [true,  false, true,  true,  true,  true,  true ],
  '7': [true,  true,  true,  false, false, false, false],
  '8': [true,  true,  true,  true,  true,  true,  true ],
  '9': [true,  true,  true,  true,  false, true,  true ],
  '-': [false, false, false, false, false, false, true ],
}

function makeGrid(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      wrongFlag: false,
      adjacent: 0,
    })),
  )
}

// ponytail: single non-null assertion point for noUncheckedIndexedAccess
const g = (r: number, c: number): Cell => grid.value[r]![c]!

function placeMines(safeR: number, safeC: number) {
  let placed = 0
  while (placed < TOTAL_MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    if (g(r, c).mine) continue
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue
    g(r, c).mine = true
    placed++
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (g(r, c).mine) continue
      g(r, c).adjacent = neighborCoords(r, c).filter(([nr, nc]) => g(nr, nc).mine).length
    }
  }
}

function neighborCoords(r: number, c: number): [number, number][] {
  const result: [number, number][] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) result.push([nr, nc])
    }
  }
  return result
}

function reveal(r: number, c: number) {
  const cell = g(r, c)
  if (cell.revealed || cell.flagged) return
  cell.revealed = true
  if (cell.adjacent === 0 && !cell.mine) {
    neighborCoords(r, c).forEach(([nr, nc]) => reveal(nr, nc))
  }
}

function startTimer() {
  startTime.value = Date.now()
  timerInterval = setInterval(() => {
    elapsed.value = Math.floor((Date.now() - startTime.value!) / 1000)
  }, 1000)
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

function checkWin(): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = g(r, c)
      if (!cell.mine && !cell.revealed) return false
    }
  }
  return true
}

function loseGame(r: number, c: number) {
  g(r, c).revealed = true
  state.value = 'lost'
  stopTimer()
  grid.value.forEach((row) =>
    row.forEach((cell: Cell) => {
      if (cell.mine && !cell.flagged) cell.revealed = true
      if (!cell.mine && cell.flagged) cell.wrongFlag = true
    }),
  )
}

function handleClick(r: number, c: number) {
  if (state.value === 'won' || state.value === 'lost') return
  const cell = g(r, c)
  if (cell.flagged || cell.revealed) return

  if (state.value === 'idle') {
    state.value = 'playing'
    placeMines(r, c)
    startTimer()
  }

  if (cell.mine) { loseGame(r, c); return }
  reveal(r, c)
  if (checkWin()) { state.value = 'won'; stopTimer() }
}

function handleRightClick(e: MouseEvent, r: number, c: number) {
  e.preventDefault()
  if (state.value === 'won' || state.value === 'lost') return
  const cell = g(r, c)
  if (cell.revealed) return
  cell.flagged = !cell.flagged
  flagCount.value += cell.flagged ? 1 : -1
}

function handleChord(r: number, c: number) {
  const cell = g(r, c)
  if (!cell.revealed || cell.adjacent === 0) return
  const coords = neighborCoords(r, c)
  const flagged = coords.filter(([nr, nc]) => g(nr, nc).flagged).length
  if (flagged !== cell.adjacent) return
  for (const [nr, nc] of coords) {
    const n = g(nr, nc)
    if (!n.flagged && !n.revealed) {
      if (n.mine) { loseGame(nr, nc); return }
      reveal(nr, nc)
    }
  }
  if (checkWin()) { state.value = 'won'; stopTimer() }
}

function reset() {
  stopTimer()
  grid.value = makeGrid()
  state.value = 'idle'
  startTime.value = null
  elapsed.value = 0
  flagCount.value = 0
  facePressed.value = false
  cellPressed.value = null
}

reset()

const NUM_COLOR = ['', '#0000ff', '#007b00', '#ff0000', '#00007b', '#7b0000', '#007b7b', '#000', '#7b7b7b']
</script>

<template>
  <div class="ms-root has-scrollbar">
    <!-- Outer raised frame -->
    <div class="ms-window has-scrollbar">
      <!-- Top bar inset panel -->
      <div class="ms-topbar">
        <!-- Mine counter -->
        <div class="ms-lcd">
          <svg v-for="(ch, i) in displayMines" :key="i" class="ms-digit" viewBox="0 0 10 18">
            <rect width="10" height="18" fill="#000" />
            <!-- top -->
            <rect x="1" y="1" width="8" height="2" :fill="SEG[ch]?.[0] ? '#ff0000' : '#3a0000'" />
            <!-- top-right -->
            <rect x="8" y="1" width="2" height="8" :fill="SEG[ch]?.[1] ? '#ff0000' : '#3a0000'" />
            <!-- bot-right -->
            <rect x="8" y="9" width="2" height="8" :fill="SEG[ch]?.[2] ? '#ff0000' : '#3a0000'" />
            <!-- bottom -->
            <rect x="1" y="15" width="8" height="2" :fill="SEG[ch]?.[3] ? '#ff0000' : '#3a0000'" />
            <!-- bot-left -->
            <rect x="0" y="9" width="2" height="8" :fill="SEG[ch]?.[4] ? '#ff0000' : '#3a0000'" />
            <!-- top-left -->
            <rect x="0" y="1" width="2" height="8" :fill="SEG[ch]?.[5] ? '#ff0000' : '#3a0000'" />
            <!-- mid -->
            <rect x="1" y="8" width="8" height="2" :fill="SEG[ch]?.[6] ? '#ff0000' : '#3a0000'" />
          </svg>
        </div>

        <!-- Smiley face button -->
        <button
          class="ms-face"
          :class="{ pressed: facePressed }"
          @mousedown="facePressed = true"
          @mouseup="facePressed = false; reset()"
          @mouseleave="facePressed = false"
        >
          <svg viewBox="0 0 24 24" width="22" height="22">
            <!-- face circle -->
            <circle cx="12" cy="12" r="10" fill="#ffff00" stroke="#000" stroke-width="1.5" />
            <!-- eyes -->
            <template v-if="state !== 'lost'">
              <circle cx="8.5" cy="9.5" r="1.5" fill="#000" />
              <circle cx="15.5" cy="9.5" r="1.5" fill="#000" />
            </template>
            <!-- x eyes on lose -->
            <template v-else>
              <line x1="7" y1="8" x2="10" y2="11" stroke="#000" stroke-width="1.5" stroke-linecap="round" />
              <line x1="10" y1="8" x2="7" y2="11" stroke="#000" stroke-width="1.5" stroke-linecap="round" />
              <line x1="14" y1="8" x2="17" y2="11" stroke="#000" stroke-width="1.5" stroke-linecap="round" />
              <line x1="17" y1="8" x2="14" y2="11" stroke="#000" stroke-width="1.5" stroke-linecap="round" />
            </template>
            <!-- mouth -->
            <template v-if="state === 'won'">
              <!-- big grin -->
              <path d="M8 14 Q12 20 16 14" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" />
            </template>
            <template v-else-if="state === 'lost'">
              <!-- sad -->
              <path d="M8 17 Q12 13 16 17" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" />
            </template>
            <template v-else-if="cellPressed">
              <!-- o-mouth while clicking -->
              <ellipse cx="12" cy="15" rx="2.5" ry="2" fill="#000" />
            </template>
            <template v-else>
              <!-- normal smile -->
              <path d="M8 14 Q12 18 16 14" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" />
            </template>
            <!-- sunglasses on win -->
            <template v-if="state === 'won'">
              <rect x="5.5" y="8" width="5" height="3.5" rx="1" fill="#000" />
              <rect x="13.5" y="8" width="5" height="3.5" rx="1" fill="#000" />
              <line x1="10.5" y1="9.5" x2="13.5" y2="9.5" stroke="#000" stroke-width="1" />
            </template>
          </svg>
        </button>

        <!-- Time counter -->
        <div class="ms-lcd">
          <svg v-for="(ch, i) in displayTime" :key="i" class="ms-digit" viewBox="0 0 10 18">
            <rect width="10" height="18" fill="#000" />
            <rect x="1" y="1" width="8" height="2" :fill="SEG[ch]?.[0] ? '#ff0000' : '#3a0000'" />
            <rect x="8" y="1" width="2" height="8" :fill="SEG[ch]?.[1] ? '#ff0000' : '#3a0000'" />
            <rect x="8" y="9" width="2" height="8" :fill="SEG[ch]?.[2] ? '#ff0000' : '#3a0000'" />
            <rect x="1" y="15" width="8" height="2" :fill="SEG[ch]?.[3] ? '#ff0000' : '#3a0000'" />
            <rect x="0" y="9" width="2" height="8" :fill="SEG[ch]?.[4] ? '#ff0000' : '#3a0000'" />
            <rect x="0" y="1" width="2" height="8" :fill="SEG[ch]?.[5] ? '#ff0000' : '#3a0000'" />
            <rect x="1" y="8" width="8" height="2" :fill="SEG[ch]?.[6] ? '#ff0000' : '#3a0000'" />
          </svg>
        </div>
      </div>

      <!-- Grid panel inset -->
      <div class="ms-grid-panel has-scrollbar">
        <div class="ms-grid has-scrollbar">
          <div v-for="(row, r) in grid" :key="r" class="ms-row has-scrollbar">
            <button
              v-for="(cell, c) in row"
              :key="c"
              class="cell"
              :class="{
                unrevealed: !cell.revealed,
                revealed: cell.revealed && !cell.mine && !cell.wrongFlag,
                'mine-hit': cell.revealed && cell.mine && cellPressed?.[0] === r && cellPressed?.[1] === c,
                pressed: !cell.revealed && !cell.flagged && cellPressed?.[0] === r && cellPressed?.[1] === c,
              }"
              :style="cell.revealed && cell.adjacent > 0 && !cell.mine ? { color: NUM_COLOR[cell.adjacent] } : {}"
              @click="handleClick(r, c)"
              @contextmenu="(e) => handleRightClick(e, r, c)"
              @dblclick="handleChord(r, c)"
              @mousedown.left="cellPressed = [r, c]"
              @mouseup.left="cellPressed = null"
              @mouseleave="cellPressed = null"
              @mousedown.middle.prevent
              @mouseup.middle="handleChord(r, c)"
            >
              <!-- Flag -->
              <svg v-if="!cell.revealed && cell.flagged" viewBox="0 0 16 16" width="13" height="13">
                <rect x="7" y="2" width="2" height="12" fill="#000" />
                <polygon points="7,2 14,5.5 7,9" fill="#ff0000" />
                <rect x="4" y="13" width="8" height="2" fill="#000" />
              </svg>
              <!-- Wrong flag (loss) -->
              <template v-else-if="cell.wrongFlag">
                <svg viewBox="0 0 16 16" width="13" height="13">
                  <rect x="7" y="2" width="2" height="12" fill="#000" />
                  <polygon points="7,2 14,5.5 7,9" fill="#ff0000" />
                  <rect x="4" y="13" width="8" height="2" fill="#000" />
                  <!-- X overlay -->
                  <line x1="2" y1="2" x2="14" y2="14" stroke="#ff0000" stroke-width="2" stroke-linecap="round" />
                  <line x1="14" y1="2" x2="2" y2="14" stroke="#ff0000" stroke-width="2" stroke-linecap="round" />
                </svg>
              </template>
              <!-- Mine (revealed) -->
              <svg v-else-if="cell.revealed && cell.mine" viewBox="0 0 16 16" width="13" height="13">
                <!-- spikes -->
                <line x1="8" y1="1" x2="8" y2="15" stroke="#000" stroke-width="1.5" />
                <line x1="1" y1="8" x2="15" y2="8" stroke="#000" stroke-width="1.5" />
                <line x1="3" y1="3" x2="13" y2="13" stroke="#000" stroke-width="1.5" />
                <line x1="13" y1="3" x2="3" y2="13" stroke="#000" stroke-width="1.5" />
                <!-- body -->
                <circle cx="8" cy="8" r="4.5" fill="#000" />
                <!-- shine -->
                <circle cx="6.5" cy="6.5" r="1" fill="#fff" />
              </svg>
              <!-- Number -->
              <span v-else-if="cell.revealed && cell.adjacent > 0">{{ cell.adjacent }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ms-root {
  background: #c0c0c0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: auto;
  padding: 6px;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
  user-select: none;
}

/* Outer window raised border */
.ms-window {
  display: inline-flex;
  flex-direction: column;
  background: #c0c0c0;
  border-top: 3px solid #fff;
  border-left: 3px solid #fff;
  border-right: 3px solid #808080;
  border-bottom: 3px solid #808080;
  padding: 8px;
  gap: 8px;
}

/* Top panel inset */
.ms-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #c0c0c0;
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  padding: 5px 8px;
}

/* 7-segment LCD display */
.ms-lcd {
  background: #000;
  display: flex;
  gap: 1px;
  padding: 3px 4px;
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
}

.ms-digit {
  display: block;
  width: 13px;
  height: 23px;
}

/* Face button */
.ms-face {
  background: #c0c0c0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  width: 34px;
  height: 34px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ms-face.pressed,
.ms-face:active {
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
}

/* Grid outer inset */
.ms-grid-panel {
  border-top: 3px solid #808080;
  border-left: 3px solid #808080;
  border-right: 3px solid #fff;
  border-bottom: 3px solid #fff;
  display: inline-block;
}

.ms-grid {
  display: flex;
  flex-direction: column;
}

.ms-row {
  display: flex;
}

/* Cells */
.cell {
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  background: #c0c0c0;
  border: none;
}

/* Unrevealed: raised */
.cell.unrevealed {
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #808080;
  border-bottom: 2px solid #808080;
  cursor: pointer;
}

/* Pressed while holding mousedown */
.cell.pressed {
  border-top: 1px solid #808080;
  border-left: 1px solid #808080;
  border-right: 1px solid #fff;
  border-bottom: 1px solid #fff;
  background: #c0c0c0;
}

/* Revealed empty/number */
.cell.revealed {
  border: 1px solid #808080;
  background: #c0c0c0;
}

/* The mine that was hit — red bg */
.cell.mine-hit {
  background: #ff0000;
  border: 1px solid #808080;
}
</style>
