'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { useActiveDesign } from '@/lib/hooks/useActiveDesign'
import { useDesignStore } from '@/lib/stores/design-store'
import { cn } from '@/lib/utils'
import * as fabric from 'fabric'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronRight,
  Eraser,
  Italic,
  Palette,
  Plus,
  RotateCcw,
  Underline
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'

interface PropertiesPanelProps {
  className?: string
  onCollapse?: () => void
}

// Image filter presets
const filterPresets = [
  { name: 'None', filters: [] },
  { name: 'Grayscale', filters: [{ type: 'Grayscale' }] },
  { name: 'Sepia', filters: [{ type: 'Sepia' }] },
  {
    name: 'Vintage', filters: [
      { type: 'Sepia' },
      { type: 'Brightness', brightness: -0.1 },
      { type: 'Contrast', contrast: 0.1 }
    ]
  },
  {
    name: 'Black & White', filters: [
      { type: 'Grayscale' },
      { type: 'Contrast', contrast: 0.2 }
    ]
  },
  {
    name: 'Bright', filters: [
      { type: 'Brightness', brightness: 0.2 },
      { type: 'Saturation', saturation: 0.1 }
    ]
  },
  {
    name: 'Cool', filters: [
      { type: 'HueRotation', rotation: 0.1 },
      { type: 'Saturation', saturation: 0.15 }
    ]
  },
  {
    name: 'Warm', filters: [
      { type: 'HueRotation', rotation: -0.1 },
      { type: 'Brightness', brightness: 0.1 }
    ]
  },
  {
    name: 'High Contrast', filters: [
      { type: 'Contrast', contrast: 0.3 }
    ]
  },
  {
    name: 'Soft', filters: [
      { type: 'Blur', blur: 0.1 },
      { type: 'Brightness', brightness: 0.1 }
    ]
  }
]

const fontFamilies = [
  // Modern Sans-Serif (Most Popular for Design)
  'Inter',
  'Poppins',
  'Montserrat',
  'Work Sans',
  'DM Sans',
  'Plus Jakarta Sans',
  'Raleway',
  'Lato',
  'Open Sans',
  'Nunito Sans',
  'Manrope',
  'Lexend',
  'Rubik',
  'Outfit',
  'Quicksand',
  'Comfortaa',
  'Ubuntu',
  'Source Sans 3',
  'IBM Plex Sans',
  'Space Grotesk',

  // Classic Serif
  'Playfair Display',
  'Merriweather',
  'Lora',
  'Crimson Text',
  'Libre Baskerville',
  'Cormorant Garamond',
  'EB Garamond',
  'Spectral',

  // Slab Serif
  'Zilla Slab',
  'Roboto Slab',

  // Display & Headlines
  'Oswald',
  'Bebas Neue',
  'Archivo Black',
  'Anton',
  'Fjalla One',
  'Righteous',
  'Kanit',
  'Exo 2',
  'Roboto Condensed',

  // Decorative & Script
  'Fredoka',
  'Lobster',
  'Pacifico',
  'Dancing Script',

  // Monospace
  'Fira Code',
  'Source Code Pro',

  // System Fonts (Fallbacks)
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New'
]

