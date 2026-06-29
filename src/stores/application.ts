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
import CmdView from '@/ui/system/CmdView.vue'

export const useApplicationStore = defineStore('application', () => {
  const applications = ref<ApplicationInterface[]>([
    {
      id: 13,
      name: 'Recycle Bin',
      icon: '/icons/gnome-fs-trash-empty.png',
      type: 'application',
      pinned: true,
      size: { width: 600, height: 420 },
      render: {
        props: {},
        component: markRaw(RecycleBinView),
      },
    },

    {
      id: 1,
      name: 'Readme.txt',
      icon: '/icons/txt.png',
      type: 'document',
      size: { width: 600, height: 400 },
      render: {
        props: { content: '<h1>Readme</h1><p>This is a simple readme file.</p>' },
        component: markRaw(NotepadView),
      },
    },

    {
      id: 2,
      name: 'About me.pdf',
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
          ],
        },
      ],
    }),
    markRaw({
      id: 5,
      name: 'Documents',
      type: 'folder',
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
          id: 6,
          parentId: 5,
          name: 'Resume.docx',
          type: 'document',
          icon: '/icons/txt.png',
          render: {
            props: { content: '<h1>Resume</h1><p>This is a simple resume file.</p>' },
            component: markRaw(NotepadView),
          },
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
      id: 15,
      name: 'Command Prompt',
      icon: '/icons/utilities-terminal.png',
      type: 'application',
      pinned: true,
      size: { width: 680, height: 400 },
      render: {
        props: {
          initialDir: 'C:\\Users\\User',
          // Custom commands example — add your own here
          commands: {
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
          },
        },
        component: markRaw(CmdView),
      },
    },
  ])

  return {
    applications,
  }
})
