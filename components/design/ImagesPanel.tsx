'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Filter, Folder, FolderPlus, Image, MoreHorizontal, Search, Upload, Wand2 } from 'lucide-react'
import { useState } from 'react'

interface ImagesPanelProps {
  onCollapse?: () => void
  className?: string
}

// Mock data for demonstration
const mockFolders = [
  { id: '1', name: 'Product Photos', imageCount: 24 },
  { id: '2', name: 'Backgrounds', imageCount: 12 },
  { id: '3', name: 'Icons', imageCount: 56 }
]

const mockImages = [
  { id: '1', name: 'product-1.jpg', url: '/placeholder-image.jpg', folder: 'Product Photos', size: '1.2MB' },
  { id: '2', name: 'bg-abstract.png', url: '/placeholder-image.jpg', folder: 'Backgrounds', size: '2.1MB' },
  { id: '3', name: 'icon-star.svg', url: '/placeholder-image.jpg', folder: 'Icons', size: '24KB' }
]

export function ImagesPanel({ onCollapse, className }: ImagesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const handleGenerateImage = async () => {
    if (!generationPrompt.trim()) return

    setIsGenerating(true)
    // Simulate AI generation delay
    setTimeout(() => {
      setIsGenerating(false)
      setGenerationPrompt('')
      // Here you would handle the actual AI generation
    }, 3000)
  }

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    // Handle folder creation logic here
    setNewFolderName('')
    setShowCreateFolder(false)
  }

  const filteredImages = mockImages.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = !selectedFolder || image.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Images</h3>
          {onCollapse && (
            <Button variant="ghost" size="sm" onClick={onCollapse}>
              ×
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={selectedFolder || 'all'}
              onValueChange={(value) => setSelectedFolder(value === 'all' ? null : value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="All folders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All folders</SelectItem>
                {mockFolders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.name}>
                    {folder.name} ({folder.imageCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>

          <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>
                    Create Folder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Wand2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Image with AI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="prompt">Describe the image you want to generate</Label>
                  <Textarea
                    id="prompt"
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    placeholder="A beautiful landscape with mountains and a lake at sunset..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" disabled={isGenerating}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateImage} disabled={isGenerating || !generationPrompt.trim()}>
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Folders */}
      {!selectedFolder && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Folders</h4>
          <div className="space-y-1">
            {mockFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.name)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Folder className="h-4 w-4 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{folder.name}</div>
                  <div className="text-xs text-gray-500">{folder.imageCount} images</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Images Grid */}
      <div className="flex-1 overflow-auto p-4">
        {selectedFolder && (
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFolder(null)}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to all folders
            </Button>
            <span className="text-sm text-gray-600">/ {selectedFolder}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <Image className="h-8 w-8 text-gray-400" />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Button
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    // Handle adding image to canvas
                    console.log('Adding image to canvas:', image.name)
                  }}
                >
                  Add to Canvas
                </Button>
              </div>

              {/* Image info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
                <div className="text-xs font-medium truncate">{image.name}</div>
                <div className="text-xs text-gray-300">{image.size}</div>
              </div>

              {/* More options */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-8">
            <Image className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No images found</p>
            {searchQuery && (
              <p className="text-gray-400 text-xs mt-1">Try adjusting your search</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 