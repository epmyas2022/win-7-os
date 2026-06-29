import type { Component } from 'vue'

export type Render = {
  props: Record<string, unknown>
  component: Component
}

export interface BaseApplicationInterface {
  id: number
  name: string
  icon: string
  type: 'folder' | 'document' | 'application'
  show?: boolean
  pinned?: boolean
  render?: Render
  iconSize?: {
    width?: number
    height?: number
  }
  hiddenTitle?: boolean
  styleTitle?: Record<string, string>

  size?: {
    width: number
    height: number
  }
}

export type ApplicationInterface = BaseApplicationInterface & {
  children?: (ApplicationInterface & {
    parentId: number
  })[]
}
