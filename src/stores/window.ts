import type { ApplicationInterface } from '@/types/window'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApplicationStore } from './application'
export const useWindowStore = defineStore('windowStore', () => {
  const { applications } = useApplicationStore()
  const bringToFront = ref<number | null>(null)

  const programActives = ref<ApplicationInterface[]>([])

  function getChildrens(array: ApplicationInterface[]): ApplicationInterface[] {
    const result: ApplicationInterface[] = []

    function traverse(nodes: ApplicationInterface[]) {
      for (const node of nodes) {
        if (node.children?.length) {
          result.push(...node.children)
          traverse(node.children)
        }
      }
    }

    traverse(array)

    return result
  }
  function findApplicationById(
    id: number,
    applications: ApplicationInterface[],
    deepSearch: boolean = false,
  ): ApplicationInterface | undefined {
    const children = deepSearch ? getChildrens(applications) : []

    const all = [...applications, ...children]

    const find = all.find((app) => app.id === id)

    /*     if (deepSearch && !find && children.length > 0) {
      console.log('este valor no coincide', id, applications)
      return findApplicationById(
        id,
        children.flatMap((app) => app.children || []),
      )
    }
 */

    return find
  }

  function addProgramActive(id: number) {
    const program = findApplicationById(id, applications, true)

    if (!program) return

    if (existsProgramActive(id)) {
      return bringToFrontProgram(id)
    }

    program.show = true

    programActives.value.push(program)

    bringToFrontProgram(id)
  }

  function removeProgramActive(programId: number) {
    programActives.value = programActives.value.filter((p) => p.id !== programId)
    bringToFront.value = null
  }

  function getVisibleProgram(programId: number) {
    const program = findApplicationById(programId, programActives.value)

    if (!program) return false

    return program.show
  }

  function bringToFrontProgram(programId: number) {
    bringToFront.value = programId
  }

  function existsProgramActive(programId: number) {
    return findApplicationById(programId, programActives.value, false) !== undefined
  }

  function getPinnedApplications() {
    return applications.filter((app) => app.pinned && !existsProgramActive(app.id))
  }

  return {
    applications,
    programActives,
    addProgramActive,
    removeProgramActive,
    bringToFront,
    bringToFrontProgram,
    existsProgramActive,
    getVisibleProgram,
    getPinnedApplications,
  }
})
