'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useDesignStore, type ToolType } from '@/lib/stores/design-store'
import { cn } from '@/lib/utils'
import {
  Circle,
  Copy,
  Download,
  Focus,
  Image,
  MousePointer,
  Redo,
  Square,
  Trash2,
  Type,
  Undo
} from 'lucide-react'

interface ToolbarProps {
  className?: string
}

const tools = [
  { id: 'select' as ToolType, icon: MousePointer, label: 'Select' },
  { id: 'rectangle' as ToolType, icon: Square, label: 'Rectangle' },
  { id: 'circle' as ToolType, icon: Circle, label: 'Circle' },
  { id: 'text' as ToolType, icon: Type, label: 'Text' },
  { id: 'image' as ToolType, icon: Image, label: 'Image' },
]

export function Toolbar({ className }: ToolbarProps) {
  const {
    selectedTool,
    setSelectedTool,
    getActiveDesign,
    cameraLocked,
    setCameraLocked,
    duplicateActiveObject,
  } = useDesignStore()

  const activeDesign = getActiveDesign()
  const activeTab = activeDesign // alias for compatibility

  const handleToolSelect = (tool: ToolType) => {
    setSelectedTool(tool)
    // Also update the active design's selected tool for cursor management
    if (activeDesign) {
      activeDesign.setSelectedTool(tool)
    }
  }

  const handleClearCanvas = () => {
    if (!activeDesign) return
    if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      activeDesign.clear()
    }
  }

  const handleExport = (format: 'png' | 'jpg' | 'svg' | 'json') => {
    if (!activeDesign) return

    const data = activeDesign.exportCanvas(format)
    if (typeof data === 'string' && format !== 'json') {
      // Download image
      const link = document.createElement('a')
      link.download = `${activeDesign.name}.${format}`
      link.href = data
      link.click()
    } else if (format === 'json') {
      // Download JSON
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `${activeDesign.name}.json`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    }
  }



  const handleCameraLockToggle = () => {
    const newLockState = !cameraLocked
    setCameraLocked(newLockState)

    // Also update the active design's camera lock state
    if (activeDesign) {
      activeDesign.setCameraLocked(newLockState)
    }
  }

  const handleDuplicate = async () => {
    await duplicateActiveObject()
  }

  const isDisabled = !activeTab
  const hasActiveObject = activeDesign?.canvas?.getActiveObject() && !(activeDesign.canvas.getActiveObject() as any)?.isBaseLayer

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2 p-3 bg-white border border-gray-200', className)}>
        {/* Selection Tools */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedTool === tool.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleToolSelect(tool.id)}
                  className="relative"
                  disabled={isDisabled}
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {tool.label}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Action Tools */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" disabled>
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" disabled>
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDuplicate}
                disabled={isDisabled || !hasActiveObject}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Duplicate (Ctrl+D)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* File Operations */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCanvas}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isDisabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear Canvas</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Export options */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isDisabled}>
              <Download className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit p-2">
            <div className="grid gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleExport('png')}
              >
                PNG
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleExport('jpg')}
              >
                JPG
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6" />

        {/* Camera Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={cameraLocked ? 'default' : 'ghost'}
                size="sm"
                onClick={handleCameraLockToggle}
                disabled={isDisabled}
              >
                <Focus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{cameraLocked ? 'Unlock Camera' : 'Lock Camera to Center'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

      </div>
    </TooltipProvider>
  )
} 