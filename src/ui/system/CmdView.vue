<template>
  <div class="cmd-root" :style="{ background: bgColor, color: fgColor }" @click="focusInput">
    <!-- Output history -->

    <div class="cmd-output" ref="outputEl">
      <div v-for="(line, i) in output" :key="i" class="cmd-line">
        <pre
          tabindex="0"
          :style="{ color: line.color || fgColor }"
          class="ascii-art"
          v-if="line.ascii"
          >{{ line.text }}</pre
        >
        <span v-else :style="{ color: line.color || fgColor }" v-html="line.text" />
      </div>
    </div>

    <!-- Input row -->
    <div class="cmd-input-row">
      <span v-if="interactive" class="cmd-prompt" :style="{ color: fgColor }"
        >{{ cwd }}&gt;&nbsp;</span
      >
      <input
        ref="inputEl"
        v-model="inputText"
        class="cmd-input"
        :style="{ color: fgColor, caretColor: fgColor }"
        spellcheck="false"
        autocomplete="off"
        @keydown.ctrl.c.prevent="clear"
        @keydown.enter="run"
        @keydown.up.prevent="historyUp"
        @keydown.down.prevent="historyDown"
        @keydown.tab.prevent="tabComplete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useWindowStore } from '../../stores/window'
import type { ApplicationInterface } from '@/types/window'
import { FRAMES } from '@/helpers/frame'

// ── Types ──
export interface CmdContext {
  cwd: ReturnType<typeof ref<string>>
  push: (text: string, color?: string, ascii?: boolean) => void
  clear: () => void
  setColor: (bg: string, fg: string) => void
}

type CommandFn = (args: string[], ctx: CmdContext) => void

const props = defineProps<{
  initialDir?: string
  welcome?: string[]
  /** Custom commands merged with built-ins. Custom wins on collision. */
  commands?: Record<string, CommandFn>
}>()

// ── State ──
const output = ref<{ text: string; color?: string; ascii: boolean }[]>([])
const inputText = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const outputEl = ref<HTMLElement | null>(null)
const cwd = ref(props.initialDir ?? 'C:\\')

const interactive = ref<boolean>(true)
const intervals = ref<ReturnType<typeof setInterval>[]>([])

const store = useWindowStore()

const tree = store.applications.filter((app) => app.type === 'folder')

// ponytail: 16-color palette matches Windows CMD color codes
const COLOR_MAP: Record<string, string> = {
  '0': '#000000',
  '1': '#000080',
  '2': '#008000',
  '3': '#008080',
  '4': '#800000',
  '5': '#800080',
  '6': '#808000',
  '7': '#c0c0c0',
  '8': '#808080',
  '9': '#0000ff',
  A: '#00ff00',
  B: '#00ffff',
  C: '#ff0000',
  D: '#ff00ff',
  E: '#ffff00',
  F: '#ffffff',
}

const bgColor = ref('#000000')
const fgColor = ref('#c0c0c0')

// History navigation
const cmdHistory = ref<string[]>([])
let historyIdx = -1

const cwdObject = ref<Record<string, ApplicationInterface>>({})

// ── Helpers ──
const ctx: CmdContext = {
  cwd,
  push: (text, color, ascii) => output.value.push({ text, color, ascii: ascii || false }),
  clear: () => {
    output.value = []
  },
  setColor: (bg, fg) => {
    bgColor.value = COLOR_MAP[bg.toUpperCase()] ?? bgColor.value
    fgColor.value = COLOR_MAP[fg.toUpperCase()] ?? fgColor.value
  },
}

function push(text: string, color?: string) {
  ctx.push(text, color)
}
function pushBlank() {
  push('&nbsp;')
}

async function scroll() {
  await nextTick()
  if (outputEl.value) outputEl.value.scrollTop = outputEl.value.scrollHeight
}

function clear() {
  interactive.value = true
  for (const id of intervals.value) clearInterval(id)
  intervals.value = []
}

