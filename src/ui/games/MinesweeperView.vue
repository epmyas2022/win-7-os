<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

// ponytail: grid rendered on <canvas> — eliminates 480 DOM nodes + SVG overhead
const CELL = 20
const ROWS = 16
const COLS = 30
const TOTAL_MINES = 99

type Cell = {
  mine: boolean
  revealed: boolean
  flagged: boolean
  wrongFlag: boolean
  adjacent: number
}
type GameState = 'idle' | 'playing' | 'won' | 'lost'

// ── Game state (flat, no Vue reactivity on grid — canvas draws directly) ──
// ponytail: grid is a plain array, not a ref — mutations don't trigger Vue renders
let grid: Cell[][] = []
const state = ref<GameState>('idle')
const elapsed = ref(0)
const flagCount = ref(0)
const facePressed = ref(false)
let startTime: number | null = null
let timerInterval: ReturnType<typeof setInterval> | null = null
let hitCell: [number, number] | null = null   // mine that was clicked (red bg)
let pressedCell: [number, number] | null = null // cell held down (inset look)

const canvasEl = ref<HTMLCanvasElement | null>(null)

// ── Computed (only for topbar) ──
const minesLeft = computed(() => TOTAL_MINES - flagCount.value)
const displayTime = computed(() => Math.min(elapsed.value, 999).toString().padStart(3, '0'))
const displayMines = computed(() => {
  const n = minesLeft.value
  return n < 0 ? '-' + Math.abs(n).toString().padStart(2, '0') : n.toString().padStart(3, '0')
})

// 7-segment map: top, top-right, bot-right, bot, bot-left, top-left, mid
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

// ── Canvas draw helpers ──
const NUM_COLOR = ['', '#0000ff', '#007b00', '#ff0000', '#00007b', '#7b0000', '#007b7b', '#000', '#7b7b7b']

function ctx(): CanvasRenderingContext2D | null {
  return canvasEl.value?.getContext('2d') ?? null
}

function drawRaised(c: CanvasRenderingContext2D, x: number, y: number) {
  c.fillStyle = '#c0c0c0'
  c.fillRect(x, y, CELL, CELL)
  // white highlights (top, left)
  c.fillStyle = '#ffffff'
  c.fillRect(x, y, CELL, 2)
  c.fillRect(x, y, 2, CELL)
  // dark shadow (bottom, right — outer)
  c.fillStyle = '#404040'
  c.fillRect(x + CELL - 1, y, 1, CELL)
  c.fillRect(x, y + CELL - 1, CELL, 1)
  // mid shadow
  c.fillStyle = '#808080'
  c.fillRect(x + CELL - 2, y + 1, 1, CELL - 1)
  c.fillRect(x + 1, y + CELL - 2, CELL - 2, 1)
}

function drawInset(c: CanvasRenderingContext2D, x: number, y: number, bg = '#c0c0c0') {
  c.fillStyle = bg
  c.fillRect(x, y, CELL, CELL)
  c.fillStyle = '#808080'
  c.fillRect(x, y, CELL, 1)
  c.fillRect(x, y, 1, CELL)
}

function drawFlag(c: CanvasRenderingContext2D, x: number, y: number) {
  const cx = x + CELL / 2, cy = y + CELL / 2
  c.fillStyle = '#000'
  c.fillRect(cx - 1, cy - 6, 2, 11) // pole
  c.fillStyle = '#ff0000'
  c.beginPath()
  c.moveTo(cx - 1, cy - 6)
  c.lineTo(cx + 7, cy - 2)
  c.lineTo(cx - 1, cy + 2)
  c.fill()
  c.fillStyle = '#000'
  c.fillRect(cx - 5, cy + 5, 10, 2) // base
}

