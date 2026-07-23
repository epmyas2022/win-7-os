import StartWars from './ascii/starwars.txt?raw'
import Squirrel from './ascii/squirrel.txt?raw'
import Parrot from './ascii/parrot.txt?raw'

export const PARROT = Parrot.split('()')

export const SQUIRREL = Squirrel.split(',')

export function startWars(): { frame: string; duration: number }[] {
  const result = new Array<{ frame: string; duration: number }>()

  const lines = StartWars.split('\n')

  for (let i = 0; i < lines.length; i += 14) {
    if (i + 14 > lines.length) {
      break
    }

    const duration = parseInt(lines[i]?.trim() || '100', 10)

    const frame = lines.slice(i + 1, i + 14).join('\n')

    result.push({ frame, duration })
  }

  return result
}

export const FRAMES: Record<
  string,
  { fps: number; colors: string[]; ascii: () => { frame: string; duration: number }[] }
> = {
  parrot: {
    fps: 15,
    colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8f00ff'],
    ascii: () => {
      return PARROT.map((frame) => ({ frame, duration: 1 }))
    },
  },
  squirrel: {
    fps: 10,
    colors: [],
    ascii: () => {
      return SQUIRREL.map((frame) => ({ frame, duration: 1 }))
    },
  },
  starwars: {
    fps: 10,
    colors: [],
    ascii: () => {
      return startWars()
    },
  },
}
