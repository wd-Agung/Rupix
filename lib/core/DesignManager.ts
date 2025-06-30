import type { TEvent } from 'fabric';
import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { initControls } from './Control';
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
  opacity?: number
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
    stroke: '#000000',
    strokeWidth: 1,
    opacity: 1
  }
  public clippingEnabled: boolean = true

  // Tool properties
  public selectedTool: ToolType = 'select'
  public fillColor = '#3b82f6'
  public strokeColor = 'transparent'
  public strokeWidth = 0
  public fontSize = 20
  public fontFamily = 'Inter'
  public opacity = 1

  // Text formatting properties
  public fontWeight = 'normal'
  public fontStyle = 'normal'
  public underline = false
  public textAlign = 'left'
  public lineHeight = 1.2
  public charSpacing = 0

  // Advanced styling properties
  public shadow: fabric.Shadow | null = null
  public backgroundColor = 'transparent'

  // Pan state
  public isDragging = false
  public lastPosX = 0
  public lastPosY = 0
  public isSpacePressed = false
  public panMethod: 'none' | 'alt' | 'middle' | 'space' | 'touch' = 'none'

  // Camera lock state
  public cameraLocked = true // Default to locked

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

    // Center camera if locked (default behavior)
    if (this.cameraLocked) {
      // Delay centering to ensure base layer is fully rendered
      setTimeout(() => this.centerCamera(), 10)
    }
  }

  private setupEventListeners() {
    if (!this.canvas) return

    this.canvas.on('mouse:wheel', this.handleZoom)
    this.canvas.on('mouse:down', this.handleToolMouseDown)
    this.canvas.on('object:moving', this.handleObjectMoving)

    // Add drag and drop support
    this.setupDragAndDrop()

    // Add clipboard paste support
    this.setupClipboardPaste()
  }

  private setupKeyboardListeners() {
    if (!this.canvas) return

    const canvasElement = this.canvas.getElement()

    // Ensure canvas element can receive focus for keyboard events
    canvasElement.setAttribute('tabindex', '0')

    // Add keyboard event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl+D (or Cmd+D on Mac) is pressed for duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        this.duplicateActiveObject()
      }
    }

    // Add event listeners to both document and canvas element
    document.addEventListener('keydown', handleKeyDown)
    canvasElement.addEventListener('keydown', handleKeyDown)

      // Store references for cleanup
      ; (this as any)._keydownHandler = handleKeyDown
  }

  private setupDragAndDrop() {
    if (!this.canvas) return

    const canvasElement = this.canvas.getElement()
    const canvasContainer = canvasElement.parentElement

    if (!canvasContainer) return

    // Prevent default drag behaviors
    canvasContainer.addEventListener('dragenter', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })

    canvasContainer.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.stopPropagation()
      // Add visual feedback
      canvasContainer.style.opacity = '0.8'
    })

    canvasContainer.addEventListener('dragleave', (e) => {
      e.preventDefault()
      e.stopPropagation()
      // Remove visual feedback
      canvasContainer.style.opacity = '1'
    })

    canvasContainer.addEventListener('drop', (e) => {
      e.preventDefault()
      e.stopPropagation()

      // Remove visual feedback
      canvasContainer.style.opacity = '1'

      const files = e.dataTransfer?.files
      if (files) {
        Array.from(files).forEach(file => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (event) => {
              const result = event.target?.result as string
              if (result) {
                // Get drop position relative to canvas
                const rect = canvasElement.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top
                const canvasPoint = this.canvas?.getScenePoint(e as any)

                this.addImageFromDataURL(result, file.name, canvasPoint)
              }
            }
            reader.readAsDataURL(file)
          }
        })
      }
    })
  }

  private setupClipboardPaste() {
    if (!this.canvas) return

    // Listen for paste events on the document
    document.addEventListener('paste', (e) => {
      // Only handle paste if canvas has focus or is the active element
      const canvasElement = this.canvas?.getElement()
      if (!canvasElement || !this.isCanvasFocused()) return

      const items = e.clipboardData?.items
      if (!items) return

      Array.from(items).forEach(item => {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
              const result = event.target?.result as string
              if (result) {
                // Add image at center of viewport
                const center = this.getCanvasCenter()
                this.addImageFromDataURL(result, 'Pasted Image', center)
              }
            }
            reader.readAsDataURL(file)
          }
        }
      })

      e.preventDefault()
    })
  }

  private isCanvasFocused(): boolean {
    if (!this.canvas) return false
    const canvasElement = this.canvas.getElement()
    return document.activeElement === canvasElement ||
      document.activeElement === canvasElement.parentElement ||
      canvasElement.contains(document.activeElement)
  }

  private getCanvasCenter(): { x: number; y: number } {
    if (!this.canvas) return { x: 0, y: 0 }

    const viewportTransform = this.canvas.viewportTransform
    const zoom = this.canvas.getZoom()
    const width = this.canvas.getWidth()
    const height = this.canvas.getHeight()

    // Calculate center point in canvas coordinates
    const centerX = (width / 2 - (viewportTransform?.[4] || 0)) / zoom
    const centerY = (height / 2 - (viewportTransform?.[5] || 0)) / zoom

    return { x: centerX, y: centerY }
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
      // Zoom behavior - always allow zooming
      const delta = event.deltaY * 4
      let zoom = this.canvas.getZoom() * (0.999 ** delta)
      zoom = Math.max(0.1, Math.min(zoom, 20))

      if (this.cameraLocked) {
        // When camera is locked, zoom to center with limits
        const canvasWidth = this.canvas.getWidth()
        const canvasHeight = this.canvas.getHeight()

        // Calculate minimum zoom to fit entire canvas with padding
        const padding = 80
        const availableWidth = canvasWidth - (padding * 2)
        const availableHeight = canvasHeight - (padding * 2)
        const scaleX = availableWidth / this.baseLayerConfig.width
        const scaleY = availableHeight / this.baseLayerConfig.height
        const minZoom = Math.min(scaleX, scaleY, 1) * 0.8 // Allow zooming out a bit more

        // Constrain zoom to reasonable limits when camera is locked
        const constrainedZoom = Math.max(minZoom, Math.min(zoom, 3)) // Max 3x zoom when locked

        this.canvas.zoomToPoint(new fabric.Point(canvasWidth / 2, canvasHeight / 2), constrainedZoom)

        // After zooming, re-center the canvas
        this.centerCameraPosition()
      } else {
        this.canvas.zoomToPoint(new fabric.Point(event.offsetX, event.offsetY), zoom)
      }
    } else if (!this.cameraLocked) {
      // Only allow panning when camera is not locked
      this.canvas.relativePan(new fabric.Point(event.deltaX, event.deltaY))
    }

    event.preventDefault()
    event.stopPropagation()

    if (!this.cameraLocked) {
      this.updateRuler()
    }
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
      fontWeight: this.fontWeight,
      fontStyle: this.fontStyle,
      underline: this.underline,
      textAlign: this.textAlign,
      lineHeight: this.lineHeight,
      charSpacing: this.charSpacing,
      fill: this.fillColor,
      opacity: this.opacity,
      shadow: this.shadow,
      backgroundColor: this.backgroundColor,
    }

    switch (this.selectedTool) {
      case 'rectangle': this.addRectangle({ x: pointer.x, y: pointer.y }, props); break
      case 'circle': this.addCircle({ x: pointer.x, y: pointer.y }, props); break
      case 'text': this.addText({ x: pointer.x, y: pointer.y }, textProps); break
      case 'image':
        // For image tool, we'll trigger the file input dialog
        this.triggerImageUpload(pointer)
        break
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
      opacity: this.baseLayerConfig.opacity,
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

    if (this.baseLayer && this.canvas) {
      this.baseLayer.set({
        left: this.baseLayerConfig.x,
        top: this.baseLayerConfig.y,
        width: this.baseLayerConfig.width,
        height: this.baseLayerConfig.height,
        fill: this.baseLayerConfig.fill,
        stroke: this.baseLayerConfig.stroke,
        strokeWidth: this.baseLayerConfig.strokeWidth,
        opacity: this.baseLayerConfig.opacity
      })

      if (config.width !== undefined || config.height !== undefined) {
        const newBounds = this.getBaseLayerBounds()
        const objects = this.canvas.getObjects().filter(obj => !(obj as any).isBaseLayer)

        objects.forEach(obj => {
          const objBounds = obj.getBoundingRect()
          const newPos: { left?: number; top?: number } = {}
          let needsUpdate = false

          if (objBounds.left < newBounds.left) {
            newPos.left = newBounds.left
            needsUpdate = true
          } else if (objBounds.left + objBounds.width > newBounds.right) {
            newPos.left = newBounds.right - objBounds.width
            needsUpdate = true
          }

          if (objBounds.top < newBounds.top) {
            newPos.top = newBounds.top
            needsUpdate = true
          } else if (objBounds.top + objBounds.height > newBounds.bottom) {
            newPos.top = newBounds.bottom - objBounds.height
            needsUpdate = true
          }

          if (needsUpdate) {
            obj.set(newPos)
            obj.setCoords()
          }
        })
      }

      // Update clipping if enabled
      if (this.clippingEnabled) {
        this.setupClipping()
      }

      // Re-center camera if locked and size changed
      if (this.cameraLocked && (config.width !== undefined || config.height !== undefined)) {
        this.centerCamera()
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
      stroke: '#000000',
      strokeWidth: 1,
      opacity: props.opacity,
      cornerColor: '#ffffff',
      cornerStrokeColor: '#3b82f6',
      borderColor: '#3b82f6',
      cornerSize: 8,
      transparentCorners: false,
      cornerStyle: 'rect',
      borderScaleFactor: 2,
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
      stroke: '#000000',
      strokeWidth: 1,
      opacity: props.opacity,
      cornerColor: '#ffffff',
      cornerStrokeColor: '#3b82f6',
      borderColor: '#3b82f6',
      cornerSize: 8,
      transparentCorners: false,
      cornerStyle: 'rect',
      borderScaleFactor: 2,
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
    props: {
      fontSize: number;
      fontFamily: string;
      fontWeight: string;
      fontStyle: string;
      underline: boolean;
      textAlign: string;
      lineHeight: number;
      charSpacing: number;
      fill: string;
      opacity: number;
      shadow: fabric.Shadow | null;
      backgroundColor: string;
    }
  ) {
    if (!this.canvas) return
    const text = new fabric.IText('', {
      left: pos.x,
      top: pos.y,
      fontSize: props.fontSize,
      fontFamily: props.fontFamily,
      fontWeight: props.fontWeight,
      fontStyle: props.fontStyle,
      underline: props.underline,
      textAlign: props.textAlign,
      lineHeight: props.lineHeight,
      charSpacing: props.charSpacing,
      fill: '#000000',
      opacity: props.opacity,
      shadow: props.shadow,
      backgroundColor: props.backgroundColor !== 'transparent' ? props.backgroundColor : undefined,
      cornerColor: '#ffffff',
      cornerStrokeColor: '#3b82f6',
      borderColor: '#3b82f6',
      cornerSize: 8,
      transparentCorners: false,
      cornerStyle: 'rect',
      borderScaleFactor: 2,
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

  public addImageFromDataURL(dataUrl: string, name: string, position?: { x: number; y: number }) {
    if (!this.canvas) return

    // Use provided position or center of canvas
    const pos = position || this.getCanvasCenter()

    fabric.Image.fromURL(dataUrl, {
      crossOrigin: 'anonymous'
    }).then((img: fabric.Image) => {
      if (!img || !this.canvas) return

      // Scale image to reasonable size if too large
      const maxWidth = 300
      const maxHeight = 300
      const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!, 1)

      img.set({
        left: pos.x - (img.width! * scale) / 2,
        top: pos.y - (img.height! * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        cornerColor: '#ffffff',
        cornerStrokeColor: '#3b82f6',
        borderColor: '#3b82f6',
        cornerSize: 8,
        transparentCorners: false,
        cornerStyle: 'rect',
        borderScaleFactor: 2,
      })

      this.canvas.add(img)
      this.canvas.setActiveObject(img)

      // Ensure base layer stays at bottom
      if (this.baseLayer) {
        this.canvas.sendObjectToBack(this.baseLayer)
      }

      this.canvas.renderAll()
      this.addLayer({ name: name || 'Image', object: img, visible: true, locked: false })
    }).catch((error) => {
      console.error('Failed to load image:', error)
    })
  }

  private triggerImageUpload(position: { x: number; y: number }) {
    // Create file input for image upload
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = false

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files[0]) {
        const file = files[0]
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            if (result) {
              this.addImageFromDataURL(result, file.name, position)
            }
          }
          reader.readAsDataURL(file)
        }
      }
    }

    input.click()
  }

  // --- Canvas Operations ---
  public duplicateActiveObject = async () => {
    if (!this.canvas) return null

    const activeObject = this.canvas.getActiveObject()
    if (!activeObject || (activeObject as any).isBaseLayer) return null

    try {
      // Clone the active object using the fabric clone method
      const cloned = await activeObject.clone()

      if (!this.canvas) return null

      // Offset the cloned object slightly
      const offset = 20
      cloned.set({
        left: (cloned.left || 0) + offset,
        top: (cloned.top || 0) + offset,
      })

      // Add to canvas
      this.canvas.add(cloned)
      this.canvas.setActiveObject(cloned)

      // Ensure base layer stays at bottom
      if (this.baseLayer) {
        this.canvas.sendObjectToBack(this.baseLayer)
      }

      this.canvas.renderAll()

      // Add to layers
      const originalLayer = this.layers.find(l => l.object === activeObject)
      const layerName = originalLayer ? `${originalLayer.name} Copy` : 'Duplicated Object'
      this.addLayer({
        name: layerName,
        object: cloned,
        visible: true,
        locked: false
      })

      return cloned
    } catch (error) {
      console.error('Error duplicating object:', error)
      return null
    }
  }

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

    // For PNG and JPG, we need to reset the viewport to export the base layer area correctly
    if (format === 'png' || format === 'jpg') {
      const originalTransform = this.canvas.viewportTransform
      // Reset viewport to default (no pan, no zoom)
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0])

      const exportOptions = {
        left: this.baseLayerConfig.x,
        top: this.baseLayerConfig.y,
        width: this.baseLayerConfig.width,
        height: this.baseLayerConfig.height,
        multiplier: 1,
      }

      let dataURL;
      if (format === 'png') {
        const originalBackgroundColor = this.canvas.backgroundColor;
        // Temporarily set background to transparent for PNG export if base layer is transparent
        if (this.baseLayerConfig.opacity === 0) {
          this.canvas.backgroundColor = 'transparent';
          this.baseLayer?.set('visible', false)
          this.canvas.renderAll()
        }

        dataURL = this.canvas.toDataURL({ format: 'png', ...exportOptions });

        // Restore original background color
        this.baseLayer?.set('visible', true)
        this.canvas.backgroundColor = originalBackgroundColor;
      } else { // jpg
        dataURL = this.canvas.toDataURL({ format: 'jpeg', quality: 0.8, ...exportOptions });
      }

      // Restore original viewport transform
      if (originalTransform) {
        this.canvas.setViewportTransform(originalTransform)
      }
      this.canvas.renderAll()

      return dataURL
    }

    // For SVG, viewBox can handle the clipping without changing viewport
    if (format === 'svg') {
      return this.canvas.toSVG({
        width: this.baseLayerConfig.width.toString(),
        height: this.baseLayerConfig.height.toString(),
        viewBox: {
          x: this.baseLayerConfig.x,
          y: this.baseLayerConfig.y,
          width: this.baseLayerConfig.width,
          height: this.baseLayerConfig.height,
        },
      })
    }

    if (format === 'json') {
      return this.canvas.toJSON() // Consider enhancing to export full design state
    }

    return ''
  }

  // --- Cleanup ---
  public dispose() {
    // Remove keyboard event listeners
    const keydownHandler = (this as any)._keydownHandler
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler)
      const canvasElement = this.canvas?.getElement()
      if (canvasElement) {
        canvasElement.removeEventListener('keydown', keydownHandler)
      }
      delete (this as any)._keydownHandler
    }

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

  // Text formatting setters
  public setFontWeight = (weight: string) => { this.fontWeight = weight }
  public setFontStyle = (style: string) => { this.fontStyle = style }
  public setUnderline = (underline: boolean) => { this.underline = underline }
  public setTextAlign = (align: string) => { this.textAlign = align }
  public setLineHeight = (height: number) => { this.lineHeight = height }
  public setCharSpacing = (spacing: number) => { this.charSpacing = spacing }

  // Advanced styling setters
  public setShadow = (shadow: fabric.Shadow | null) => { this.shadow = shadow }
  public setBackgroundColor = (color: string) => { this.backgroundColor = color }

  // --- Camera Controls ---
  public setCameraLocked = (locked: boolean) => {
    this.cameraLocked = locked
    if (locked) {
      // When locking, apply proper zoom and centering
      this.centerCamera()
    }
    this.notify()
  }

  public centerCamera = () => {
    if (!this.canvas) return

    const canvasWidth = this.canvas.getWidth()
    const canvasHeight = this.canvas.getHeight()
    const baseLayerBounds = this.getBaseLayerBounds()

    // Calculate zoom to fit the entire base layer with padding
    const padding = 80 // 80px padding on all sides
    const availableWidth = canvasWidth - (padding * 2)
    const availableHeight = canvasHeight - (padding * 2)

    const scaleX = availableWidth / this.baseLayerConfig.width
    const scaleY = availableHeight / this.baseLayerConfig.height

    // Use the smaller scale to ensure entire canvas fits
    const optimalZoom = Math.min(scaleX, scaleY, 1) // Don't zoom in beyond 1:1

    // Calculate the center position for the base layer
    const centerX = canvasWidth / 2 - (baseLayerBounds.left + this.baseLayerConfig.width / 2) * optimalZoom
    const centerY = canvasHeight / 2 - (baseLayerBounds.top + this.baseLayerConfig.height / 2) * optimalZoom

    // Set viewport transform with optimal zoom and center position
    this.canvas.setViewportTransform([optimalZoom, 0, 0, optimalZoom, centerX, centerY])
    this.canvas.renderAll()
    this.updateRuler()
  }

  public centerCameraPosition = () => {
    if (!this.canvas) return

    const canvasWidth = this.canvas.getWidth()
    const canvasHeight = this.canvas.getHeight()
    const baseLayerBounds = this.getBaseLayerBounds()
    const currentZoom = this.canvas.getZoom()

    // Calculate the center position for the base layer at current zoom
    const centerX = canvasWidth / 2 - (baseLayerBounds.left + this.baseLayerConfig.width / 2) * currentZoom
    const centerY = canvasHeight / 2 - (baseLayerBounds.top + this.baseLayerConfig.height / 2) * currentZoom

    // Update only the position, keep current zoom
    this.canvas.setViewportTransform([currentZoom, 0, 0, currentZoom, centerX, centerY])
    this.canvas.renderAll()
  }

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

  public reorderLayer = (layerId: string, newIndex: number) => {
    if (!this.canvas) return

    const currentIndex = this.layers.findIndex(l => l.id === layerId)
    if (currentIndex === -1 || currentIndex === newIndex) return

    // Remove layer from current position
    const [movedLayer] = this.layers.splice(currentIndex, 1)

    // Insert at new position
    this.layers.splice(newIndex, 0, movedLayer)

    // Update canvas object order to match layer order
    // Layers array index 0 should be at bottom of canvas (lowest z-index)
    // So we need to reorder canvas objects accordingly
    this.updateCanvasObjectOrder()

    this.notify()
  }

  private updateCanvasObjectOrder = () => {
    if (!this.canvas) return

    // Get all objects except base layer
    const objects = this.canvas.getObjects().filter(obj => !(obj as any).isBaseLayer)

    // Clear all objects except base layer
    objects.forEach(obj => this.canvas?.remove(obj))

    // Re-add objects in layer order (index 0 = bottom, higher index = top)
    this.layers.forEach(layer => {
      this.canvas?.add(layer.object)
    })

    // Ensure base layer stays at the bottom
    if (this.baseLayer) {
      this.canvas.sendObjectToBack(this.baseLayer)
    }

    this.canvas.renderAll()
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