const readTree = (accumulate: Record<string, string[]>) => {
  accumulate[cwd.value] = tree.map((app) => app.name)

  const read = (node: ApplicationInterface, path: string) => {
    accumulate[path] = node.children?.map((child) => child.name) ?? []
    for (const child of node.children ?? []) {
      if (child.type === 'folder') read(child, `${path}\\${child.name}`)

      if (child.type !== 'folder') cwdObject.value[`${path}\\${child.name}`] = child
    }
  }
  for (const app of tree) {
    read(app, `${cwd.value}${app.name}`)
  }
  return accumulate
}

const FAKE_FS: Record<string, string[]> = readTree({})

function listDir(path: string): string[] {
  const key = Object.keys(FAKE_FS).find((k) => k.toLowerCase() === path.toLowerCase())
  return key ? (FAKE_FS[key] ?? []) : []
}

// ── Built-in commands ──
const builtins: Record<string, CommandFn> = {
  help: (_args, { push }) => {
    push('Available commands:')
    push('&nbsp;')
    const all = { ...builtins, ...(props.commands) }
    for (const name of Object.keys(all).sort()) push(`  ${name}`)
    pushBlank()
  },

  cls: (_args, { clear }) => clear(),

  echo: (args, { push }) => push(args.join(' ') || '&nbsp;'),

  start(args, { push }) {
    push('&nbsp;')
    push('Microsoft Windows [Version 6.1.7601]')
    push('Copyright (c) 2009 Microsoft Corporation.  All rights reserved.')
    pushBlank()

    if (!args[0]) {
      push('The syntax of the command is incorrect.')
      return
    }

    const findByApp = (name: string) => {
      const app = cwdObject.value[`${cwd.value}\\${args[0]}`]

      if (!app) {
        return store.applications
          .filter((app) => app.type === 'application')
          .find((app) => `${app.name.replace(' ', '').toLowerCase()}.exe` === name.toLowerCase())
      }

      return app
    }
    const app = findByApp(args[0])
    if (!app) {
      push(`Could not find an application named "${args[0]}".`)
      return
    }

    if (app.app) {
      return app.app().run()
    }

    store.addProgramActive(app.id)
  },

  date: (_args, { push }) => {
    push('The current date is: ' + new Date().toLocaleDateString())
  },

  animate(args, { push, clear }) {
    let index = 0
    const input = args[0] ?? 'parrot'

    if (!FRAMES[input]) {
      push(`The animation not supported: "${input}".`)
      return
    }
    interactive.value = false

    const colors = FRAMES[input].colors

    const frames = FRAMES[input].ascii()

    const fps = FRAMES[input].fps ?? 10

    let ticks = frames[index]?.duration ?? 1

    intervals.value.push(
      setInterval(() => {
        clear()
        pushBlank()
        const value = frames[index]
        push(value?.frame ?? '', colors[index % colors.length], true)

        ticks--

        if (ticks <= 0) {
          ticks = value?.duration ?? 1
          index = (index + 1) % frames.length
        }
      }, 1000 / fps),
    )
  },

  time: (_args, { push }) => {
    push('The current time is: ' + new Date().toLocaleTimeString())
  },

  cd: (args, { cwd, push }) => {
    if (!cwd || !cwd.value) {
      push('The system cannot find the path specified.')
      return
    }

    if (!args[0] || args[0] === '.') return
    if (args[0] === '..') {
      const parts = cwd.value.split('\\')
      if (parts.length > 1) parts.pop()
      cwd.value = parts.length !== 1 ? parts.join('\\') : 'C:\\'
      return
    }
    if (args[0].includes(':\\')) {
      cwd.value = args[0]
      return
    }
    const next = cwd.value.replace(/\\$/, '') + '\\' + args[0]
    const entries = listDir(next)
    if (entries.length === 0 && !FAKE_FS[next]) {
      push(`The system cannot find the path specified.`)
      return
    }
    cwd.value = next
  },

  dir: (_args, { cwd, push }) => {
    if (!cwd.value) {
      push('The system cannot find the path specified.')
      return
    }
    const entries = listDir(cwd.value)
    push('&nbsp;')
    push(` Directory of ${cwd.value}`)
    push('&nbsp;')
    if (entries.length === 0) {
      push('File Not Found')
    } else {
      const now = new Date().toLocaleDateString()
      for (const e of entries) {
        const isDir = !e.includes('.')
        push(`${now}  ${isDir ? '&lt;DIR&gt;          ' : '             '}  ${e}`)
      }
      push('&nbsp;')
      push(`        ${entries.filter((e) => e.includes('.')).length} File(s)`)
      push(`        ${entries.filter((e) => !e.includes('.')).length} Dir(s)`)
    }
    pushBlank()
  },

  color: (args, { push, setColor }) => {
    const code = (args[0] ?? '').toUpperCase()
    if (!code || code.length !== 2) {
      push('Sets the default console foreground and background colors.')
      push('COLOR [attr]')
      push('  attr   Two hex digits: first = background, second = foreground')
      push('  Example: color 0A  (black bg, green fg)')
      return
    }
    const [bg, fg] = [code[0], code[1]]

    if (!bg || !fg) {
      push('Invalid color attribute.')
      return
    }
    if (!COLOR_MAP[bg] || !COLOR_MAP[fg]) {
      push('Invalid color attribute.')
      return
    }
    if (bg === fg) {
      push('The foreground and background colors cannot be the same.')
      return
    }
    setColor(bg, fg)
  },

  prompt: (args, { cwd, push }) => {
    // ponytail: just echo current path, no real prompt logic
    push(cwd.value + '>')
  },

  type: (args, { push }) => {
    if (!args[0]) {
      push('The syntax of the command is incorrect.')
      return
    }
    push(`${args[0]}: Access is denied.`) // ponytail: no real file reading
  },
}

