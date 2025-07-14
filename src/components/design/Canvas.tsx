'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/src/components/ui/context-menu'
import { useDesignStore } from '@/src/lib/stores/design-store'
import { cn } from '@/src/lib/utils'
import type * as fabric from 'fabric'
import { CopyIcon, CropIcon, TrashIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CropImageDialog } from './CropImageDialog'

interface CanvasProps {
  className?: string
  width?: number
  height?: number
  onStateChange?: (state: { scrollLeft: number; scrollTop: number; zoom: number }) => void
}

export function Canvas({ className, width, height, onStateChange }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    getActiveDesign,
    initCanvas,
    activeDesignId,
    selectedTool,
    fillColor,
    strokeColor,
    strokeWidth,
    fontSize,
    fontFamily,
    opacity,
    executeCanvasTool,
    replaceImage,
  } = useDesignStore()

  const activeDesign = getActiveDesign()
  const [hasActiveObject, setHasActiveObject] = useState(false)
  const [activeObjectType, setActiveObjectType] = useState<string | null>(null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  // Listen for active object changes
  useEffect(() => {
    if (!activeDesign?.canvas) return
    const canvas = activeDesign.canvas
    const update = () => {
      const obj = canvas.getActiveObject()
      setHasActiveObject(!!obj && !(obj as any).isBaseLayer)
      setActiveObjectType(obj?.type || null)
    }
    canvas.on('selection:created', update)
    canvas.on('selection:updated', update)
    canvas.on('selection:cleared', update)
    update()
    return () => {
      canvas.off('selection:created', update)
      canvas.off('selection:updated', update)
      canvas.off('selection:cleared', update)
    }
  }, [activeDesign])

  // Prevent default browser context menu on canvas
  useEffect(() => {
    const el = containerRef.current?.querySelector('canvas')
    if (!el) return
    const handler = (e: Event) => e.preventDefault()
    el.addEventListener('contextmenu', handler)
    return () => el.removeEventListener('contextmenu', handler)
  }, [activeDesignId])

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

  // Context menu actions
  const handleDuplicate = useCallback(() => {
    executeCanvasTool('duplicateSelectedObject', {})
  }, [executeCanvasTool])
  const handleDelete = useCallback(() => {
    executeCanvasTool('deleteSelectedObject', {})
  }, [executeCanvasTool])

  const handleOpenCropDialog = useCallback(() => {
    const obj = activeDesign?.canvas?.getActiveObject() as fabric.Image
    if (obj && obj.type === 'image') {
      const originalSrc = obj.originalSrc || obj.getSrc()
      setImageToCrop(originalSrc)
      setIsCropDialogOpen(true)
    }
  }, [activeDesign])

  const handleCrop = useCallback((croppedImageUrl: string) => {
    replaceImage(croppedImageUrl)
  }, [replaceImage])

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
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
        </ContextMenuTrigger>
        {hasActiveObject && (
          <ContextMenuContent>
            {activeObjectType === 'image' && (
              <ContextMenuItem onSelect={handleOpenCropDialog}><CropIcon /> Crop Image</ContextMenuItem>
            )}
            <ContextMenuItem onSelect={handleDuplicate}><CopyIcon /> Duplicate</ContextMenuItem>
            <ContextMenuItem onSelect={handleDelete} variant="destructive"><TrashIcon /> Delete</ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>
      {isCropDialogOpen && imageToCrop && (
        <CropImageDialog
          isOpen={isCropDialogOpen}
          onClose={() => setIsCropDialogOpen(false)}
          imageSrc={imageToCrop}
          onCrop={handleCrop}
        />
      )}
    </>
  )
}

export { Canvas as default }




