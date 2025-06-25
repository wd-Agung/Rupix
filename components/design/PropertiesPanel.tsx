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
import { ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'

interface PropertiesPanelProps {
  className?: string
  onCollapse?: () => void
}

const fontFamilies = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Impact', 'Comic Sans MS'
]

export function PropertiesPanel({ className, onCollapse }: PropertiesPanelProps) {
  const {
    fillColor: globalFillColor,
    strokeColor: globalStrokeColor,
    strokeWidth: globalStrokeWidth,
    fontSize: globalFontSize,
    fontFamily: globalFontFamily,
    opacity: globalOpacity,
    setFillColor,
    setStrokeColor,
    setStrokeWidth,
    setFontSize,
    setFontFamily,
    setOpacity,
    selectedTool,
  } = useDesignStore()

  const activeDesign = useActiveDesign()
  const [showFillPicker, setShowFillPicker] = useState(false)
  const [showStrokePicker, setShowStrokePicker] = useState(false)

  const selectedLayer = useMemo(() => {
    return activeDesign?.layers.find(layer => layer.id === activeDesign.selectedLayerId)
  }, [activeDesign])

  const activeObject = selectedLayer?.object as fabric.IText | fabric.Rect | fabric.Circle

  const isObjectSelected = !!activeObject
  const effectiveFillColor = (activeObject?.fill as string) || globalFillColor
  const effectiveStrokeColor = (activeObject?.stroke as string) || globalStrokeColor
  const effectiveStrokeWidth = activeObject?.strokeWidth ?? globalStrokeWidth
  const effectiveOpacity = activeObject?.opacity ?? globalOpacity

  let effectiveFontSize = globalFontSize
  let effectiveFontFamily = globalFontFamily
  if (activeObject && activeObject.type === 'i-text') {
    effectiveFontSize = (activeObject as fabric.IText).fontSize
    effectiveFontFamily = (activeObject as fabric.IText).fontFamily
  }

  const handlePropertyChange = (properties: any) => {
    if (isObjectSelected) {
      activeDesign?.updateSelectedLayerObject(properties)
    } else {
      if (properties.fill) setFillColor(properties.fill)
      if (properties.stroke) setStrokeColor(properties.stroke)
      if (properties.strokeWidth !== undefined) setStrokeWidth(properties.strokeWidth)
      if (properties.opacity !== undefined) setOpacity(properties.opacity)
      if (properties.fontSize) setFontSize(properties.fontSize)
      if (properties.fontFamily) setFontFamily(properties.fontFamily)
    }
  }

  // Show message if no active tab
  if (!activeDesign) {
    return (
      <Card className={cn('w-80', className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            {onCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCollapse}
                className="h-6 w-6 p-0 mr-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            Properties
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
    <Card className={cn('w-80 border-none shadow-none', className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          {onCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollapse}
              className="h-6 w-6 p-0 mr-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <div className="flex flex-col">
            <span>Properties</span>
            <div className="text-xs text-gray-500 font-normal">
              Canvas: {activeDesign.name}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fill Color */}
        <div className="space-y-2">
          <Label htmlFor="fill-color">Fill Color</Label>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
              style={{ backgroundColor: effectiveFillColor }}
              onClick={() => setShowFillPicker(!showFillPicker)}
            />
            <Input
              id="fill-color"
              value={effectiveFillColor}
              onChange={(e) => handlePropertyChange({ fill: e.target.value })}
              className="font-mono text-sm"
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

        <Separator />

        {/* Stroke Color */}
        <div className="space-y-2">
          <Label htmlFor="stroke-color">Stroke Color</Label>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
              style={{ backgroundColor: effectiveStrokeColor }}
              onClick={() => setShowStrokePicker(!showStrokePicker)}
            />
            <Input
              id="stroke-color"
              value={effectiveStrokeColor}
              onChange={(e) => handlePropertyChange({ stroke: e.target.value })}
              className="font-mono text-sm"
            />
          </div>
          {showStrokePicker && (
            <div className="absolute z-10 mt-2">
              <div
                className="fixed inset-0"
                onClick={() => setShowStrokePicker(false)}
              />
              <HexColorPicker
                color={effectiveStrokeColor}
                onChange={(color) => handlePropertyChange({ stroke: color })}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Stroke Width */}
        <div className="space-y-2">
          <Label htmlFor="stroke-width">Stroke Width: {effectiveStrokeWidth}px</Label>
          <Slider
            id="stroke-width"
            min={0}
            max={20}
            step={1}
            value={[effectiveStrokeWidth]}
            onValueChange={(val) => handlePropertyChange({ strokeWidth: val[0] })}
          />
        </div>

        <Separator />

        {/* Opacity */}
        <div className="space-y-2">
          <Label htmlFor="opacity">Opacity: {Math.round(effectiveOpacity * 100)}%</Label>
          <Slider
            id="opacity"
            min={0}
            max={100}
            step={1}
            value={[effectiveOpacity * 100]}
            onValueChange={(val) => handlePropertyChange({ opacity: val[0] / 100 })}
          />
        </div>

        {/* Text Properties */}
        {(selectedTool === 'text' || activeObject?.type === 'i-text') && (
          <>
            <Separator />

            {/* Font Size */}
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size: {effectiveFontSize}px</Label>
              <Slider
                id="font-size"
                min={8}
                max={200}
                step={1}
                value={[effectiveFontSize]}
                onValueChange={(val) => handlePropertyChange({ fontSize: val[0] })}
              />
            </div>

            <Separator />

            {/* Font Family */}
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Select
                value={effectiveFontFamily}
                onValueChange={(value) => handlePropertyChange({ fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
          </>
        )}

        {/* Object Position and Size - Only show when object is selected */}
        {isObjectSelected && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Transform</h3>

              {/* Position */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="pos-x" className="text-xs">X Position</Label>
                  <Input
                    id="pos-x"
                    type="number"
                    value={Math.round(activeObject.left || 0)}
                    onChange={(e) => handlePropertyChange({ left: parseInt(e.target.value) || 0 })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pos-y" className="text-xs">Y Position</Label>
                  <Input
                    id="pos-y"
                    type="number"
                    value={Math.round(activeObject.top || 0)}
                    onChange={(e) => handlePropertyChange({ top: parseInt(e.target.value) || 0 })}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Size */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="width" className="text-xs">Width</Label>
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
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="height" className="text-xs">Height</Label>
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
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 