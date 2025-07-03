import { CanvasLayer, DesignManager, ToolType } from '@/lib/core/DesignManager'
import type * as fabric from 'fabric'
import { create } from 'zustand'

export type { CanvasLayer, ToolType }

export interface CanvasState {
  designs: DesignManager[]
  activeDesignId: string | null
  selectedTool: ToolType
  isDrawing: boolean
  // Drawing state for drag-to-create objects
  drawingStartPoint: { x: number; y: number } | null
  drawingCurrentPoint: { x: number; y: number } | null
  drawingPreviewObject: fabric.Object | null
  fillColor: string
  strokeColor: string
  strokeWidth: number
  fontSize: number
  fontFamily: string
  opacity: number
  // Text formatting
  fontWeight: string
  fontStyle: string
  underline: boolean
  textAlign: string
  lineHeight: number
  charSpacing: number
  // Advanced styling
  shadow: fabric.Shadow | null
  backgroundColor: string
  // Camera controls
  cameraLocked: boolean
}

export interface InitCanvasOptions {
  backgroundColor?: string
  canvasEl: HTMLCanvasElement
  canvasWidth: number
  canvasHeight: number
  onStateChange: (state: { scrollLeft: number; scrollTop: number; zoom: number }) => void
}

export interface CanvasActions {
  // Design management
  createNewDesign: (name?: string) => string
  closeDesign: (designId: string) => void
  setActiveDesign: (designId: string) => void
  renameDesign: (designId: string, newName: string) => void

  // Canvas management
  getDesign: (designId: string) => DesignManager | undefined
  getActiveDesign: () => DesignManager | null
  initCanvas: (designId: string, options: InitCanvasOptions) => void
  getActiveCanvasJSON: () => string

  // Tool and drawing state
  setSelectedTool: (tool: ToolType) => void
  setIsDrawing: (isDrawing: boolean) => void
  // Drawing state actions
  setDrawingStartPoint: (point: { x: number; y: number } | null) => void
  setDrawingCurrentPoint: (point: { x: number; y: number } | null) => void
  setDrawingPreviewObject: (object: fabric.Object | null) => void
  resetDrawingState: () => void

  // Object operations
  duplicateActiveObject: () => Promise<void>
  undo: () => Promise<void>
  redo: () => Promise<void>

  // Properties
  setFillColor: (color: string) => void
  setStrokeColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setFontSize: (size: number) => void
  setFontFamily: (family: string) => void
  setOpacity: (opacity: number) => void

  // Text formatting
  setFontWeight: (weight: string) => void
  setFontStyle: (style: string) => void
  setUnderline: (underline: boolean) => void
  setTextAlign: (align: string) => void
  setLineHeight: (height: number) => void
  setCharSpacing: (spacing: number) => void

  // Advanced styling
  setShadow: (shadow: fabric.Shadow | null) => void
  setBackgroundColor: (color: string) => void

  // Camera controls
  setCameraLocked: (locked: boolean) => void

  // Layer management
  reorderLayer: (layerId: string, newIndex: number) => void

  // AI Tool Functions
  executeCanvasTool: (toolName: string, params: any) => { success: boolean; data: string } | void
}

export type DesignStore = CanvasState & CanvasActions