export function PropertiesPanel({ className, onCollapse }: PropertiesPanelProps) {
  const {
    fillColor: globalFillColor,
    strokeColor: globalStrokeColor,
    strokeWidth: globalStrokeWidth,
    fontSize: globalFontSize,
    fontFamily: globalFontFamily,
    opacity: globalOpacity,
    // Text formatting
    fontWeight: globalFontWeight,
    fontStyle: globalFontStyle,
    underline: globalUnderline,
    textAlign: globalTextAlign,
    lineHeight: globalLineHeight,
    charSpacing: globalCharSpacing,
    // Advanced styling
    shadow: globalShadow,
    backgroundColor: globalBackgroundColor,
    setFillColor,
    setStrokeColor,
    setStrokeWidth,
    setFontSize,
    setFontFamily,
    setOpacity,
    // Text formatting setters
    setFontWeight,
    setFontStyle,
    setUnderline,
    setTextAlign,
    setLineHeight,
    setCharSpacing,
    // Advanced styling setters
    setShadow,
    setBackgroundColor,
    selectedTool,
  } = useDesignStore()

  const activeDesign = useActiveDesign()
  const [showFillPicker, setShowFillPicker] = useState(false)
  const [showStrokePicker, setShowStrokePicker] = useState(false)
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null)

  // Image filter states
  const [imageFilters, setImageFilters] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
    noise: 0
  })

  // Apply filters to image
  const applyFiltersToImage = (imageObj: fabric.Image, filters: any[]) => {
    const fabricFilters: any[] = []

    filters.forEach(filterConfig => {
      let filter: any = null

      switch (filterConfig.type) {
        case 'Brightness':
          filter = new fabric.filters.Brightness({
            brightness: filterConfig.brightness || 0
          })
          break
        case 'Contrast':
          filter = new fabric.filters.Contrast({
            contrast: filterConfig.contrast || 0
          })
          break
        case 'Saturation':
          filter = new fabric.filters.Saturation({
            saturation: filterConfig.saturation || 0
          })
          break
        case 'HueRotation':
          filter = new fabric.filters.HueRotation({
            rotation: filterConfig.rotation || 0
          })
          break
        case 'Blur':
          filter = new fabric.filters.Blur({
            blur: filterConfig.blur || 0
          })
          break
        case 'Noise':
          filter = new fabric.filters.Noise({
            noise: filterConfig.noise || 0
          })
          break
        case 'Grayscale':
          filter = new fabric.filters.Grayscale()
          break
        case 'Sepia':
          filter = new fabric.filters.Sepia()
          break
        case 'Invert':
          filter = new fabric.filters.Invert()
          break
      }

      if (filter) {
        fabricFilters.push(filter)
      }
    })

    imageObj.filters = fabricFilters
    imageObj.applyFilters()
    activeDesign?.canvas?.requestRenderAll()
  }

  // Apply preset filter
  const applyPresetFilter = (preset: typeof filterPresets[0]) => {
    if (activeObject && activeObject.type === 'image') {
      const imageObj = activeObject as fabric.Image
      applyFiltersToImage(imageObj, preset.filters)

      // Reset individual filter states when applying preset
      setImageFilters({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        blur: 0,
        noise: 0
      })
    }
  }

  // Apply individual filter
  const applyIndividualFilter = (filterType: string, value: number) => {
    if (activeObject && activeObject.type === 'image') {
      const imageObj = activeObject as fabric.Image

      // Update the specific filter value
      const newFilters = { ...imageFilters, [filterType]: value }
      setImageFilters(newFilters)

      // Build filter array from current individual values
      const filters = []
      if (newFilters.brightness !== 0) {
        filters.push({ type: 'Brightness', brightness: newFilters.brightness })
      }
      if (newFilters.contrast !== 0) {
        filters.push({ type: 'Contrast', contrast: newFilters.contrast })
      }
      if (newFilters.saturation !== 0) {
        filters.push({ type: 'Saturation', saturation: newFilters.saturation })
      }
      if (newFilters.hue !== 0) {
        filters.push({ type: 'HueRotation', rotation: newFilters.hue })
      }
      if (newFilters.blur !== 0) {
        filters.push({ type: 'Blur', blur: newFilters.blur })
      }
      if (newFilters.noise !== 0) {
        filters.push({ type: 'Noise', noise: newFilters.noise })
      }

      applyFiltersToImage(imageObj, filters)
    }
  }

  // Reset all filters
  const resetAllFilters = () => {
    if (activeObject && activeObject.type === 'image') {
      const imageObj = activeObject as fabric.Image
      imageObj.filters = []
      imageObj.applyFilters()
      activeDesign?.canvas?.requestRenderAll()

      setImageFilters({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        blur: 0,
        noise: 0
      })
    }
  }

  useEffect(() => {
    const updateStoreWithActiveObject = (obj: fabric.Object | null) => {
      if (obj) {
        setFillColor(obj.fill as string || globalFillColor)
        setStrokeColor(obj.stroke as string || globalStrokeColor)
        setStrokeWidth(obj.strokeWidth ?? globalStrokeWidth)
        setOpacity(obj.opacity ?? globalOpacity)
        if (obj.type === 'i-text') {
          const textObject = obj as fabric.IText
          setFontSize(textObject.fontSize || globalFontSize)
          setFontFamily(textObject.fontFamily || globalFontFamily)
          // Text formatting properties
          setFontWeight(textObject.fontWeight as string || globalFontWeight)
          setFontStyle(textObject.fontStyle as string || globalFontStyle)
          setUnderline(textObject.underline || globalUnderline)
          setTextAlign(textObject.textAlign || globalTextAlign)
          setLineHeight(textObject.lineHeight || globalLineHeight)
          setCharSpacing(textObject.charSpacing || globalCharSpacing)
          // Advanced styling properties
          setShadow(textObject.shadow || globalShadow)
          setBackgroundColor(textObject.backgroundColor as string || globalBackgroundColor)
        }
      } else if (activeDesign) {
        setFillColor(activeDesign.baseLayerConfig.fill || globalFillColor)
        setStrokeColor(activeDesign.baseLayerConfig.stroke || globalStrokeColor)
        setStrokeWidth(activeDesign.baseLayerConfig.strokeWidth ?? globalStrokeWidth)
        setOpacity(activeDesign.baseLayerConfig.opacity ?? globalOpacity)
      }
    }

    updateStoreWithActiveObject(activeObject)

    const handleObjectModified = (e: { target?: fabric.Object }) => {
      if (e.target && e.target === activeObject) {
        updateStoreWithActiveObject(e.target)
      }
    }

    if (activeDesign?.canvas) {
      activeDesign.canvas.on('object:modified', handleObjectModified)
    }

    return () => {
      if (activeDesign?.canvas) {
        activeDesign.canvas.off('object:modified', handleObjectModified)
      }
    }
  }, [
    activeDesign,
    activeObject,
    globalFillColor,
    globalFontFamily,
    globalFontSize,
    globalOpacity,
    globalStrokeColor,
    globalStrokeWidth,
    // New properties
    globalFontWeight,
    globalFontStyle,
    globalUnderline,
    globalTextAlign,
    globalLineHeight,
    globalCharSpacing,
    globalShadow,
    globalBackgroundColor,
    setFillColor,
    setFontFamily,
    setFontSize,
    setOpacity,
    setStrokeColor,
    setStrokeWidth,
    // New setters
    setFontWeight,
    setFontStyle,
    setUnderline,
    setTextAlign,
    setLineHeight,
    setCharSpacing,
    setShadow,
    setBackgroundColor
  ])

  // Listen to Fabric.js selection events
  useEffect(() => {
    if (!activeDesign?.canvas) return

    const canvas = activeDesign.canvas

    const handleSelectionCreated = (e: any) => {
      const selectedObjects = e.selected || []
      if (selectedObjects.length > 0) {
        setActiveObject(selectedObjects[0]) // For simplicity, use first selected object
      }
    }

    const handleSelectionUpdated = (e: any) => {
      const selectedObjects = e.selected || []
      if (selectedObjects.length > 0) {
        setActiveObject(selectedObjects[0]) // For simplicity, use first selected object
      } else {
        setActiveObject(null)
      }
    }

    const handleSelectionCleared = () => {
      setActiveObject(null)
    }

    // Add event listeners
    canvas.on('selection:created', handleSelectionCreated)
    canvas.on('selection:updated', handleSelectionUpdated)
    canvas.on('selection:cleared', handleSelectionCleared)

    // Set initial active object if there's already one selected
    const currentActiveObject = canvas.getActiveObject()
    setActiveObject(currentActiveObject || null)

    // Cleanup function
    return () => {
      canvas.off('selection:created', handleSelectionCreated)
      canvas.off('selection:updated', handleSelectionUpdated)
      canvas.off('selection:cleared', handleSelectionCleared)
    }
  }, [activeDesign?.canvas])

  const isObjectSelected = !!activeObject
  const isBaseLayerSelected = !isObjectSelected && activeDesign

  const effectiveFillColor = isObjectSelected
    ? (activeObject?.fill as string) || globalFillColor
    : (activeDesign?.baseLayerConfig.fill || globalFillColor)

  const effectiveStrokeColor = isObjectSelected
    ? (activeObject?.stroke as string) || globalStrokeColor
    : (activeDesign?.baseLayerConfig.stroke || globalStrokeColor)

  const effectiveStrokeWidth = isObjectSelected
    ? activeObject?.strokeWidth ?? globalStrokeWidth
    : activeDesign?.baseLayerConfig.strokeWidth ?? globalStrokeWidth

  const effectiveOpacity = isObjectSelected
    ? activeObject?.opacity ?? globalOpacity
    : activeDesign?.baseLayerConfig.opacity ?? globalOpacity

  let effectiveFontSize = globalFontSize
  let effectiveFontFamily = globalFontFamily
  if (activeObject && activeObject.type === 'i-text') {
    effectiveFontSize = (activeObject as fabric.IText).fontSize || globalFontSize
    effectiveFontFamily = (activeObject as fabric.IText).fontFamily || globalFontFamily
  }

  // Text formatting effective values
  let effectiveFontWeight = globalFontWeight
  let effectiveFontStyle = globalFontStyle
  let effectiveUnderline = globalUnderline
  let effectiveTextAlign = globalTextAlign
  let effectiveLineHeight = globalLineHeight
  let effectiveCharSpacing = globalCharSpacing
  let effectiveShadow = globalShadow
  let effectiveBackgroundColor = globalBackgroundColor

  if (activeObject && activeObject.type === 'i-text') {
    const textObject = activeObject as fabric.IText
    effectiveFontWeight = textObject.fontWeight as string || globalFontWeight
    effectiveFontStyle = textObject.fontStyle as string || globalFontStyle
    effectiveUnderline = textObject.underline || globalUnderline
    effectiveTextAlign = textObject.textAlign || globalTextAlign
    effectiveLineHeight = textObject.lineHeight || globalLineHeight
    effectiveCharSpacing = textObject.charSpacing || globalCharSpacing
    effectiveShadow = textObject.shadow || globalShadow
    effectiveBackgroundColor = textObject.backgroundColor as string || globalBackgroundColor
  }

  const handlePropertyChange = (properties: any) => {
    if (isObjectSelected && activeObject) {
      // Update the selected object directly
      activeObject.set(properties)
      activeDesign?.canvas?.requestRenderAll()
    } else if (isBaseLayerSelected) {
      activeDesign.updateBaseLayer(properties)
    }

    // Update global properties for future objects
    if (properties.fill) setFillColor(properties.fill)
    if (properties.stroke) setStrokeColor(properties.stroke)
    if (properties.strokeWidth !== undefined) setStrokeWidth(properties.strokeWidth)
    if (properties.opacity !== undefined) setOpacity(properties.opacity)
    if (properties.fontSize) setFontSize(properties.fontSize)
    if (properties.fontFamily) setFontFamily(properties.fontFamily)

    // Text formatting properties
    if (properties.fontWeight) setFontWeight(properties.fontWeight)
    if (properties.fontStyle) setFontStyle(properties.fontStyle)
    if (properties.underline !== undefined) setUnderline(properties.underline)
    if (properties.textAlign) setTextAlign(properties.textAlign)
    if (properties.lineHeight) setLineHeight(properties.lineHeight)
    if (properties.charSpacing !== undefined) setCharSpacing(properties.charSpacing)

    // Advanced styling properties
    if (properties.shadow !== undefined) setShadow(properties.shadow)
    if (properties.backgroundColor) setBackgroundColor(properties.backgroundColor)
  }

  // Show message if no active tab
  if (!activeDesign) {
    return (
      <Card className={cn('min-w-80 w-full', className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Properties
            {onCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCollapse}
                className="h-6 w-6 p-0 ml-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No canvas selected</p>
            <p className="text-sm">Create a new canvas to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('min-w-80 w-full border-none shadow-none h-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex flex-col">
            <span>Properties</span>
            <div className="text-xs text-gray-500 font-normal">
              Canvas: {activeDesign.name}
              {isObjectSelected && activeObject ? (
                <span className="ml-2 text-blue-600">
                  • {activeObject?.type || 'Object'} selected
                </span>
              ) : (
                <span className="ml-2 text-blue-600">• Canvas Properties</span>
              )}
            </div>
          </div>
          {onCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollapse}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-full overflow-y-auto">
        {/* Basic Properties Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Appearance</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Fill Color */}
            <div className="space-y-2">
              <Label htmlFor="fill-color" className="text-xs font-medium text-gray-600">Fill</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border-2 border-gray-200 cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
                  style={{ backgroundColor: effectiveFillColor }}
                  onClick={() => setShowFillPicker(!showFillPicker)}
                />
                <Input
                  id="fill-color"
                  value={effectiveFillColor}
                  onChange={(e) => handlePropertyChange({ fill: e.target.value })}
                  className="font-mono text-xs h-8"
                />
              </div>
              {showFillPicker && (
                <div className="absolute z-10 mt-2">
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowFillPicker(false)}
                  />
                  <HexColorPicker
                    color={effectiveFillColor}
                    onChange={(color) => handlePropertyChange({ fill: color })}
                  />
                </div>
              )}
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="opacity" className="text-xs font-medium text-gray-600">Opacity</Label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {Math.round(effectiveOpacity * 100)}%
                </span>
              </div>
              <Slider
                id="opacity"
                min={0}
                max={100}
                step={1}
                value={[effectiveOpacity * 100]}
                onValueChange={(val) => handlePropertyChange({ opacity: val[0] / 100 })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Typography Section */}
        {(selectedTool === 'text' || activeObject?.type === 'i-text') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Typography</h3>
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">Font Family</Label>
              <Select
                value={effectiveFontFamily}
                onValueChange={(value) => handlePropertyChange({ fontFamily: value })}
              >
                <SelectTrigger className='w-full h-9 text-sm'>
                  <SelectValue placeholder='Select a font' />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-size" className="text-xs font-medium text-gray-600">Font Size</Label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {effectiveFontSize}px
                </span>
              </div>
              <Slider
                id="font-size"
                min={8}
                max={200}
                step={1}
                value={[effectiveFontSize]}
                onValueChange={(val) => handlePropertyChange({ fontSize: val[0] })}
                className="w-full"
              />
            </div>

            {/* Text Style and Alignment */}
            <div className="grid grid-cols-2 gap-3">
              {/* Text Formatting */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">Style</Label>
                <div className="flex items-center space-x-1">
                  <Button
                    variant={effectiveFontWeight === 'bold' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePropertyChange({
                      fontWeight: effectiveFontWeight === 'bold' ? 'normal' : 'bold'
                    })}
                    className="p-2 flex-1 h-8"
                  >
                    <Bold className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={effectiveFontStyle === 'italic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePropertyChange({
                      fontStyle: effectiveFontStyle === 'italic' ? 'normal' : 'italic'
                    })}
                    className="p-2 flex-1 h-8"
                  >
                    <Italic className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={effectiveUnderline ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePropertyChange({ underline: !effectiveUnderline })}
                    className="p-2 flex-1 h-8"
                  >
                    <Underline className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Text Alignment */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">Alignment</Label>
                <div className="flex items-center space-x-1">
                  <Button
                    variant={effectiveTextAlign === 'left' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePropertyChange({ textAlign: 'left' })}
                    className="p-2 flex-1 h-8"
                  >
                    <AlignLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={effectiveTextAlign === 'center' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePropertyChange({ textAlign: 'center' })}
                    className="p-2 flex-1 h-8"
                  >
                    <AlignCenter className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={effectiveTextAlign === 'right' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePropertyChange({ textAlign: 'right' })}
                    className="p-2 flex-1 h-8"
                  >
                    <AlignRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Spacing */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Spacing</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-gray-600">Line Height</Label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {effectiveLineHeight.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={[effectiveLineHeight]}
                    onValueChange={(val) => handlePropertyChange({ lineHeight: val[0] })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-gray-600">Letter Spacing</Label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {effectiveCharSpacing}
                    </span>
                  </div>
                  <Slider
                    min={-50}
                    max={50}
                    step={1}
                    value={[effectiveCharSpacing]}
                    onValueChange={(val) => handlePropertyChange({ charSpacing: val[0] })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Effects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">Effects</h4>
              </div>

              <div className="space-y-3">
                {/* Shadow Effect */}
                <Card className="p-3 border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Shadow</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {effectiveShadow && (
                          <div className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                            Active
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            if (effectiveShadow) {
                              handlePropertyChange({ shadow: null })
                            } else {
                              const shadow = new fabric.Shadow({
                                color: '#000000',
                                blur: 10,
                                offsetX: 5,
                                offsetY: 5
                              })
                              handlePropertyChange({ shadow })
                            }
                          }}
                        >
                          {effectiveShadow ? <Eraser className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    {effectiveShadow && (
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        <div className="flex flex-col gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Blur</Label>
                            <Slider
                              min={0}
                              max={50}
                              step={1}
                              value={[effectiveShadow?.blur || 0]}
                              onValueChange={(val) => {
                                const shadow = new fabric.Shadow({
                                  color: effectiveShadow?.color || '#000000',
                                  blur: val[0],
                                  offsetX: effectiveShadow?.offsetX || 5,
                                  offsetY: effectiveShadow?.offsetY || 5
                                })
                                handlePropertyChange({ shadow })
                              }}
                              className="w-full"
                            />
                            <div className="text-xs text-center text-gray-500">{effectiveShadow?.blur || 0}px</div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-gray-500">Distance</Label>
                              <span className="text-xs text-gray-500">
                                {Math.round(Math.sqrt((effectiveShadow?.offsetX || 0) ** 2 + (effectiveShadow?.offsetY || 0) ** 2))}px
                              </span>
                            </div>
                            <Slider
                              min={0}
                              max={30}
                              step={1}
                              value={[Math.sqrt((effectiveShadow?.offsetX || 0) ** 2 + (effectiveShadow?.offsetY || 0) ** 2)]}
                              onValueChange={(val) => {
                                const currentDistance = Math.sqrt((effectiveShadow?.offsetX || 0) ** 2 + (effectiveShadow?.offsetY || 0) ** 2)

                                if (currentDistance === 0) {
                                  // If no current offset, default to bottom-right direction
                                  const shadow = new fabric.Shadow({
                                    color: effectiveShadow?.color || '#000000',
                                    blur: effectiveShadow?.blur || 10,
                                    offsetX: val[0] * 0.7, // 45 degree angle
                                    offsetY: val[0] * 0.7
                                  })
                                  handlePropertyChange({ shadow })
                                } else {
                                  // Maintain current angle, just change distance
                                  const angle = Math.atan2(effectiveShadow?.offsetY || 0, effectiveShadow?.offsetX || 0)
                                  const offsetX = Math.cos(angle) * val[0]
                                  const offsetY = Math.sin(angle) * val[0]

                                  const shadow = new fabric.Shadow({
                                    color: effectiveShadow?.color || '#000000',
                                    blur: effectiveShadow?.blur || 10,
                                    offsetX: Math.round(offsetX),
                                    offsetY: Math.round(offsetY)
                                  })
                                  handlePropertyChange({ shadow })
                                }
                              }}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Direction</Label>
                            <div className="flex items-center justify-center">
                              <div
                                className="relative w-16 h-16 rounded-full border-2 border-gray-200 bg-gray-50 cursor-pointer"
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect()
                                  const centerX = rect.left + rect.width / 2
                                  const centerY = rect.top + rect.height / 2
                                  const x = e.clientX - centerX
                                  const y = e.clientY - centerY

                                  // Calculate current distance to maintain it
                                  const currentDistance = Math.sqrt((effectiveShadow?.offsetX || 0) ** 2 + (effectiveShadow?.offsetY || 0) ** 2)

                                  // Calculate new angle but keep current distance
                                  const angle = Math.atan2(y, x)
                                  const offsetX = Math.cos(angle) * currentDistance
                                  const offsetY = Math.sin(angle) * currentDistance

                                  const shadow = new fabric.Shadow({
                                    color: effectiveShadow?.color || '#000000',
                                    blur: effectiveShadow?.blur || 10,
                                    offsetX: Math.round(offsetX),
                                    offsetY: Math.round(offsetY)
                                  })
                                  handlePropertyChange({ shadow })
                                }}
                                onMouseDown={(e) => {
                                  const circleElement = e.currentTarget
                                  const initialRect = circleElement.getBoundingClientRect()

                                  const handleMouseMove = (e: MouseEvent) => {
                                    // Use the captured rect since currentTarget will be document
                                    const rect = circleElement.getBoundingClientRect()

                                    const centerX = rect.left + rect.width / 2
                                    const centerY = rect.top + rect.height / 2
                                    const x = e.clientX - centerX
                                    const y = e.clientY - centerY

                                    // Calculate current distance to maintain it
                                    const currentDistance = Math.sqrt((effectiveShadow?.offsetX || 0) ** 2 + (effectiveShadow?.offsetY || 0) ** 2)

                                    // Calculate new angle but keep current distance
                                    const angle = Math.atan2(y, x)
                                    const offsetX = Math.cos(angle) * currentDistance
                                    const offsetY = Math.sin(angle) * currentDistance

                                    const shadow = new fabric.Shadow({
                                      color: effectiveShadow?.color || '#000000',
                                      blur: effectiveShadow?.blur || 10,
                                      offsetX: Math.round(offsetX),
                                      offsetY: Math.round(offsetY)
                                    })
                                    handlePropertyChange({ shadow })
                                  }

                                  const handleMouseUp = () => {
                                    document.removeEventListener('mousemove', handleMouseMove)
                                    document.removeEventListener('mouseup', handleMouseUp)
                                  }

                                  document.addEventListener('mousemove', handleMouseMove)
                                  document.addEventListener('mouseup', handleMouseUp)
                                }}
                                data-shadow-circle
                              >
                                {/* Center dot */}
                                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />

                                {/* Shadow position indicator */}
                                <div
                                  className="absolute w-2 h-2 bg-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-sm"
                                  style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: (() => {
                                      const currentDistance = Math.sqrt((effectiveShadow?.offsetX || 0) ** 2 + (effectiveShadow?.offsetY || 0) ** 2)
                                      const angle = Math.atan2(effectiveShadow?.offsetY || 0, effectiveShadow?.offsetX || 0)
                                      const displayDistance = Math.min(currentDistance / 30 * 24, 24) // Scale for display in circle
                                      const displayX = Math.cos(angle) * displayDistance
                                      const displayY = Math.sin(angle) * displayDistance
                                      return `translate(-50%, -50%) translate(${displayX}px, ${displayY}px)`
                                    })()
                                  }}
                                />

                                {/* Subtle grid lines for reference */}
                                <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 opacity-30" />
                                <div className="absolute left-1/2 top-0 h-full w-px bg-gray-300 opacity-30" />
                              </div>
                            </div>
                            <div className="text-xs text-center text-gray-400">
                              {Math.round(effectiveShadow?.offsetX || 0)}, {Math.round(effectiveShadow?.offsetY || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Stroke Effect */}
                <Card className="p-3 border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Stroke</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {effectiveStrokeWidth > 0 && (
                          <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {effectiveStrokeWidth}px
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            if (effectiveStrokeWidth > 0) {
                              handlePropertyChange({ strokeWidth: 0, stroke: 'transparent' })
                            } else {
                              handlePropertyChange({ strokeWidth: 2, stroke: '#000000' })
                            }
                          }}
                        >
                          {effectiveStrokeWidth > 0 ? <Eraser className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    {effectiveStrokeWidth > 0 && (
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border cursor-pointer"
                              style={{ backgroundColor: effectiveStrokeColor !== 'transparent' ? effectiveStrokeColor : '#000000' }}
                              onClick={() => setShowStrokePicker(!showStrokePicker)}
                            />
                            <Input
                              value={effectiveStrokeColor}
                              onChange={(e) => handlePropertyChange({ stroke: e.target.value })}
                              className="text-xs h-8"
                              placeholder="Color"
                            />
                          </div>
                          {showStrokePicker && (
                            <div className="absolute z-10 mt-2">
                              <div
                                className="fixed inset-0"
                                onClick={() => setShowStrokePicker(false)}
                              />
                              <HexColorPicker
                                color={effectiveStrokeColor !== 'transparent' ? effectiveStrokeColor : '#000000'}
                                onChange={(color) => handlePropertyChange({ stroke: color })}
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-gray-500">Width</Label>
                            <span className="text-xs text-gray-500">{effectiveStrokeWidth}px</span>
                          </div>
                          <Slider
                            min={0}
                            max={20}
                            step={1}
                            value={[effectiveStrokeWidth]}
                            onValueChange={(val) => handlePropertyChange({ strokeWidth: val[0] })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Glow Effect */}
                <Card className="p-3 border border-gray-200 hover:border-gray-300 transition-colors opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">Glow</span>
                    </div>
                    <div className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                      Coming Soon
                    </div>
                  </div>
                </Card>

                {/* Curve Effect */}
                <Card className="p-3 border border-gray-200 hover:border-gray-300 transition-colors opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">Curve</span>
                    </div>
                    <div className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                      Coming Soon
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Transform Section - Only show when object is selected */}
        {isObjectSelected && activeObject && (
          <div className="space-y-4">
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Transform</h3>
            </div>

            <div className="space-y-4">
              {/* Position */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Position</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="pos-x" className="text-xs font-medium text-gray-600">X</Label>
                    <Input
                      id="pos-x"
                      type="number"
                      value={Math.round(activeObject.left || 0)}
                      onChange={(e) => handlePropertyChange({ left: parseInt(e.target.value) || 0 })}
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pos-y" className="text-xs font-medium text-gray-600">Y</Label>
                    <Input
                      id="pos-y"
                      type="number"
                      value={Math.round(activeObject.top || 0)}
                      onChange={(e) => handlePropertyChange({ top: parseInt(e.target.value) || 0 })}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Size</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="width" className="text-xs font-medium text-gray-600">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={Math.round((activeObject.width || 0) * (activeObject.scaleX || 1))}
                      onChange={(e) => {
                        const newWidth = parseInt(e.target.value) || 1
                        handlePropertyChange({
                          width: newWidth,
                          scaleX: 1
                        })
                      }}
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-xs font-medium text-gray-600">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={Math.round((activeObject.height || 0) * (activeObject.scaleY || 1))}
                      onChange={(e) => {
                        const newHeight = parseInt(e.target.value) || 1
                        handlePropertyChange({
                          height: newHeight,
                          scaleY: 1
                        })
                      }}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {isBaseLayerSelected && (
          <div className="space-y-4">
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Canvas Settings</h3>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Dimensions</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="base-width" className="text-xs font-medium text-gray-600">Width</Label>
                  <Input
                    id="base-width"
                    type="number"
                    value={Math.round(activeDesign.baseLayerConfig.width || 0)}
                    onChange={(e) => handlePropertyChange({ width: parseInt(e.target.value) || 1 })}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base-height" className="text-xs font-medium text-gray-600">Height</Label>
                  <Input
                    id="base-height"
                    type="number"
                    value={Math.round(activeDesign.baseLayerConfig.height || 0)}
                    onChange={(e) => handlePropertyChange({ height: parseInt(e.target.value) || 1 })}
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Filters Section */}
        {(selectedTool === 'image' || activeObject?.type === 'image') && (
          <div className="space-y-4">
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Image Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
                className="h-6 text-xs"
                disabled={!activeObject || activeObject.type !== 'image'}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>

            {/* Filter Presets */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Presets</h4>
              <div className="grid grid-cols-2 gap-2">
                {filterPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPresetFilter(preset)}
                    disabled={!activeObject || activeObject.type !== 'image'}
                    className="h-8 text-xs"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Individual Filter Controls */}
            <div className="space-y-4">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Adjustments</h4>

              {/* Brightness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-gray-600">Brightness</Label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {Math.round(imageFilters.brightness * 100)}
                  </span>
                </div>
                <Slider
                  min={-100}
                  max={100}
                  step={1}
                  value={[imageFilters.brightness * 100]}
                  onValueChange={(val) => applyIndividualFilter('brightness', val[0] / 100)}
                  disabled={!activeObject || activeObject.type !== 'image'}
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-gray-600">Contrast</Label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {Math.round(imageFilters.contrast * 100)}
                  </span>
                </div>
                <Slider
                  min={-100}
                  max={100}
                  step={1}
                  value={[imageFilters.contrast * 100]}
                  onValueChange={(val) => applyIndividualFilter('contrast', val[0] / 100)}
                  disabled={!activeObject || activeObject.type !== 'image'}
                  className="w-full"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-gray-600">Saturation</Label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {Math.round(imageFilters.saturation * 100)}
                  </span>
                </div>
                <Slider
                  min={-100}
                  max={100}
                  step={1}
                  value={[imageFilters.saturation * 100]}
                  onValueChange={(val) => applyIndividualFilter('saturation', val[0] / 100)}
                  disabled={!activeObject || activeObject.type !== 'image'}
                  className="w-full"
                />
              </div>

              {/* Hue */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-gray-600">Hue</Label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {Math.round(imageFilters.hue * 360)}°
                  </span>
                </div>
                <Slider
                  min={-180}
                  max={180}
                  step={1}
                  value={[imageFilters.hue * 360]}
                  onValueChange={(val) => applyIndividualFilter('hue', val[0] / 360)}
                  disabled={!activeObject || activeObject.type !== 'image'}
                  className="w-full"
                />
              </div>

              {/* Blur */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-gray-600">Blur</Label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {Math.round(imageFilters.blur * 100)}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[imageFilters.blur * 100]}
                  onValueChange={(val) => applyIndividualFilter('blur', val[0] / 100)}
                  disabled={!activeObject || activeObject.type !== 'image'}
                  className="w-full"
                />
              </div>

              {/* Noise */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-gray-600">Noise</Label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {Math.round(imageFilters.noise * 1000)}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={[imageFilters.noise * 1000]}
                  onValueChange={(val) => applyIndividualFilter('noise', val[0] / 1000)}
                  disabled={!activeObject || activeObject.type !== 'image'}
                  className="w-full"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyPresetFilter({ name: 'Grayscale', filters: [{ type: 'Grayscale' }] })}
                  disabled={!activeObject || activeObject.type !== 'image'}
                  className="h-8 text-xs"
                >
                  <Palette className="h-3 w-3 mr-1" />
                  Grayscale
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyPresetFilter({ name: 'Invert', filters: [{ type: 'Invert' }] })}
                  disabled={!activeObject || activeObject.type !== 'image'}
                  className="h-8 text-xs"
                >
                  Invert
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 