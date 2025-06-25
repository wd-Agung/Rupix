'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useActiveDesign } from '@/lib/hooks/useActiveDesign'
import { cn } from '@/lib/utils'
import { ChevronLeft, Circle, Eye, EyeOff, Image, Lock, Square, Trash2, Type, Unlock } from 'lucide-react'

interface LayersPanelProps {
  className?: string
  onCollapse?: () => void
}

const getLayerIcon = (objectType: string) => {
  switch (objectType) {
    case 'rect':
      return Square
    case 'circle':
      return Circle
    case 'i-text':
      return Type
    case 'image':
      return Image
    default:
      return Square
  }
}

export function LayersPanel({ className, onCollapse }: LayersPanelProps) {
  const activeDesign = useActiveDesign()
  const layers = activeDesign?.layers || []
  const selectedLayerId = activeDesign?.selectedLayerId

  const handleLayerSelect = (layerId: string) => {
    activeDesign?.setSelectedLayer(layerId)
  }

  const handleToggleVisibility = (layerId: string) => {
    activeDesign?.toggleLayerVisibility(layerId)
  }

  const handleToggleLock = (layerId: string) => {
    activeDesign?.toggleLayerLock(layerId)
  }

  const handleDeleteLayer = (layerId: string) => {
    if (confirm('Are you sure you want to delete this layer?')) {
      activeDesign?.removeLayer(layerId)
    }
  }

  const handleLayerNameChange = (layerId: string, newName: string) => {
    activeDesign?.updateLayer(layerId, { name: newName })
  }

  // Show message if no active tab
  if (!activeDesign) {
    return (
      <Card className={cn('w-80', className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Layers
            {onCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCollapse}
                className="h-6 w-6 p-0 ml-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-center py-8 text-gray-500">
            <Square className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No canvas selected</p>
            <p className="text-sm">Create a new canvas to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-80 shadow-none border-none', className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex flex-col">
            <span>Layers</span>
            <div className="text-xs text-gray-500 font-normal">
              Canvas: {activeDesign.name}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-gray-500">
              {layers.length} {layers.length === 1 ? 'layer' : 'layers'}
            </span>
            {onCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCollapse}
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {layers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Square className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No layers yet</p>
            <p className="text-sm">Add shapes, text, or images to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {layers.slice().reverse().map((layer, index) => {
              const LayerIcon = getLayerIcon(layer.object.type || 'rect')
              const isSelected = layer.id === selectedLayerId

              return (
                <div
                  key={layer.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-md border transition-colors',
                    isSelected
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  )}
                >
                  {/* Layer Icon */}
                  <LayerIcon className="h-4 w-4 text-gray-600" />

                  {/* Layer Name */}
                  <input
                    type="text"
                    value={layer.name}
                    onChange={(e) => handleLayerNameChange(layer.id, e.target.value)}
                    onClick={() => handleLayerSelect(layer.id)}
                    className={cn(
                      'flex-1 text-sm bg-transparent border-none outline-none',
                      isSelected ? 'font-medium' : 'font-normal'
                    )}
                  />

                  {/* Layer Controls */}
                  <div className="flex items-center gap-1">
                    {/* Visibility Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(layer.id)}
                      className="h-6 w-6 p-0"
                    >
                      {layer.visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>

                    {/* Lock Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleLock(layer.id)}
                      className="h-6 w-6 p-0"
                    >
                      {layer.locked ? (
                        <Lock className="h-3 w-3 text-orange-500" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLayer(layer.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {layers.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3" />
                <span>Click to toggle visibility</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-3 w-3" />
                <span>Click to lock/unlock</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="h-3 w-3" />
                <span>Click to delete layer</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 