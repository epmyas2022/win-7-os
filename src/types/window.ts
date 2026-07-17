import type { Component } from 'vue'

export type RenderWithComponent = {
  props: Record<string, unknown>
  component: Component
}

export interface CommonApplicationInterface {
  name: string
  icon: string
  type: 'folder' | 'document' | 'application'
  show?: boolean
  desktop?: boolean
  pinned?: boolean
  render?: RenderWithComponent
  app?: CallableFunction
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

export interface ApplicationWithApp extends CommonApplicationInterface {
  id?: never
  app: CallableFunction
  render?: never
}

export interface ApplicactionWithRender extends CommonApplicationInterface {
  id: number
  app?: never
  render?: RenderWithComponent
}

export type BaseApplicationInterface = ApplicationWithApp | ApplicactionWithRender

export type ApplicationInterface = BaseApplicationInterface & {
  children?: (ApplicationInterface & {
    parentId: number
  })[]
}
