import type { TEvent } from 'fabric';
import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { initControls } from './control';
import { CanvasRuler } from './ruler';
import initAligningGuidelines from './ruler/SnapLine';

declare module "fabric" {
  interface CanvasEvents {
    'tool_change': Partial<TEvent> & {
      tool: ToolType;
    };
  }
}

export type ToolType = 'select' | 'rectangle' | 'circle' | 'text' | 'image' | 'pen'

export interface CanvasLayer {
  id: string
  name: string
  object: fabric.Object
  visible: boolean
  locked: boolean
}

export interface BaseLayerConfig {
  width: number
  height: number
  x: number
  y: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

type DesignManagerListener = (manager: DesignManager) => void

export class DesignManager {
  public id: string
  public name: string
  public canvas: fabric.Canvas | null = null
  public ruler: CanvasRuler | null = null
  public layers: CanvasLayer[] = []
  public selectedLayerId: string | null = null
  public lastModified: Date
  private onStateChange: ((state: { scrollLeft: number; scrollTop: number; zoom: number }) => void) | null = null

  // Base layer properties
  public baseLayer: fabric.Rect | null = null
  public baseLayerConfig: BaseLayerConfig = {
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    fill: '#ffffff',
    stroke: '#e5e5e5',
    strokeWidth: 1
  }
  public clippingEnabled: boolean = true

  // Tool properties
  public selectedTool: ToolType = 'select'
  public fillColor = '#3b82f6'
  public strokeColor = '#1e40af'
  public strokeWidth = 2
  public fontSize = 20
  public fontFamily = 'Arial'
  public opacity = 1

  // Pan state
  public isDragging = false
  public lastPosX = 0
  public lastPosY = 0
  public isSpacePressed = false
  public panMethod: 'none' | 'alt' | 'middle' | 'space' | 'touch' = 'none'

  private listeners: Set<DesignManagerListener> = new Set()

  constructor(name: string, baseLayerConfig?: Partial<BaseLayerConfig>) {
    this.id = uuidv4()
    this.name = name
    this.lastModified = new Date()

    if (baseLayerConfig) {
      this.baseLayerConfig = { ...this.baseLayerConfig, ...baseLayerConfig }
    }
  }

  public subscribe(listener: DesignManagerListener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach(listener => listener(this))
  }

  public initCanvas(
    canvasElement: HTMLCanvasElement,
    options: fabric.CanvasOptions,
    onStateChange?: (state: { scrollLeft: number; scrollTop: number; zoom: number }) => void
  ) {
    this.canvas = new fabric.Canvas(canvasElement, options)
    this.onStateChange = onStateChange || null
    this.lastModified = new Date()

    // Configure selection appearance
    initControls()

    // init snap line
    initAligningGuidelines(this.canvas)

    this.setupEventListeners()
    this.setupKeyboardListeners()
    this.ruler = new CanvasRuler(this.canvas)
    this.ruler.enable()

    // Initialize base layer
    this.initializeBaseLayer()
  }

  private setupEventListeners() {
    if (!this.canvas) return

    this.canvas.on('mouse:wheel', this.handleZoom)
    this.canvas.on('mouse:down', this.handleToolMouseDown)
    this.canvas.on('object:moving', this.handleObjectMoving)
  }

  private setupKeyboardListeners() {
    if (!this.canvas) return

    const canvasElement = this.canvas.getElement()

    // Ensure canvas element can receive focus for keyboard events
    canvasElement.setAttribute('tabindex', '0')
  }

  // --- Event Handlers ---
  private updateRuler = () => {
    if (!this.canvas) return
    this.onStateChange?.({
      scrollLeft: this.canvas.viewportTransform?.[4] ?? 0,
      scrollTop: this.canvas.viewportTransform?.[5] ?? 0,
      zoom: this.canvas.getZoom(),
    })
  }

  private handleZoom = (opt: fabric.TEvent<WheelEvent>) => {
    if (!this.canvas) return
    const event = opt.e

    // Check if Ctrl (Windows/Linux) or Cmd (Mac) is pressed for zooming
    const isZoomModifier = event.ctrlKey || event.metaKey

    if (isZoomModifier) {
      // Zoom behavior
      const delta = event.deltaY
      let zoom = this.canvas.getZoom() * (0.999 ** delta)
      zoom = Math.max(0.1, Math.min(zoom, 20))
      this.canvas.zoomToPoint(new fabric.Point(event.offsetX, event.offsetY), zoom)
    } else {
      // Default panning behavior
      this.canvas.relativePan(new fabric.Point(event.deltaX, event.deltaY))
    }

    event.preventDefault()
    event.stopPropagation()
  }

