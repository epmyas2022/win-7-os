<template>
  <div class="cmd-root" :style="{ background: bgColor, color: fgColor }" @click="focusInput">
    <!-- Output history -->
    <div class="cmd-output" ref="outputEl">
      <div v-for="(line, i) in output" :key="i" class="cmd-line">
        <span :style="{ color: line.color || fgColor }" v-html="line.text" />
      </div>
    </div>

    <!-- Input row -->
    <div class="cmd-input-row">
      <span class="cmd-prompt" :style="{ color: fgColor }">{{ cwd }}&gt;&nbsp;</span>
      <input
        ref="inputEl"
        v-model="inputText"
        class="cmd-input"
        :style="{ color: fgColor, caretColor: fgColor }"
        spellcheck="false"
        autocomplete="off"
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

// ── Types ──
export interface CmdContext {
  cwd: ReturnType<typeof ref<string>>
  push: (text: string, color?: string) => void
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
const output = ref<{ text: string; color?: string }[]>([])
const inputText = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const outputEl = ref<HTMLElement | null>(null)
const cwd = ref(props.initialDir ?? 'C:\\Users\\User')

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

// ── Helpers ──
const ctx: CmdContext = {
  cwd,
  push: (text, color) => output.value.push({ text, color }),
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

// ── Fake filesystem ──
// ponytail: static tree, no real FS access possible in browser
const FAKE_FS: Record<string, string[]> = {
  'C:\\': ['Users', 'Windows', 'Program Files', 'pagefile.sys'],
  'C:\\Users': ['User', 'Public'],
  'C:\\Users\\User': ['Desktop', 'Documents', 'Downloads', 'AppData'],
  'C:\\Users\\User\\Desktop': ['readme.txt', 'shortcut.lnk'],
  'C:\\Users\\User\\Documents': ['resume.docx', 'notes.txt'],
  'C:\\Windows': ['System32', 'SysWOW64', 'explorer.exe'],
}

function listDir(path: string): string[] {
  const key = Object.keys(FAKE_FS).find((k) => k.toLowerCase() === path.toLowerCase())
  return key ? (FAKE_FS[key] ?? []) : []
}

// ── Built-in commands ──
const builtins: Record<string, CommandFn> = {
  help: (_args, { push }) => {
    push('Available commands:')
    push('&nbsp;')
    const all = { ...builtins, ...(props.commands ?? {}) }
    for (const name of Object.keys(all).sort()) push(`  ${name}`)
    pushBlank()
  },

  cls: (_args, { clear }) => clear(),

  echo: (args, { push }) => push(args.join(' ') || '&nbsp;'),

  ver: (_args, { push }) => {
    push('&nbsp;')
    push('Microsoft Windows [Version 6.1.7601]')
    push('Copyright (c) 2009 Microsoft Corporation.  All rights reserved.')
    pushBlank()
  },

  date: (_args, { push }) => {
    push('The current date is: ' + new Date().toLocaleDateString())
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
      cwd.value = parts.join('\\') || 'C:\\'
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

  exit: () => {
    // ponytail: can't close the window from here — emit would require defineEmits
    push('Type "exit" to close the window from the OS controls.', '#ffff00')
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

  if (!name) return

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
</style>
