'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDesignStore } from '@/lib/stores/design-store'
import { cn } from '@/lib/utils'
import {
  Edit,
  FileText,
  MoreHorizontal,
  Plus,
  X
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface CanvasTabsProps {
  children: React.ReactNode
  className?: string
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
  const initializedRef = useRef(false)

  const handleCreateTab = () => {
    const tabId = createNewDesign(createTabName || undefined)
    setCreateTabName('')
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
      <Tabs value={activeDesignId || ''} onValueChange={setActiveDesign} className="flex-1 flex flex-col h-full">
        {/* Tab Bar */}
        <div className="flex items-center justify-between border-b bg-white px-4 py-2">
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            <TabsList className="h-auto p-1 bg-transparent">
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
                        <span className="max-w-20 truncate">{tab.name}</span>

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

                  {/* Tab Context Menu */}
                  {activeDesignId === tab.id && (
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="h-6 w-6 p-0 rounded hover:bg-gray-100 flex items-center justify-center cursor-pointer">
                            <MoreHorizontal className="h-3 w-3" />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="w-80">
                          <DialogHeader>
                            <DialogTitle>Canvas Actions</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsRenaming(tab.id)
                                setNewTabName(tab.name)
                              }}
                              className="w-full justify-start"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Canvas</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
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