  private handleToolMouseDown = (opt: fabric.TEvent) => {
    if (this.selectedTool === 'select' || (opt.e as MouseEvent).altKey || !this.canvas) {
      return
    }
    // get mouse position
    const pointer = this.canvas.getScenePoint(opt.e)
    const props = {
      fill: this.fillColor,
      stroke: this.strokeColor,
      strokeWidth: this.strokeWidth,
      opacity: this.opacity,
    }
    const textProps = {
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fill: this.fillColor,
      opacity: this.opacity,
    }

    switch (this.selectedTool) {
      case 'rectangle': this.addRectangle({ x: pointer.x, y: pointer.y }, props); break
      case 'circle': this.addCircle({ x: pointer.x, y: pointer.y }, props); break
      case 'text': this.addText({ x: pointer.x, y: pointer.y }, textProps); break
    }

    this.selectedTool = 'select'
    console.log('tool_change in handleToolMouseDown', this.selectedTool)
    this.canvas.fire('tool_change', { tool: this.selectedTool })
  }

  private handleObjectMoving = (opt: { target?: fabric.Object }) => {
    const obj = opt.target
    if (!obj || !this.canvas) return
    obj.setCoords()
  }

  // --- Base Layer Management ---
  private initializeBaseLayer() {
    if (!this.canvas) return

    // Create base layer rectangle
    this.baseLayer = new fabric.Rect({
      left: this.baseLayerConfig.x,
      top: this.baseLayerConfig.y,
      width: this.baseLayerConfig.width,
      height: this.baseLayerConfig.height,
      fill: this.baseLayerConfig.fill,
      stroke: this.baseLayerConfig.stroke,
      strokeWidth: this.baseLayerConfig.strokeWidth,
      selectable: false,
      evented: false,
      excludeFromExport: false,
      isBaseLayer: true
    } as any) // Using any to add custom property

    // Add base layer to canvas
    this.canvas.add(this.baseLayer)
    this.canvas.sendObjectToBack(this.baseLayer)

    // Set up clipping if enabled
    if (this.clippingEnabled) {
      this.setupClipping()
    }

    this.canvas.renderAll()
  }

  private setupClipping() {
    if (!this.canvas || !this.baseLayer) return

    // Create clipping path based on base layer dimensions
    const clipPath = new fabric.Rect({
      left: this.baseLayerConfig.x,
      top: this.baseLayerConfig.y,
      width: this.baseLayerConfig.width,
      height: this.baseLayerConfig.height,
      absolutePositioned: true
    })

    // Apply clipping to canvas
    this.canvas.clipPath = clipPath
    this.canvas.renderAll()
  }

  public updateBaseLayer(config: Partial<BaseLayerConfig>) {
    this.baseLayerConfig = { ...this.baseLayerConfig, ...config }

    if (this.baseLayer) {
      this.baseLayer.set({
        left: this.baseLayerConfig.x,
        top: this.baseLayerConfig.y,
        width: this.baseLayerConfig.width,
        height: this.baseLayerConfig.height,
        fill: this.baseLayerConfig.fill,
        stroke: this.baseLayerConfig.stroke,
        strokeWidth: this.baseLayerConfig.strokeWidth
      })

      // Update clipping if enabled
      if (this.clippingEnabled) {
        this.setupClipping()
      }

      this.canvas?.renderAll()
      this.notify()
    }
  }

  public setClippingEnabled(enabled: boolean) {
    this.clippingEnabled = enabled

    if (!this.canvas) return

    if (enabled) {
      this.setupClipping()
    } else {
      // Remove clipping
      this.canvas.clipPath = undefined
    }

    this.canvas.renderAll()
    this.notify()
  }

  public getBaseLayerBounds(): { left: number; top: number; right: number; bottom: number } {
    return {
      left: this.baseLayerConfig.x,
      top: this.baseLayerConfig.y,
      right: this.baseLayerConfig.x + this.baseLayerConfig.width,
      bottom: this.baseLayerConfig.y + this.baseLayerConfig.height
    }
  }

