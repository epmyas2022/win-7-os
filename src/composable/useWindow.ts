import { ref, reactive } from 'vue'

export function useContextMenu() {
  const showOption = ref(false)

  const coordinates = reactive({ x: 0, y: 0 })

  const fitCoodinates = (width: number, height: number) => {
    if (coordinates.x + width > window.innerWidth) {
      coordinates.x = window.innerWidth - width
    }
    if (coordinates.y + height > window.innerHeight) {
      coordinates.y = window.innerHeight - height
    }
  }

  const handleContextMenu = (event: MouseEvent, width: number, height: number) => {
    event.preventDefault()
    showOption.value = !showOption.value
    coordinates.x = event.clientX
    coordinates.y = event.clientY

    fitCoodinates(width, height)
  }

  return {
    showOption,
    coordinates,
    fitCoodinates,
    handleContextMenu,
  }
}

export function useWindow(width?: number, height?: number) {
  const minimized = ref(false)
  const maximized = ref(false)
  const pos = reactive({
    x: window.innerWidth / 2 - (width ?? 300) / 2,
    y: window.innerHeight / 2 - (height ?? 300) / 2,
  })

  function startDrag(e: MouseEvent) {
    const offsetX = e.clientX - pos.x
    const offsetY = e.clientY - pos.y

    function onMove(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest?.('.window') as HTMLElement | null
      const w = el?.offsetWidth ?? 300
      const h = el?.offsetHeight ?? 160

      pos.x = Math.min(Math.max(0, e.clientX - offsetX), window.innerWidth - w)
      pos.y = Math.min(Math.max(0, e.clientY - offsetY), window.innerHeight - h - 40)
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return {
    minimized,
    maximized,
    pos,
    startDrag,
  }
}