function drawMine(c: CanvasRenderingContext2D, x: number, y: number) {
  const cx = x + CELL / 2, cy = y + CELL / 2, r = 4
  c.strokeStyle = '#000'
  c.lineWidth = 1.5
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4
    c.beginPath()
    c.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    c.lineTo(cx + Math.cos(a) * (r + 3), cy + Math.sin(a) * (r + 3))
    c.stroke()
  }
  c.fillStyle = '#000'
  c.beginPath()
  c.arc(cx, cy, r, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#fff'
  c.beginPath()
  c.arc(cx - 1.5, cy - 1.5, 1.2, 0, Math.PI * 2)
  c.fill()
}

function drawCell(c: CanvasRenderingContext2D, r: number, col: number) {
  const cell = grid[r]![col]!
  const x = col * CELL, y = r * CELL
  const isHit = hitCell?.[0] === r && hitCell?.[1] === col
  const isPressed = pressedCell?.[0] === r && pressedCell?.[1] === col

  if (cell.wrongFlag) {
    drawRaised(c, x, y)
    drawFlag(c, x, y)
    c.strokeStyle = '#ff0000'
    c.lineWidth = 2
    c.beginPath(); c.moveTo(x + 3, y + 3); c.lineTo(x + CELL - 3, y + CELL - 3); c.stroke()
    c.beginPath(); c.moveTo(x + CELL - 3, y + 3); c.lineTo(x + 3, y + CELL - 3); c.stroke()
    return
  }
  if (!cell.revealed) {
    if (isPressed) drawInset(c, x, y)
    else { drawRaised(c, x, y); if (cell.flagged) drawFlag(c, x, y) }
    return
  }
  if (cell.mine) {
    drawInset(c, x, y, isHit ? '#ff0000' : '#c0c0c0')
    drawMine(c, x, y)
    return
  }
  drawInset(c, x, y)
  if (cell.adjacent > 0) {
    c.fillStyle = NUM_COLOR[cell.adjacent] ?? '#000'
    c.font = 'bold 13px Arial'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText(String(cell.adjacent), x + CELL / 2, y + CELL / 2 + 1)
  }
}

// ponytail: draw all 480 cells in one pass — ~0.5ms, far cheaper than 480 DOM nodes
function draw() {
  const c = ctx()
  if (!c) return
  for (let r = 0; r < ROWS; r++)
    for (let col = 0; col < COLS; col++)
      drawCell(c, r, col)
}

// ── Game logic ──
function makeGrid(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false, revealed: false, flagged: false, wrongFlag: false, adjacent: 0,
    })),
  )
}

function neighborCoords(r: number, c: number): [number, number][] {
  const out: [number, number][] = []
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) out.push([nr, nc])
    }
  return out
}

function placeMines(safeR: number, safeC: number) {
  let placed = 0
  while (placed < TOTAL_MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    const cell = grid[r]![c]!
    if (cell.mine) continue
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue
    cell.mine = true
    placed++
  }
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r]![c]!
      if (!cell.mine) cell.adjacent = neighborCoords(r, c).filter(([nr, nc]) => grid[nr]![nc]!.mine).length
    }
}

function reveal(r: number, c: number) {
  const cell = grid[r]![c]!
  if (cell.revealed || cell.flagged) return
  cell.revealed = true
  if (cell.adjacent === 0 && !cell.mine)
    neighborCoords(r, c).forEach(([nr, nc]) => reveal(nr, nc))
}

function checkWin() {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!grid[r]![c]!.mine && !grid[r]![c]!.revealed) return false
  return true
}