  public isObjectWithinBaseLayer(obj: fabric.Object): boolean {
    if (!obj) return false

    const bounds = this.getBaseLayerBounds()
    const objBounds = obj.getBoundingRect()

    return objBounds.left >= bounds.left &&
      objBounds.top >= bounds.top &&
      objBounds.left + objBounds.width <= bounds.right &&
      objBounds.top + objBounds.height <= bounds.bottom
  }

  public isObjectIntersectingBaseLayer(obj: fabric.Object): boolean {
    if (!obj) return false

    const bounds = this.getBaseLayerBounds()
    const objBounds = obj.getBoundingRect()

    return !(objBounds.left > bounds.right ||
      objBounds.left + objBounds.width < bounds.left ||
      objBounds.top > bounds.bottom ||
      objBounds.top + objBounds.height < bounds.top)
  }

  // --- Object Creation ---
  public addLayer(layerData: Omit<CanvasLayer, 'id'> & { id?: string }): CanvasLayer {
    const newLayer: CanvasLayer = {
      id: layerData.id || uuidv4(),
      ...layerData
    }
    this.layers = [...this.layers, newLayer]
    this.selectedLayerId = newLayer.id
    this.lastModified = new Date()

    // Ensure base layer stays at the bottom
    if (this.baseLayer && this.canvas) {
      this.canvas.sendObjectToBack(this.baseLayer)
    }

    this.notify()
    return newLayer
  }

  public addRectangle(
    pos: { x: number; y: number },
    props: { fill: string; stroke: string; strokeWidth: number; opacity: number }
  ) {
    if (!this.canvas) return
    const rect = new fabric.Rect({
      left: pos.x,
      top: pos.y,
      width: 100,
      height: 80,
      fill: props.fill,
      stroke: props.stroke,
      strokeWidth: props.strokeWidth,
      opacity: props.opacity,
      cornerColor: '#ffffff',
      cornerStrokeColor: '#3b82f6',
      borderColor: '#3b82f6',
      cornerSize: 8,
      transparentCorners: false,
      cornerStyle: 'rect',
      borderScaleFactor: 2,
      padding: 4
    })
    this.canvas.add(rect)
    this.canvas.setActiveObject(rect)

    // Ensure base layer stays at bottom
    if (this.baseLayer) {
      this.canvas.sendObjectToBack(this.baseLayer)
    }

    this.canvas.renderAll()
    this.addLayer({ name: 'Rectangle', object: rect, visible: true, locked: false })
  }

  public addCircle(
    pos: { x: number; y: number },
    props: { fill: string; stroke: string; strokeWidth: number; opacity: number }
  ) {
    if (!this.canvas) return
    const circle = new fabric.Circle({
      left: pos.x,
      top: pos.y,
      radius: 50,
      fill: props.fill,
      stroke: props.stroke,
      strokeWidth: props.strokeWidth,
      opacity: props.opacity,
      cornerColor: '#ffffff',
      cornerStrokeColor: '#3b82f6',
      borderColor: '#3b82f6',
      cornerSize: 8,
      transparentCorners: false,
      cornerStyle: 'rect',
      borderScaleFactor: 2,
      padding: 4
    })
    this.canvas.add(circle)
    this.canvas.setActiveObject(circle)

    // Ensure base layer stays at bottom
    if (this.baseLayer) {
      this.canvas.sendObjectToBack(this.baseLayer)
    }

    this.canvas.renderAll()
    this.addLayer({ name: 'Circle', object: circle, visible: true, locked: false })
  }

  public addText(
    pos: { x: number; y: number },
    props: { fontSize: number; fontFamily: string; fill: string; opacity: number }
  ) {
    if (!this.canvas) return
    const text = new fabric.IText('', {
      left: pos.x,
      top: pos.y,
      fontSize: props.fontSize,
      fontFamily: props.fontFamily,
      fill: props.fill,
      opacity: props.opacity,
      cornerColor: '#ffffff',
      cornerStrokeColor: '#3b82f6',
      borderColor: '#3b82f6',
      cornerSize: 8,
      transparentCorners: false,
      cornerStyle: 'rect',
      borderScaleFactor: 2,
      padding: 4
    })
    this.canvas.add(text)
    this.canvas.setActiveObject(text)

    // Ensure base layer stays at bottom
    if (this.baseLayer) {
      this.canvas.sendObjectToBack(this.baseLayer)
    }

    this.canvas.renderAll()
    text.enterEditing()
    this.addLayer({ name: 'Text', object: text, visible: true, locked: false })
  }

