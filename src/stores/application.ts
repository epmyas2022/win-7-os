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
      name: 'CMD_REFERENCE.md',
      desktop: true,
      icon: '/icons/txt.png',
      type: 'document',
      size: { width: 600, height: 400 },
      render: {
        props: {
          content: `${import.meta.resolve('/assets/CMD_REFERENCE.md')}`,
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
          title: 'Desarrollador Fullstack · Frontend · Backend · Móvil',
          avatar: '/assets/profile.jpg',
          bio: 'Desarrollador Fullstack con más de 3 años de experiencia en aplicaciones web y móviles, enfocado en construir soluciones escalables y mantenibles. Aplico buenas prácticas como Clean Code y principios SOLID para garantizar calidad y rendimiento.',
          info: [
            { label: 'Ubicación', value: 'El Salvador, San Salvador' },
            { label: 'Correo', value: 'castillo20182017@gmail.com' },
            { label: 'GitHub', value: 'github.com/epmyas2022' },
            { label: 'LinkedIn', value: 'linkedin.com/in/isaac-castillo-b4a213225' },
          ],
          projects: [
            {
              name: 'Auto-Generate Swagger',
              description: 'Paquete que facilita la generación de documentación de APIs en Laravel utilizando Swagger UI.',
              tags: ['Laravel', 'PHP', 'Swagger'],
            },
            {
              name: 'Reverse Shell',
              description: 'Genera un payload de reverse shell en Python que se ejecuta en la máquina objetivo y se conecta a un servidor controlado por el atacante.',
              tags: ['Python', 'Seguridad'],
            },
            {
              name: 'Api Instagram Profile',
              description: 'Scraping de la API de Instagram para obtener información de perfiles públicos como avatar y estadísticas.',
              tags: ['Python', 'Scraping'],
            },
            {
              name: 'Portfolio JSON',
              description: 'Página web que genera un CV imprimible a partir de un archivo JSON de forma rápida y flexible.',
              tags: ['HTML', 'JavaScript', 'CSS'],
            },
            {
              name: 'App de Rick and Morty',
              description: 'Aplicación que consume la API de Rick and Morty, muestra los personajes con sus características y permite filtrarlos por nombre y estado.',
              tags: ['Vue', 'REST API'],
            },
            {
              name: 'Vulnerabilidad en Portal Universitario',
              description: 'Script que permite obtener información de estudiantes y la sesión de un usuario en el portal de la Universidad Pedagógica de El Salvador.',
              tags: ['Python', 'Seguridad'],
            },
            {
              name: 'Plugin de Animaciones para Tailwind CSS',
              description: 'Plugin que implementa una serie de animaciones reutilizables para cualquier proyecto que use TailwindCSS.',
              tags: ['TailwindCSS', 'JavaScript'],
            },
            {
              name: 'Modelo ML de Emociones',
              description: 'API de un modelo de detección de emociones entrenado con 25,000 textos clasificados como positivos, negativos o neutrales usando TensorFlow.',
              tags: ['Python', 'TensorFlow', 'ML'],
            },
          ],
          experience: [
            {
              role: 'Desarrollador Fullstack',
              company: 'Secretaría de Innovación de la Presidencia',
              period: '2024 – Actual',
              description:
                'Implementación de arquitecturas con microservicios y desarrollo de interfaces modernas con Vue, React y Angular. Aplicación de patrones de diseño para componentes reutilizables, integración con APIs REST y GraphQL, y desarrollo de plataformas frontend conectadas a backends modulares.',
            },
            {
              role: 'Desarrollador Fullstack',
              company: 'Ministerio de Salud de El Salvador',
              period: '2023 – 2024',
              description:
                'Desarrollo de aplicaciones web bajo arquitectura de microservicios usando Vue, React, Angular y Laravel para APIs REST. Experiencia con MongoDB, PostgreSQL, contenedorización con Docker e integración de datos con Pentaho.',
            },
            {
              role: 'Desarrollador Frontend',
              company: 'Impressa Repuestos',
              period: '2022 – 2023',
              description:
                'Desarrollo del frontend en React para un sistema de censos de talleres, con interfaces dinámicas y responsivas, componentes reutilizables e integración con APIs REST.',
            },
          ],
          funFacts: [
            'Me gusta mucho el café ☕',
            'Me gustan los gatos 🐱',
            'Aprendí a programar desde los 15 años',
            'Amo aprender cosas nuevas, especialmente sobre IA 🤖',
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