function startTimer() {
  startTime = Date.now()
  timerInterval = setInterval(() => { elapsed.value = Math.floor((Date.now() - startTime!) / 1000) }, 1000)
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

function loseGame(r: number, c: number) {
  hitCell = [r, c]
  grid[r]![c]!.revealed = true
  state.value = 'lost'
  stopTimer()
  grid.forEach(row => row.forEach((cell: Cell) => {
    if (cell.mine && !cell.flagged) cell.revealed = true
    if (!cell.mine && cell.flagged) cell.wrongFlag = true
  }))
  draw()
}

function handleCanvasClick(e: MouseEvent) {
  if (state.value === 'won' || state.value === 'lost') return
  const [r, c] = cellFromEvent(e) ?? [-1, -1]
  if (r < 0) return
  const cell = grid[r]![c]!
  if (cell.flagged || cell.revealed) return

  if (state.value === 'idle') {
    state.value = 'playing'
    placeMines(r, c)
    startTimer()
  }

  if (cell.mine) { loseGame(r, c); return }
  reveal(r, c)
  if (checkWin()) { state.value = 'won'; stopTimer() }
  draw()
}

function handleCanvasRightClick(e: MouseEvent) {
  e.preventDefault()
  if (state.value === 'won' || state.value === 'lost') return
  const [r, c] = cellFromEvent(e) ?? [-1, -1]
  if (r < 0) return
  const cell = grid[r]![c]!
  if (cell.revealed) return
  cell.flagged = !cell.flagged
  flagCount.value += cell.flagged ? 1 : -1
  draw()
}

function handleCanvasMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  const pos = cellFromEvent(e)
  if (!pos) return
  const [r, c] = pos
  const cell = grid[r]![c]!
  if (!cell.revealed && !cell.flagged) {
    pressedCell = [r, c]
    draw()
  }
}

function handleCanvasMouseUp(e: MouseEvent) {
  if (e.button !== 0 || !pressedCell) return
  pressedCell = null
  draw()
}

function handleCanvasDblClick(e: MouseEvent) {
  const [r, c] = cellFromEvent(e) ?? [-1, -1]
  if (r < 0) return
  const cell = grid[r]![c]!
  if (!cell.revealed || cell.adjacent === 0) return
  const coords = neighborCoords(r, c)
  if (coords.filter(([nr, nc]) => grid[nr]![nc]!.flagged).length !== cell.adjacent) return
  for (const [nr, nc] of coords) {
    const n = grid[nr]![nc]!
    if (!n.flagged && !n.revealed) {
      if (n.mine) { loseGame(nr, nc); return }
      reveal(nr, nc)
    }
  }
  if (checkWin()) { state.value = 'won'; stopTimer() }
  draw()
}

function cellFromEvent(e: MouseEvent): [number, number] | null {
  const rect = canvasEl.value!.getBoundingClientRect()
  const c = Math.floor((e.clientX - rect.left) / CELL)
  const r = Math.floor((e.clientY - rect.top) / CELL)
  return r >= 0 && r < ROWS && c >= 0 && c < COLS ? [r, c] : null
}

function reset() {
  stopTimer()
  grid = makeGrid()
  state.value = 'idle'
  elapsed.value = 0
  flagCount.value = 0
  startTime = null
  hitCell = null
  pressedCell = null
  facePressed.value = false
  nextTick(draw)
}

onMounted(() => { reset() })
</script>

