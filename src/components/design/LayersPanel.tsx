'use client'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Separator } from '@/src/components/ui/separator'
import { useActiveDesign } from '@/src/lib/hooks/useActiveDesign'
import { cn } from '@/src/lib/utils'
import { ChevronLeft, Circle, Eye, EyeOff, GripVertical, Image, Lock, Square, Trash2, Type, Unlock } from 'lucide-react'
import { useState } from 'react'

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

  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    setDraggedLayerId(layerId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', layerId)
  }

  const handleDragEnd = () => {
    setDraggedLayerId(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const draggedId = e.dataTransfer.getData('text/plain')

    if (draggedId && draggedId !== draggedLayerId) return

    if (draggedLayerId && activeDesign) {
      const draggedIndex = layers.findIndex(layer => layer.id === draggedLayerId)
      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        activeDesign.reorderLayer(draggedLayerId, targetIndex)
      }
    }

    setDraggedLayerId(null)
    setDragOverIndex(null)
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
            {layers.slice().reverse().map((layer, reverseIndex) => {
              const index = layers.length - 1 - reverseIndex
              const LayerIcon = getLayerIcon(layer.object.type || 'rect')
              const isSelected = layer.id === selectedLayerId
              const isDragging = draggedLayerId === layer.id
              const isDropTarget = dragOverIndex === index

              return (
                <div key={layer.id} className="relative">
                  {/* Drop indicator */}
                  {isDropTarget && (
                    <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10" />
                  )}

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, layer.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-md border transition-all cursor-move min-w-0',
                      isSelected
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100',
                      isDragging && 'opacity-50 scale-95',
                      isDropTarget && 'bg-blue-25 border-blue-300'
                    )}
                  >
                    {/* Drag Handle */}
                    <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />

                    {/* Layer Icon */}
                    <LayerIcon className="h-4 w-4 text-gray-600 flex-shrink-0" />

                    {/* Layer Name */}
                    <input
                      type="text"
                      value={layer.name}
                      onChange={(e) => handleLayerNameChange(layer.id, e.target.value)}
                      onClick={() => handleLayerSelect(layer.id)}
                      onMouseDown={(e) => e.stopPropagation()} // Prevent drag when editing name
                      className={cn(
                        'flex-1 text-sm bg-transparent border-none outline-none min-w-0',
                        isSelected ? 'font-medium' : 'font-normal'
                      )}
                    />

                    {/* Layer Controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Visibility Toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleVisibility(layer.id)
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleLock(layer.id)
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteLayer(layer.id)
                        }}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
                <GripVertical className="h-3 w-3" />
                <span>Drag to reorder layers</span>
              </div>
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