import { useWindowStore } from '@/stores/window'
import NotepadView from '@/ui/system/NotepadView.vue'
import VideoPlayerView from '@/ui/system/VideoPlayerView.vue'
import { markRaw } from 'vue'

export function useApp() {
  const notepadApp = function (
    file: string,
    desktop: boolean = false,
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

  const videoPlayerApp = function (src: string, title: string, desktop: boolean = false) {
    return useWindowStore().createApp({
      name: title,
      desktop: desktop,
      icon: '/icons/wmp.png',
      type: 'application',
      size: { width: 600, height: 450 },
      render: {
        props: { src, title },
        component: markRaw(VideoPlayerView),
      },
    })
  }

  return {
    notepadApp,
    videoPlayerApp,
  }
}
