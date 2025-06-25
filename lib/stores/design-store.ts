import { CanvasLayer, DesignManager, ToolType } from '@/lib/core/DesignManager'
import type * as fabric from 'fabric'
import { create } from 'zustand'

export type { CanvasLayer, ToolType }

export interface CanvasState {
  designs: DesignManager[]
  activeDesignId: string | null
  selectedTool: ToolType
  isDrawing: boolean
  fillColor: string
  strokeColor: string
  strokeWidth: number
  fontSize: number
  fontFamily: string
  opacity: number
}

export interface InitCanvasOptions {
  backgroundColor: string
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

  // Tool and drawing state
  setSelectedTool: (tool: ToolType) => void
  setIsDrawing: (isDrawing: boolean) => void

  // Properties
  setFillColor: (color: string) => void
  setStrokeColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setFontSize: (size: number) => void
  setFontFamily: (family: string) => void
  setOpacity: (opacity: number) => void

}

export type DesignStore = CanvasState & CanvasActions

export const useDesignStore = create<DesignStore>((set, get) => ({
  // State
  designs: [],
  activeDesignId: null,
  selectedTool: 'select',
  isDrawing: false,
  fillColor: '#3b82f6',
  strokeColor: '#1e40af',
  strokeWidth: 2,
  fontSize: 20,
  fontFamily: 'Arial',
  opacity: 1,

  // Design management actions
  createNewDesign: (name) => {
    const designName = name || `Canvas ${get().designs.length + 1}`

    const newDesign = new DesignManager(designName)
    console.log('newDesign', newDesign)

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
    console.log('setActiveDesign', designId)
    set({ activeDesignId: designId })
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
        } as fabric.CanvasOptions,
        options.onStateChange
      )

      design.canvas?.on('tool_change', (e) => {
        console.log('tool_change', e)
        set({ selectedTool: e.tool })
      })
    }
  },

  // Tool and drawing state
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setIsDrawing: (isDrawing) => set({ isDrawing }),

  // Properties
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setFontSize: (size) => set({ fontSize: size }),
  setFontFamily: (family) => set({ fontFamily: family }),
  setOpacity: (opacity) => set({ opacity: opacity }),
})) 