<template>
  <div class="ms-root has-scrollbar">
    <div class="ms-window">
      <!-- Topbar: LCD + face + LCD (stays as DOM — only 6 elements) -->
      <div class="ms-topbar">
        <div class="ms-lcd">
          <svg v-for="(ch, i) in displayMines" :key="i" class="ms-digit" viewBox="0 0 10 18">
            <rect width="10" height="18" fill="#000" />
            <rect x="1" y="1"  width="8" height="2" :fill="SEG[ch]?.[0] ? '#ff0000' : '#3a0000'" />
            <rect x="8" y="1"  width="2" height="8" :fill="SEG[ch]?.[1] ? '#ff0000' : '#3a0000'" />
            <rect x="8" y="9"  width="2" height="8" :fill="SEG[ch]?.[2] ? '#ff0000' : '#3a0000'" />
            <rect x="1" y="15" width="8" height="2" :fill="SEG[ch]?.[3] ? '#ff0000' : '#3a0000'" />
            <rect x="0" y="9"  width="2" height="8" :fill="SEG[ch]?.[4] ? '#ff0000' : '#3a0000'" />
            <rect x="0" y="1"  width="2" height="8" :fill="SEG[ch]?.[5] ? '#ff0000' : '#3a0000'" />
            <rect x="1" y="8"  width="8" height="2" :fill="SEG[ch]?.[6] ? '#ff0000' : '#3a0000'" />
          </svg>
        </div>

        <button
          class="ms-face"
          :class="{ pressed: facePressed }"
          @mousedown="facePressed = true"
          @mouseup="facePressed = false; reset()"
          @mouseleave="facePressed = false"
        >
          <svg viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="12" r="10" fill="#ffff00" stroke="#000" stroke-width="1.5" />
            <template v-if="state !== 'lost'">
              <circle cx="8.5" cy="9.5" r="1.5" fill="#000" />
              <circle cx="15.5" cy="9.5" r="1.5" fill="#000" />
            </template>
            <template v-else>
              <line x1="7" y1="8" x2="10" y2="11" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="10" y1="8" x2="7"  y2="11" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="14" y1="8" x2="17" y2="11" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="17" y1="8" x2="14" y2="11" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
            </template>
            <template v-if="state === 'won'">
              <path d="M8 14 Q12 20 16 14" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
              <rect x="5.5" y="8" width="5" height="3.5" rx="1" fill="#000"/>
              <rect x="13.5" y="8" width="5" height="3.5" rx="1" fill="#000"/>
              <line x1="10.5" y1="9.5" x2="13.5" y2="9.5" stroke="#000" stroke-width="1"/>
            </template>
            <template v-else-if="state === 'lost'">
              <path d="M8 17 Q12 13 16 17" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
            </template>
            <template v-else>
              <path d="M8 14 Q12 18 16 14" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
            </template>
          </svg>
        </button>

        <div class="ms-lcd">
          <svg v-for="(ch, i) in displayTime" :key="i" class="ms-digit" viewBox="0 0 10 18">
            <rect width="10" height="18" fill="#000" />
            <rect x="1" y="1"  width="8" height="2" :fill="SEG[ch]?.[0] ? '#ff0000' : '#3a0000'" />
            <rect x="8" y="1"  width="2" height="8" :fill="SEG[ch]?.[1] ? '#ff0000' : '#3a0000'" />
            <rect x="8" y="9"  width="2" height="8" :fill="SEG[ch]?.[2] ? '#ff0000' : '#3a0000'" />
            <rect x="1" y="15" width="8" height="2" :fill="SEG[ch]?.[3] ? '#ff0000' : '#3a0000'" />
            <rect x="0" y="9"  width="2" height="8" :fill="SEG[ch]?.[4] ? '#ff0000' : '#3a0000'" />
            <rect x="0" y="1"  width="2" height="8" :fill="SEG[ch]?.[5] ? '#ff0000' : '#3a0000'" />
            <rect x="1" y="8"  width="8" height="2" :fill="SEG[ch]?.[6] ? '#ff0000' : '#3a0000'" />
          </svg>
        </div>
      </div>

      <!-- Grid: single canvas instead of 480 buttons -->
      <div class="ms-grid-panel">
        <canvas
          ref="canvasEl"
          :width="COLS * CELL"
          :height="ROWS * CELL"
          style="display:block;cursor:default"
          @click="handleCanvasClick"
          @contextmenu="handleCanvasRightClick"
          @dblclick="handleCanvasDblClick"
          @mousedown="handleCanvasMouseDown"
          @mouseup="handleCanvasMouseUp"
          @mouseleave="() => { if (pressedCell) { pressedCell = null; draw() } }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ms-root {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #c0c0c0;
  padding: 8px;
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
  user-select: none;
}

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

.ms-grid-panel {
  border-top: 3px solid #808080;
  border-left: 3px solid #808080;
  border-right: 3px solid #fff;
  border-bottom: 3px solid #fff;
  display: inline-block;
  line-height: 0;
}
</style>