  // --- Canvas Operations ---
  public clear = () => {
    if (!this.canvas) return

    // Clear all objects except base layer
    const objectsToRemove = this.canvas.getObjects().filter(obj => !(obj as any).isBaseLayer)
    objectsToRemove.forEach(obj => this.canvas?.remove(obj))

    this.layers = []
    this.selectedLayerId = null
    this.notify()
  }

  public exportCanvas = (format: 'png' | 'jpg' | 'svg' | 'json'): string | object => {
    if (!this.canvas) return ''
    switch (format) {
      case 'png':
        return this.canvas.toDataURL({ format: 'png', multiplier: 1 })
      case 'jpg':
        return this.canvas.toDataURL({ format: 'jpeg', multiplier: 1 })
      case 'svg':
        return this.canvas.toSVG()
      case 'json':
        return this.canvas.toJSON() // Consider enhancing to export full design state
      default:
        return ''
    }
  }

  // --- Cleanup ---
  public dispose() {
    // Remove event listeners
    // document.removeEventListener('keydown', this.handleKeyDown)
    // document.removeEventListener('keyup', this.handleKeyUp)

    if (this.canvas) {
      this.canvas.dispose()
      this.canvas = null
    }

    this.baseLayer = null
  }

  // --- Property Setters ---
  public setSelectedTool = (tool: ToolType) => { this.selectedTool = tool }
  public setFillColor = (color: string) => { this.fillColor = color }
  public setStrokeColor = (color: string) => { this.strokeColor = color }
  public setStrokeWidth = (width: number) => { this.strokeWidth = width }
  public setFontSize = (size: number) => { this.fontSize = size }
  public setFontFamily = (family: string) => { this.fontFamily = family }
  public setOpacity = (opacity: number) => { this.opacity = opacity }

  // --- Layer Management ---
  public setSelectedLayer = (layerId: string | null) => {
    this.selectedLayerId = layerId
    if (this.canvas) {
      const layer = this.layers.find(l => l.id === layerId)
      if (layer) {
        this.canvas.setActiveObject(layer.object)
      } else {
        this.canvas.discardActiveObject()
      }
      this.canvas.renderAll()
    }
    this.notify()
  }

  public updateLayer = (layerId: string, updates: Partial<CanvasLayer>) => {
    this.layers = this.layers.map(layer => {
      if (layer.id === layerId) {
        const updatedLayer = { ...layer, ...updates }
        if (updates.object) {
          layer.object.set(updates.object)
        }
        return updatedLayer
      }
      return layer
    })
    this.notify()
  }

  public removeLayer = (layerId: string) => {
    const layerToRemove = this.layers.find(l => l.id === layerId)
    if (layerToRemove && this.canvas) {
      this.canvas.remove(layerToRemove.object)
    }
    this.layers = this.layers.filter(l => l.id !== layerId)
    if (this.selectedLayerId === layerId) {
      this.selectedLayerId = null
    }
    this.notify()
  }

  public toggleLayerVisibility = (layerId: string) => {
    const layer = this.layers.find(l => l.id === layerId)
    if (layer) {
      layer.visible = !layer.visible
      layer.object.set('visible', layer.visible)
      this.canvas?.renderAll()
      this.notify()
    }
  }

  public toggleLayerLock = (layerId: string) => {
    const layer = this.layers.find(l => l.id === layerId)
    if (layer) {
      layer.locked = !layer.locked
      layer.object.set('selectable', !layer.locked)
      layer.object.set('evented', !layer.locked)
      this.canvas?.renderAll()
      this.notify()
    }
  }

  public updateSelectedLayerObject = (properties: any) => {
    if (!this.canvas || !this.selectedLayerId) return
    const layer = this.layers.find(l => l.id === this.selectedLayerId)
    if (layer) {
      layer.object.set(properties)
      this.canvas.renderAll()
      this.notify() // Notify to update properties panel
    }
  }
} 