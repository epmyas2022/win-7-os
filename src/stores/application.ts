import type { ApplicationInterface } from '@/types/window'
import { defineStore } from 'pinia'
import { ref, markRaw } from 'vue'
import NotepadView from '@/ui/system/NotepadView.vue'
import FileExplorerView from '@/ui/system/FileExplorerView.vue'
import PdfView from '@/ui/system/PdfView.vue'
import SystemInfoView from '@/ui/system/SystemInfoView.vue'
import BrowserView from '@/ui/system/BrowserView.vue'
import ImageView from '@/ui/system/ImageView.vue'
import RecycleBinView from '@/ui/system/RecycleBinView.vue'
import ProfileView from '@/ui/system/ProfileView.vue'
import MinesweeperView from '@/ui/games/MinesweeperView.vue'
import VideoPlayerView from '@/ui/system/VideoPlayerView.vue'

import { useApp } from '@/composable/useApp'
import DoomView from '@/ui/games/DoomView.vue'
import PaintView from '@/ui/system/PaintView.vue'

export const useApplicationStore = defineStore('application', () => {
  const { notepadApp, videoPlayerApp, cmdApp } = useApp()

  const applications = ref<ApplicationInterface[]>([])

  applications.value = [
    {
      id: 13,
      name: 'Recycle Bin',

      icon: '/icons/gnome-fs-trash-empty.png',
      type: 'application',
      pinned: true,
      desktop: true,
      size: { width: 600, height: 420 },
      render: {
        props: {},
        component: markRaw(RecycleBinView),
      },
    },

    {
      id: 1,
      name: 'Readme.txt',
      desktop: true,
      icon: '/icons/txt.png',
      type: 'document',
      size: { width: 600, height: 400 },
      render: {
        props: {
          content: `${import.meta.resolve('/assets/Sample.md')}`,
          showContentUrl: true,
        },
        component: markRaw(NotepadView),
      },
    },

    {
      id: 2,
      name: 'About me.pdf',
      desktop: true,
      icon: '/icons/application-pdf.png',
      type: 'document',
      size: { width: 700, height: 500 },
      render: {
        // ponytail: point to your real PDF in /public/assets/
        props: { src: '/assets/sample.pdf', title: 'About me.pdf' },
        component: markRaw(PdfView),
      },
    },

    markRaw({
      id: 8,
      name: 'Desktop',
      type: 'folder',
      icon: '/icons/folder-desktop.png',
      desktop: true,
      size: { width: 600, height: 400 },
      render: {
        props: {
          indexNode: 0,
        },
        component: markRaw(FileExplorerView),
      },
      children: [
        {
          id: 9,
          icon: '/icons/folder-images.png',
          name: 'Images',
          type: 'folder',
          parentId: 8,
          /*    render: {
            props: {
              indexNode: 2,
            },
            component: markRaw(FileExplorerView),
          }, */
          children: [
            {
              id: 10,
              parentId: 9,
              name: '(Windows_7).jpg',
              type: 'document',
              icon: '/icons/gnome-mime-image-png.png',
              size: { width: 600, height: 400 },
              render: {
                props: { src: '/assets/Img0_(Windows_7).jpg', title: 'Img0_(Windows_7).jpg' },
                component: markRaw(ImageView),
              },
            },

            {
              parentId: 9,
              name: 'Video.mp4',
              type: 'document',
              icon: '/icons/wmp.png',
              app: () =>
                videoPlayerApp(
                  'https://avtshare01.rz.tu-ilmenau.de/avt-vqdb-uhd-1/test_1/segments/vegetables_tuil_200kbps_360p_59.94fps_hevc.mp4',
                  'Video.mp4',
                  false,
                ),
            },
          ],
        },
      ],
    }),
    markRaw({
      id: 5,
      name: 'Documents',
      type: 'folder',
      desktop: true,
      icon: '/icons/folder-images.png',
      size: { width: 600, height: 400 },
      render: {
        props: {
          indexNode: 1,
        },
        component: markRaw(FileExplorerView),
      },
      children: [
        {
          parentId: 5,
          name: 'humans.txt',
          type: 'document',
          icon: '/icons/txt.png',
          app: () =>
            notepadApp(
              'https://raw.githubusercontent.com/devtooligan/awesome-ascii-art/refs/heads/main/animals.txt',
              false,
              true,
            ),
        },

        {
          id: 7,
          parentId: 5,
          name: 'About-me.pdf',
          type: 'document',
          icon: '/icons/application-pdf.png',
          render: {
            props: { src: '/assets/sample.pdf', title: 'About-me.pdf' },
            component: markRaw(PdfView),
          },
        },
      ],
    }),

    markRaw({
      id: 3,
      name: 'File Explorer',
      icon: '/icons/file-explorer.png',
      type: 'application',
      desktop: true,
      pinned: true,
      size: { width: 680, height: 460 },
      render: {
        props: {},
        component: FileExplorerView,
      },
    }),

    {
      id: 4,
      name: 'Computer',
      icon: '/icons/computer.png',
      type: 'application',
      desktop: true,
      pinned: true,
      size: { width: 560, height: 420 },
      render: {
        props: {},
        component: markRaw(SystemInfoView),
      },
    },

    {
      id: 11,
      name: 'Internet Explorer',
      icon: '/icons/explorer.png',
      type: 'application',
      desktop: true,
      pinned: true,
      size: { width: 900, height: 620 },
      render: {
        props: {},
        component: markRaw(BrowserView),
      },
    },

    {
      id: 12,
      name: 'Image Viewer',
      icon: '/icons/image-viewer.png',
      type: 'application',
      desktop: true,
      pinned: false,
      size: { width: 700, height: 520 },
      render: {
        // ponytail: swap src/title when opening a real image file
        props: { src: '/icons/computer.png', title: 'Image Viewer' },
        component: markRaw(ImageView),
      },
    },

    {
      id: 14,
      name: 'Profile',
      icon: '/icons/profile-info.png',
      type: 'application',
      desktop: true,
      pinned: false,
      size: { width: 760, height: 520 },
      render: {
        props: {
          name: 'Isaac Castillo',
          title: 'Full Stack Developer',
          avatar: '/assets/profile.jpg',
          bio: 'Passionate developer with a love for building things. Replace this with your own bio.',
          info: [
            { label: 'Location', value: 'Your City, Country' },
            { label: 'Email', value: 'you@example.com' },
            { label: 'GitHub', value: 'github.com/youruser' },
            { label: 'LinkedIn', value: 'linkedin.com/in/youruser' },
          ],
          projects: [
            {
              name: 'Epmyas OS',
              description: 'A Windows 7-inspired OS simulation built with Vue 3.',
              tags: ['Vue 3', 'TypeScript', 'Pinia'],
            },
            {
              name: 'Project Two',
              description: 'Short description of what this project does.',
              tags: ['React', 'Node.js'],
            },
          ],
          experience: [
            {
              role: 'Senior Developer',
              company: 'Company Name',
              period: '2022 – Present',
              description: 'What you did there.',
            },
            {
              role: 'Frontend Developer',
              company: 'Previous Company',
              period: '2019 – 2022',
            },
          ],
          funFacts: [
            'I drink too much coffee.',
            'I built my first website at age 14.',
            'I love retro UI design.',
          ],
        },
        component: markRaw(ProfileView),
      },
    },

    {
      name: 'Console',
      icon: '/icons/utilities-terminal.png',
      type: 'application',
      pinned: true,
      show: true,
      desktop: true,
      app: () =>
        cmdApp({
          whoami: (_args: string[], ctx: { push: (msg: string) => void }) => {
            ctx.push('USER-PC\\User')
          },
      
          ipconfig: (_args: string[], ctx: { push: (msg: string) => void }) => {
            ctx.push('Windows IP Configuration')
            ctx.push('&nbsp;')
            ctx.push('Ethernet adapter Local Area Connection:')
            ctx.push('   IPv4 Address. . . : 192.168.1.100')
            ctx.push('   Subnet Mask . . . : 255.255.255.0')
            ctx.push('   Default Gateway . : 192.168.1.1')
            ctx.push('&nbsp;')
          },
        }),
    },

    {
      id: 16,
      name: 'Minesweeper',
      icon: '/icons/minesweeper.png',
      type: 'application',
      pinned: true,
      desktop: true,
      size: { width: 650, height: 400 },
      render: {
        props: {},
        component: markRaw(MinesweeperView),
      },
    },

    {
      id: 17,
      name: 'VLC media player',
      icon: '/icons/wmp.png',
      type: 'application',
      pinned: true,
      desktop: true,
      size: { width: 700, height: 480 },
      render: {
        props: {
          src: 'https://avtshare01.rz.tu-ilmenau.de/avt-vqdb-uhd-1/test_1/segments/bigbuck_bunny_8bit_15000kbps_1080p_60.0fps_h264.mp4',
        },
        component: markRaw(VideoPlayerView),
      },
    },

    {
      id: 18,
      name: 'Doom',
      icon: '/icons/doom.png',
      type: 'application',
      pinned: false,
      desktop: true,
      size: { width: 590, height: 440 },
      render: {
        props: {},
        component: markRaw(DoomView),
      },
    },

    {
      id: 19,
      name: 'MS Paint',
      icon: '/icons/MSPaint.webp',
      type: 'application',
      pinned: false,
      desktop: true,
      size: { width: 700, height: 400 },
      render: {
        props: {},
        component: markRaw(PaintView),
      },
    },
  ]

  return {
    applications,
  }
})
