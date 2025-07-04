'use client'

import { useDesignStore } from '@/src/lib/stores/design-store'
import { cn } from '@/src/lib/utils'
import { useCallback, useEffect, useRef } from 'react'

interface CanvasProps {
  className?: string
  width?: number
  height?: number
  onStateChange?: (state: { scrollLeft: number; scrollTop: number; zoom: number }) => void
}

export function Canvas({ className, width, height, onStateChange }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { getActiveDesign, initCanvas, activeDesignId, selectedTool, fillColor, strokeColor, strokeWidth, fontSize, fontFamily, opacity } = useDesignStore()

  const activeDesign = getActiveDesign()

  // Get container dimensions
  const getContainerSize = useCallback(() => {
    if (!containerRef.current) return { width: 800, height: 600 }
    const rect = containerRef.current.getBoundingClientRect()
    return {
      width: width || rect.width || 800,
      height: height || rect.height || 600
    }
  }, [width, height])

  // Function to resize canvas
  const resizeCanvas = useCallback(() => {
    if (!activeDesign?.canvas) return

    const { width: newWidth, height: newHeight } = getContainerSize()
    activeDesign.canvas.setDimensions({
      width: newWidth,
      height: newHeight
    })
    activeDesign.canvas.renderAll()
  }, [activeDesign, getContainerSize])

  // Sync store properties with DesignManager instance
  useEffect(() => {
    if (!activeDesign) return
    activeDesign.setSelectedTool(selectedTool)
    activeDesign.setFillColor(fillColor)
    activeDesign.setStrokeColor(strokeColor)
    activeDesign.setStrokeWidth(strokeWidth)
    activeDesign.setFontSize(fontSize)
    activeDesign.setFontFamily(fontFamily)
    activeDesign.setOpacity(opacity)
  }, [activeDesign, selectedTool, fillColor, strokeColor, strokeWidth, fontSize, fontFamily, opacity])

  // Resize observer effect
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [resizeCanvas])

  // --- Main Init Effect ---
  useEffect(() => {
    if (!containerRef.current || !activeDesign) return

    if (activeDesign.canvas) {
      const canvasContainer = activeDesign.canvas.getElement().closest('.canvas-container')
      if (canvasContainer && !containerRef.current.contains(canvasContainer)) {
        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(canvasContainer)
      }
      return
    }

    const canvasEl = document.createElement('canvas')
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(canvasEl)

    const { width: canvasWidth, height: canvasHeight } = getContainerSize()

    initCanvas(
      activeDesignId || '',
      {
        canvasEl,
        canvasWidth,
        canvasHeight,
        onStateChange: onStateChange || (() => { }),
      },
    )

  }, [activeDesign, onStateChange, getContainerSize, initCanvas, activeDesignId])

  if (!activeDesignId) {
    return <div className="flex items-center justify-center h-full"><p>Create a canvas to begin</p></div>
  }

  return (
    <div
      key={activeDesignId}
      ref={containerRef}
      className={cn('relative w-full h-full', className)}
      style={{ cursor: selectedTool === 'select' ? 'default' : 'crosshair' }}
      tabIndex={0}
      onFocus={() => {
        // Focus the canvas element when container gets focus
        if (containerRef.current) {
          const canvas = containerRef.current.querySelector('canvas')
          if (canvas) {
            canvas.focus()
          }
        }
      }}
    />
  )
}

export { Canvas as default }




