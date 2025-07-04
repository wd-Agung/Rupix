'use client'

import { Button } from '@/src/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { useDesignStore } from '@/src/lib/stores/design-store'
import { cn } from '@/src/lib/utils'
import {
  FileText,
  Plus,
  X
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface CanvasTabsProps {
  children: React.ReactNode
  className?: string
}

// Popular canvas size presets
const CANVAS_PRESETS = {
  'Social Media': [
    { name: 'Instagram Post (Square)', width: 1080, height: 1080 },
    { name: 'Instagram Post (Portrait)', width: 1080, height: 1350 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Facebook Post', width: 1200, height: 630 },
    { name: 'Facebook Cover', width: 851, height: 315 },
    { name: 'Facebook Story', width: 1080, height: 1920 },
    { name: 'Twitter/X Post', width: 1600, height: 900 },
    { name: 'Twitter/X Header', width: 1500, height: 500 },
    { name: 'LinkedIn Post', width: 1200, height: 628 },
    { name: 'LinkedIn Cover', width: 1584, height: 396 },
    { name: 'YouTube Thumbnail', width: 1280, height: 720 },
    { name: 'YouTube Banner', width: 2560, height: 1440 },
    { name: 'Pinterest Pin', width: 1000, height: 1500 },
    { name: 'TikTok Video', width: 1080, height: 1920 },
  ],
  'Marketplace': [
    { name: 'Etsy Listing', width: 2000, height: 2000 },
    { name: 'Amazon Product', width: 2000, height: 2000 },
    { name: 'eBay Listing', width: 1600, height: 1600 },
  ],
  'Standard Sizes': [
    { name: 'A4 (300 DPI)', width: 2480, height: 3508 },
    { name: 'A3 (300 DPI)', width: 3508, height: 4961 },
    { name: 'US Letter (300 DPI)', width: 2550, height: 3300 },
    { name: 'Square Medium', width: 1200, height: 1200 },
    { name: 'Square Large', width: 2000, height: 2000 },
  ],
}

export function CanvasTabs({ children, className }: CanvasTabsProps) {
  const {
    designs,
    activeDesignId,
    createNewDesign,
    closeDesign,
    setActiveDesign,
    renameDesign,
  } = useDesignStore()

  const [isRenaming, setIsRenaming] = useState<string | null>(null)
  const [newTabName, setNewTabName] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createTabName, setCreateTabName] = useState('')
  const [sizeOption, setSizeOption] = useState<'preset' | 'custom'>('preset')
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [customWidth, setCustomWidth] = useState<string>('800')
  const [customHeight, setCustomHeight] = useState<string>('600')
  const initializedRef = useRef(false)

  const handleCreateTab = () => {
    let canvasWidth = 800
    let canvasHeight = 600

    if (sizeOption === 'preset' && selectedPreset) {
      // Find the selected preset
      for (const category of Object.values(CANVAS_PRESETS)) {
        const preset = category.find(p => `${p.name}` === selectedPreset)
        if (preset) {
          canvasWidth = preset.width
          canvasHeight = preset.height
          break
        }
      }
    } else if (sizeOption === 'custom') {
      canvasWidth = parseInt(customWidth) || 800
      canvasHeight = parseInt(customHeight) || 600
    }

    const tabId = createNewDesign(createTabName || undefined, {
      width: canvasWidth,
      height: canvasHeight
    })

    // Reset form
    setCreateTabName('')
    setSelectedPreset('')
    setCustomWidth('800')
    setCustomHeight('600')
    setSizeOption('preset')
    setIsCreateDialogOpen(false)
    return tabId
  }

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (designs.length > 1) {
      closeDesign(tabId)
    }
  }

  const handleRenameTab = (tabId: string) => {
    if (newTabName.trim()) {
      renameDesign(tabId, newTabName.trim())
    }
    setIsRenaming(null)
    setNewTabName('')
  }

  // Create first tab on mount if none exist
  useEffect(() => {
    if (!initializedRef.current && designs.length === 0) {
      initializedRef.current = true
      createNewDesign()
    }
  }, [designs.length, createNewDesign])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <Tabs value={activeDesignId || ''} onValueChange={setActiveDesign} className="gap-0 flex-1 flex flex-col h-full">
        {/* Tab Bar */}
        <div className="flex items-center justify-between border-b bg-white px-4 py-2">
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            <TabsList className="h-auto p-1 bg-transparent gap-2">
              {designs.map((tab) => (
                <div key={`tab-trigger-${tab.id}`} className="relative group">
                  <TabsTrigger
                    value={tab.id}
                    className={cn(
                      'relative flex items-center gap-2 px-3 py-2 text-sm rounded-md',
                      'data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900',
                      'hover:bg-gray-100 transition-colors'
                    )}
                  >
                    {isRenaming === tab.id ? (
                      <Input
                        value={newTabName}
                        onChange={(e) => setNewTabName(e.target.value)}
                        onBlur={() => handleRenameTab(tab.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameTab(tab.id)
                          if (e.key === 'Escape') {
                            setIsRenaming(null)
                            setNewTabName('')
                          }
                        }}
                        className="h-6 w-20 text-xs"
                        autoFocus
                      />
                    ) : (
                      <>
                        <FileText className="h-3 w-3" />
                        <span
                          className="max-w-20 truncate cursor-pointer hover:text-blue-600 transition-colors"
                          onDoubleClick={(e) => {
                            e.stopPropagation()
                            setIsRenaming(tab.id)
                            setNewTabName(tab.name)
                          }}
                        >
                          {tab.name}
                        </span>

                        {designs.length > 1 && (
                          <span
                            onClick={(e) => handleCloseTab(tab.id, e)}
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 rounded flex items-center justify-center cursor-pointer transition-all"
                          >
                            <X className="h-3 w-3" />
                          </span>
                        )}
                      </>
                    )}
                  </TabsTrigger>
                </div>
              ))}
            </TabsList>
          </div>

          {/* Add New Tab Button */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2 shrink-0">
                <Plus className="h-4 w-4 mr-1" />
                New Canvas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Canvas</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="canvas-name">Canvas Name (optional)</Label>
                  <Input
                    id="canvas-name"
                    value={createTabName}
                    onChange={(e) => setCreateTabName(e.target.value)}
                    placeholder={`Canvas ${designs.length + 1}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateTab()
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Canvas Size</Label>
                  <Tabs value={sizeOption} onValueChange={(value) => setSizeOption(value as 'preset' | 'custom')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="preset">Popular Presets</TabsTrigger>
                      <TabsTrigger value="custom">Custom Size</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preset" className="space-y-4">
                      <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {Object.entries(CANVAS_PRESETS).map(([category, presets]) => (
                          <div key={category} className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">{category}</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {presets.map((preset) => (
                                <Button
                                  key={preset.name}
                                  variant={selectedPreset === preset.name ? "default" : "outline"}
                                  size="sm"
                                  className="justify-start h-auto py-2 px-3"
                                  onClick={() => setSelectedPreset(preset.name)}
                                >
                                  <div className="text-left">
                                    <div className="font-medium text-xs">{preset.name}</div>
                                    <div className="text-xs text-gray-500">{preset.width} × {preset.height}</div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="width">Width (pixels)</Label>
                          <Input
                            id="width"
                            type="number"
                            value={customWidth}
                            onChange={(e) => setCustomWidth(e.target.value)}
                            placeholder="800"
                            min="1"
                            max="10000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height (pixels)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={customHeight}
                            onChange={(e) => setCustomHeight(e.target.value)}
                            placeholder="600"
                            min="1"
                            max="10000"
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Preview: {customWidth} × {customHeight} pixels
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTab}>
                    Create Canvas
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {designs.map((tab) => (
            <TabsContent
              key={`tab-content-${tab.id}`}
              value={tab.id}
              className="h-full m-0 data-[state=active]:block data-[state=inactive]:hidden"
            >
              {children}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
} 