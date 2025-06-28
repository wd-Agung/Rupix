'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { FileText, Filter, MoreHorizontal, Search } from 'lucide-react'
import { useState } from 'react'

interface TemplatesPanelProps {
  onCollapse?: () => void
  className?: string
}

// Mock templates data
const mockTemplates = [
  {
    id: '1',
    name: 'Social Media Post',
    category: 'Social Media',
    size: '1080x1080',
    thumbnail: '/placeholder-template.jpg',
    tags: ['instagram', 'square', 'social']
  },
  {
    id: '2',
    name: 'Business Card',
    category: 'Print',
    size: '3.5x2 in',
    thumbnail: '/placeholder-template.jpg',
    tags: ['business', 'professional', 'print']
  },
  {
    id: '3',
    name: 'Blog Header',
    category: 'Web',
    size: '1200x400',
    thumbnail: '/placeholder-template.jpg',
    tags: ['blog', 'header', 'web']
  },
  {
    id: '4',
    name: 'Presentation Slide',
    category: 'Presentation',
    size: '1920x1080',
    thumbnail: '/placeholder-template.jpg',
    tags: ['presentation', 'slide', 'powerpoint']
  },
  {
    id: '5',
    name: 'Flyer',
    category: 'Print',
    size: '8.5x11 in',
    thumbnail: '/placeholder-template.jpg',
    tags: ['flyer', 'print', 'marketing']
  },
  {
    id: '6',
    name: 'Instagram Story',
    category: 'Social Media',
    size: '1080x1920',
    thumbnail: '/placeholder-template.jpg',
    tags: ['instagram', 'story', 'vertical']
  }
]

const categories = ['All', 'Social Media', 'Print', 'Web', 'Presentation']

export function TemplatesPanel({ onCollapse, className }: TemplatesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleUseTemplate = (template: typeof mockTemplates[0]) => {
    // Here you would integrate with your canvas/design system
    console.log('Using template:', template)
    // Example: designStore.loadTemplate(template)
  }

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Templates</h3>
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
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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

      {/* Templates Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group relative border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              {/* Template Thumbnail */}
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <FileText className="h-12 w-12 text-gray-400" />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Button
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleUseTemplate(template)}
                  >
                    Use Template
                  </Button>
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

              {/* Template Info */}
              <div className="p-3">
                <div className="font-medium text-gray-900 text-sm truncate mb-1">
                  {template.name}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{template.category}</span>
                  <span>{template.size}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 2 && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      +{template.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No templates found</p>
            {searchQuery && (
              <p className="text-gray-400 text-xs mt-1">Try adjusting your search</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 