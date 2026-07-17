import { useWindowStore } from '@/stores/window'
import NotepadView from '@/ui/system/NotepadView.vue'
import { markRaw } from 'vue'

export function useApp() {
  const notepadApp = function (
    file: string,
    desktop: boolean = true,
    showContentUrl: boolean = false,
  ) {
    const regex = /([^/?#]+)\.([a-zA-Z0-9]+)(?=$|[?#])/

    return useWindowStore().createApp({
      name: file.match(regex)?.[1] ?? 'Untitled',
      desktop: desktop,
      icon: '/icons/txt.png',
      type: 'application',
      size: { width: 600, height: 400 },
      render: {
        props: { content: file, showContentUrl },
        component: markRaw(NotepadView),
      },
    })
  }

  return {
    notepadApp,
  }
}
