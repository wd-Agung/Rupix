'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useDesignStore, type ToolType } from '@/lib/stores/design-store'
import { cn } from '@/lib/utils'
import {
  Circle,
  Copy,
  Download,
  Image,
  MousePointer,
  Pen,
  Redo,
  Square,
  Trash2,
  Type,
  Undo,
  Upload
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
  { id: 'pen' as ToolType, icon: Pen, label: 'Pen' },
]

export function Toolbar({ className }: ToolbarProps) {
  const {
    selectedTool,
    setSelectedTool,
    getActiveDesign,
  } = useDesignStore()

  const activeDesign = getActiveDesign()
  const activeTab = activeDesign // alias for compatibility

  const handleToolSelect = (tool: ToolType) => {
    setSelectedTool(tool)
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

  const handleImageUpload = () => {
    // TODO: Implement image upload using DesignManager
    console.log('Image upload clicked')
  }

  const isDisabled = !activeTab

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
              <Button variant="ghost" size="sm" disabled>
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
              <Button variant="ghost" size="sm" onClick={handleImageUpload} disabled={isDisabled}>
                <Upload className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload Image</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleExport('png')} disabled={isDisabled}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export as PNG</p>
            </TooltipContent>
          </Tooltip>

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

      </div>
    </TooltipProvider>
  )
} 