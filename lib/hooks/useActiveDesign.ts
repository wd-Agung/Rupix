import { useDesignStore } from '@/lib/stores/design-store'
import { useEffect, useReducer } from 'react'

export function useActiveDesign() {
  const activeDesign = useDesignStore((state) => state.getActiveDesign())
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    if (!activeDesign) return

    const unsubscribe = activeDesign.subscribe(() => {
      forceUpdate()
    })

    return () => {
      unsubscribe()
    }
  }, [activeDesign])

  return activeDesign
} 