export const useDesignStore = create<DesignStore>((set, get) => ({
  // State
  designs: [],
  activeDesignId: null,
  selectedTool: 'select',
  isDrawing: false,
  drawingStartPoint: null,
  drawingCurrentPoint: null,
  drawingPreviewObject: null,
  fillColor: '#000000',
  strokeColor: 'transparent',
  strokeWidth: 0,
  fontSize: 20,
  fontFamily: 'Inter',
  opacity: 1,
  // Text formatting
  fontWeight: 'normal',
  fontStyle: 'normal',
  underline: false,
  textAlign: 'left',
  lineHeight: 1.2,
  charSpacing: 0,
  // Advanced styling
  shadow: null,
  backgroundColor: 'transparent',
  // Camera controls
  cameraLocked: true, // Default to locked

  // Design management actions
  createNewDesign: (name) => {
    const designName = name || `Canvas ${get().designs.length + 1}`

    const newDesign = new DesignManager(designName)
    console.log('newDesign', newDesign)

    // Set the camera lock state for the new design
    const currentState = get()
    newDesign.setCameraLocked(currentState.cameraLocked)

    set((state) => ({
      designs: [...state.designs, newDesign],
      activeDesignId: newDesign.id
    }))

    return newDesign.id
  },

  closeDesign: (designId) => {
    const design = get().designs.find(d => d.id === designId)
    if (design) {
      design.canvas?.off('tool_change')
    }

    set((state) => {
      const designToClose = state.designs.find(d => d.id === designId)
      if (designToClose && designToClose.canvas) {
        designToClose.canvas.dispose()
      }

      const designs = state.designs.filter(d => d.id !== designId)
      const wasActive = state.activeDesignId === designId

      let newActiveDesignId = state.activeDesignId
      if (wasActive && designs.length > 0) {
        newActiveDesignId = designs[designs.length - 1].id
      } else if (designs.length === 0) {
        newActiveDesignId = null
      }

      return {
        designs,
        activeDesignId: newActiveDesignId
      }
    })
  },

  setActiveDesign: (designId) => {
    set((state) => {
      const design = state.designs.find(d => d.id === designId)
      if (design) {
        // Sync camera lock state with the design
        design.setCameraLocked(state.cameraLocked)
      }
      return { activeDesignId: designId }
    })
  },

  renameDesign: (designId, newName) => {
    set((state) => ({
      designs: state.designs.map(design => {
        if (design.id === designId) {
          design.name = newName
          design.lastModified = new Date()
        }
        return design
      })
    }))
  },

  // Canvas management
  getDesign: (designId) => {
    const design = get().designs.find(d => d.id === designId)
    return design
  },

  getActiveDesign: () => {
    const { designs, activeDesignId } = get()
    return designs.find(d => d.id === activeDesignId) || null
  },

  initCanvas: (designId, options: InitCanvasOptions) => {
    const design = get().designs.find(d => d.id === designId)
    if (design) {
      design.initCanvas(
        options.canvasEl,
        {
          width: options.canvasWidth,
          height: options.canvasHeight,
          backgroundColor: options.backgroundColor,
          preserveObjectStacking: true,
          selectionColor: 'rgba(14, 152, 252, 0.2)',
          selectionLineWidth: 2,
          selectionBorderColor: 'rgba(14, 152, 252, 0.8)',
        } as fabric.CanvasOptions,
        options.onStateChange
      )

      // Sync current selected tool with the design
      const currentState = get()
      design.setSelectedTool(currentState.selectedTool)

      design.canvas?.on('tool_change', (e) => {
        set({ selectedTool: e.tool })
        // Also sync the tool with the design manager
        design.setSelectedTool(e.tool)
      })
    }
  },

  getActiveCanvasJSON: () => {
    const design = get().getActiveDesign()
    return design?.canvas?.toJSON() || '{}'
  },

  // Tool and drawing state
  setSelectedTool: (tool) => {
    // Reset drawing state when changing tools
    get().resetDrawingState()
    // Remove preview object if exists
    const design = get().getActiveDesign()
    const previewObject = get().drawingPreviewObject
    if (design?.canvas && previewObject) {
      design.canvas.remove(previewObject)
      design.canvas.renderAll()
    }
    set({ selectedTool: tool })
  },
  setIsDrawing: (isDrawing) => set({ isDrawing }),

  // Drawing state actions
  setDrawingStartPoint: (point) => set({ drawingStartPoint: point }),
  setDrawingCurrentPoint: (point) => set({ drawingCurrentPoint: point }),
  setDrawingPreviewObject: (object) => set({ drawingPreviewObject: object }),
  resetDrawingState: () => set({ drawingStartPoint: null, drawingCurrentPoint: null, drawingPreviewObject: null }),

  // Object operations
  duplicateActiveObject: async () => {
    const design = get().getActiveDesign()
    if (design) {
      await design.duplicateActiveObject()
    }
  },
  undo: async () => {
    const design = get().getActiveDesign()
    if (design) {
      await design.undo()
    }
  },
  redo: async () => {
    const design = get().getActiveDesign()
    if (design) {
      await design.redo()
    }
  },

  // Properties
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setFontSize: (size) => set({ fontSize: size }),
  setFontFamily: (family) => set({ fontFamily: family }),
  setOpacity: (opacity) => set({ opacity: opacity }),

  // Text formatting
  setFontWeight: (weight) => set({ fontWeight: weight }),
  setFontStyle: (style) => set({ fontStyle: style }),
  setUnderline: (underline) => set({ underline: underline }),
  setTextAlign: (align) => set({ textAlign: align }),
  setLineHeight: (height) => set({ lineHeight: height }),
  setCharSpacing: (spacing) => set({ charSpacing: spacing }),

  // Advanced styling
  setShadow: (shadow) => set({ shadow: shadow }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),

  // Camera controls
  setCameraLocked: (locked) => set({ cameraLocked: locked }),

  // Layer management
  reorderLayer: (layerId: string, newIndex: number) => {
    const design = get().getActiveDesign()
    if (design) {
      design.reorderLayer(layerId, newIndex)
    }
  },

  // AI Tool Functions
  executeCanvasTool: (toolName: string, params: any) => {
    const design = get().getActiveDesign()
    if (!design || !design.canvas) {
      return { success: false, data: 'No active canvas found' }
    }
    console.log('executeCanvasTool start', toolName, params)

    try {
      if (toolName === 'getCanvasDimensions') {
        const baseLayer = design.getBaseLayerBounds()
        return { success: true, data: `width: ${baseLayer.right - baseLayer.left}, height: ${baseLayer.bottom - baseLayer.top}` }
      } else if (toolName === 'getActiveObjectInfo') {
        const activeObject = design.canvas.getActiveObject()
        const objectJSON = activeObject?.toJSON()
        console.log('getActiveObjectInfo', JSON.stringify(objectJSON, null, 2))
        return { success: true, data: `Active object: ${JSON.stringify(objectJSON)}` }
      } else if (toolName === 'getAllObjectInfos') {
        const objects = design.canvas.getObjects()
        const objectsJSON = objects.map(obj => obj.toJSON())
        return { success: true, data: `All objects: ${objectsJSON}` }
      } else if (toolName === 'createRectangle') {
        design.addRectangle(
          { x: params.x, y: params.y },
          {
            fill: params.fill || '#3b82f6',
            stroke: params.stroke || '#1e40af',
            strokeWidth: params.strokeWidth || 2,
            opacity: params.opacity || 1
          }
        )
        return { success: true, data: `Created rectangle at position (${params.x}, ${params.y})` }
      } else if (toolName === 'createCircle') {
        design.addCircle(
          { x: params.x, y: params.y },
          {
            fill: params.fill || '#3b82f6',
            stroke: params.stroke || '#1e40af',
            strokeWidth: params.strokeWidth || 2,
            opacity: params.opacity || 1
          }
        )
        return { success: true, data: `Created circle at position (${params.x}, ${params.y})` }
      } else if (toolName === 'createText') {
        design.addText(
          { x: params.x, y: params.y },
          {
            fontSize: params.fontSize || 20,
            fontFamily: params.fontFamily || 'Inter',
            fontWeight: params.fontWeight || 'normal',
            fontStyle: params.fontStyle || 'normal',
            underline: params.underline || false,
            textAlign: params.textAlign || 'left',
            lineHeight: params.lineHeight || 1.2,
            charSpacing: params.charSpacing || 0,
            fill: params.fill || '#3b82f6',
            opacity: params.opacity || 1,
            shadow: params.shadow || null,
            backgroundColor: params.backgroundColor || 'transparent'
          }
        )
        // Set the text content if provided
        const newTextObject = design.canvas.getActiveObject()
        if (newTextObject && params.text && newTextObject.type === 'i-text') {
          ; (newTextObject as fabric.IText).set('text', params.text)
          design.canvas.requestRenderAll()
        }
        return { success: true, data: `Created text "${params.text}" at position (${params.x}, ${params.y})` }
      } else if (toolName === 'updateObjectProperties') {
        const selectedObject = design.canvas.getActiveObject()
        if (!selectedObject) {
          return { success: false, data: 'No object selected' }
        }
        selectedObject.set(params)
        design.canvas.requestRenderAll()
        return { success: true, data: 'Updated properties of selected object' }
      } else if (toolName === 'moveObject') {
        const objToMove = design.canvas.getActiveObject()
        if (!objToMove) {
          return { success: false, data: 'No object selected' }
        }
        if (params.relative) {
          objToMove.set({
            left: (objToMove.left || 0) + params.x,
            top: (objToMove.top || 0) + params.y
          })
        } else {
          objToMove.set({
            left: params.x,
            top: params.y
          })
        }
        objToMove.setCoords()
        design.canvas.requestRenderAll()
        return { success: true, data: `Moved object to position (${params.x}, ${params.y})` }
      } else if (toolName === 'scaleObject') {
        const objToScale = design.canvas.getActiveObject()
        if (!objToScale) {
          return { success: false, data: 'No object selected' }
        }
        if (params.uniform) {
          const scale = params.scaleX || params.scaleY || 1
          objToScale.set({
            scaleX: scale,
            scaleY: scale
          })
        } else {
          objToScale.set({
            scaleX: params.scaleX || objToScale.scaleX || 1,
            scaleY: params.scaleY || objToScale.scaleY || 1
          })
        }
        design.canvas.requestRenderAll()
        return { success: true, data: 'Scaled object' }
      } else if (toolName === 'rotateObject') {
        const objToRotate = design.canvas.getActiveObject()
        if (!objToRotate) {
          return { success: false, data: 'No object selected' }
        }
        const newAngle = params.relative
          ? (objToRotate.angle || 0) + params.angle
          : params.angle
        objToRotate.set('angle', newAngle)
        design.canvas.requestRenderAll()
        return { success: true, data: `Rotated object to ${newAngle} degrees` }
      } else if (toolName === 'changeCanvasBackground') {
        design.canvas.set('backgroundColor', params.color)
        design.canvas.requestRenderAll()
        return { success: true, data: `Changed canvas background to ${params.color}` }
      } else if (toolName === 'selectObject') {
        if (params.layerName) {
          const layer = design.layers.find(l => l.name.toLowerCase().includes(params.layerName.toLowerCase()))
          if (layer) {
            design.canvas.setActiveObject(layer.object)
            design.canvas.requestRenderAll()
            return { success: true, data: `Selected object: ${layer.name}` }
          } else {
            return { success: false, data: `No object found with name containing "${params.layerName}"` }
          }
        } else if (typeof params.index === 'number') {
          const objects = design.canvas.getObjects().filter(obj => !(obj as any).isBaseLayer)
          if (objects[params.index]) {
            design.canvas.setActiveObject(objects[params.index])
            design.canvas.requestRenderAll()
            return { success: true, data: `Selected object at index ${params.index}` }
          } else {
            return { success: false, data: `No object found at index ${params.index}` }
          }
        }
        return { success: false, data: 'Please provide either layerName or index' }
      } else if (toolName === 'deleteSelectedObject') {
        const objToDelete = design.canvas.getActiveObject()
        if (!objToDelete) {
          return { success: false, data: 'No object selected' }
        }
        design.canvas.remove(objToDelete)
        // Also remove from layers
        const layerToRemove = design.layers.find(l => l.object === objToDelete)
        if (layerToRemove) {
          design.removeLayer(layerToRemove.id)
        }
        return { success: true, data: 'Deleted selected object' }
      } else if (toolName === 'duplicateSelectedObject') {
        const activeObject = design.canvas.getActiveObject()
        if (!activeObject || (activeObject as any).isBaseLayer) {
          return { success: false, data: 'No object selected or cannot duplicate base layer' }
        }
        design.duplicateActiveObject().then(() => {
          // Duplication is async, so we don't wait for it in this synchronous context
        })
        return { success: true, data: 'Duplicating selected object' }
      }
    } catch (error) {
      console.error('Error executing canvas tool:', error)
      return { success: false, data: `Error executing ${toolName}: ${error}` }
    }
    console.log('executeCanvasTool end', toolName, params)
  }
})) 