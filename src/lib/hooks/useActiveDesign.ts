import { useDesignStore } from '@/src/lib/stores/design-store'
import { useEffect, useReducer } from 'react'

export const useActiveDesign = () => {
  const activeDesignId = useDesignStore((state) => state.activeDesignId)
  const getDesign = useDesignStore((state) => state.getDesign)
  const activeDesign = activeDesignId ? getDesign(activeDesignId) : null

  const [, forceUpdate] = useReducer((v) => v + 1, 0)

  useEffect(() => {
    if (activeDesign) {
      const unsubscribe = activeDesign.subscribe(() => {
        forceUpdate()
      })
      return () => {
        unsubscribe()
      }
    }
  }, [activeDesign])

  return activeDesign
} 