// ── Command runner ──
function run() {
  const raw = inputText.value.trim()
  push(`${cwd.value}&gt; ${raw}`)
  inputText.value = ''
  historyIdx = -1

  if (!raw) {
    scroll()
    return
  }

  cmdHistory.value.unshift(raw)

  const [name, ...args] = raw.split(/\s+/)

  if (!name || !interactive.value) return

  const cmd = (props.commands ?? {})[name.toLowerCase()] ?? builtins[name.toLowerCase()]

  if (!cmd) {
    push(`'${name}' is not recognized as an internal or external command,`)
    push('operable program or batch file.')
    pushBlank()
  } else {
    cmd(args, ctx)
  }
  scroll()
}

// ── History navigation ──
function historyUp() {
  if (cmdHistory.value.length === 0) return
  historyIdx = Math.min(historyIdx + 1, cmdHistory.value.length - 1)
  inputText.value = cmdHistory.value[historyIdx] ?? ''
}
function historyDown() {
  historyIdx = Math.max(historyIdx - 1, -1)
  inputText.value = historyIdx === -1 ? '' : (cmdHistory.value[historyIdx] ?? '')
}

// ── Tab completion ──
function tabComplete() {
  const partial = inputText.value.split(/\s+/).pop() ?? ''
  const entries = listDir(cwd.value)
  const match = entries.find((e) => e.toLowerCase().startsWith(partial.toLowerCase()))
  if (match) {
    const parts = inputText.value.split(/\s+/)
    parts[parts.length - 1] = match
    inputText.value = parts.join(' ')
  }
}

function focusInput() {
  inputEl.value?.focus()
}

// ── Init ──
onMounted(() => {
  const welcome = props.welcome ?? [
    'Microsoft Windows [Version 6.1.7601]',
    'Copyright (c) 2009 Microsoft Corporation. All rights reserved.',
    '&nbsp;',
  ]
  for (const line of welcome) push(line)
  focusInput()
})
</script>

<style scoped>
.cmd-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 4px 6px;
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  cursor: text;
  overflow: hidden;
}

.cmd-output {
  overflow-y: auto;
  word-break: break-all;
  white-space: pre-wrap;
}

/* ponytail: hide scrollbar cosmetically, still scrollable */
.cmd-output::-webkit-scrollbar {
  width: 6px;
}
.cmd-output::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}

.cmd-line {
  min-height: 1.4em;
}

.cmd-input-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.cmd-prompt {
  white-space: nowrap;
  flex-shrink: 0;
}

.cmd-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  padding: 0;
}

.ascii-art {
  width: 100%;
  height: 100%;
  font-family: 'Courier New', Consolas, Menlo, monospace;
  white-space: pre;
  overflow: hidden;
  line-height: 1.1;
  font-size: 12px;
  margin: 0;
}
</style>
