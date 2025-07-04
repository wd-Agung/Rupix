'use client'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { useDesignStore } from '@/src/lib/stores/design-store'
import { cn } from '@/src/lib/utils'
import fabric from 'fabric'
import { Search, Type } from 'lucide-react'
import { useState } from 'react'

interface TextsPanelProps {
  onCollapse?: () => void
  className?: string
}

interface CustomTextStyle {
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  color: string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  charSpacing?: number;
}

// Mock text styles data
const textStyles: Array<{
  id: string;
  name: string;
  category: string;
  style: CustomTextStyle;
  preview: string;
}> = [
    // Modern Headers
    {
      id: '1',
      name: 'Inter Heading',
      category: 'Headers',
      style: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        fontFamily: 'Inter',
        color: '#1f2937'
      },
      preview: 'Modern Heading'
    },
    {
      id: '2',
      name: 'Poppins Header',
      category: 'Headers',
      style: {
        fontSize: '2rem',
        fontWeight: '600',
        fontFamily: 'Poppins',
        color: '#374151'
      },
      preview: 'Clean Header'
    },
    {
      id: '3',
      name: 'Montserrat Title',
      category: 'Headers',
      style: {
        fontSize: '1.75rem',
        fontWeight: '700',
        fontFamily: 'Montserrat',
        color: '#111827'
      },
      preview: 'Bold Title'
    },

    // Elegant Serif Headers
    {
      id: '4',
      name: 'Playfair Display',
      category: 'Headers',
      style: {
        fontSize: '2.25rem',
        fontWeight: 'bold',
        fontFamily: 'Playfair Display',
        color: '#1f2937'
      },
      preview: 'Elegant Display'
    },
    {
      id: '5',
      name: 'Merriweather Heading',
      category: 'Headers',
      style: {
        fontSize: '1.875rem',
        fontWeight: '700',
        fontFamily: 'Merriweather',
        color: '#374151'
      },
      preview: 'Classic Heading'
    },

    // Body Text Styles
    {
      id: '6',
      name: 'Inter Body',
      category: 'Body',
      style: {
        fontSize: '1rem',
        fontWeight: 'normal',
        fontFamily: 'Inter',
        color: '#4b5563'
      },
      preview: 'Modern body text for readability'
    },
    {
      id: '7',
      name: 'Open Sans Body',
      category: 'Body',
      style: {
        fontSize: '1rem',
        fontWeight: 'normal',
        fontFamily: 'Open Sans',
        color: '#4b5563'
      },
      preview: 'Clean and readable body text'
    },
    {
      id: '8',
      name: 'Lora Article',
      category: 'Body',
      style: {
        fontSize: '1.125rem',
        fontWeight: 'normal',
        fontFamily: 'Lora',
        color: '#374151'
      },
      preview: 'Beautiful serif for long-form content'
    },

    // Display & Impact
    {
      id: '9',
      name: 'Oswald Display',
      category: 'Display',
      style: {
        fontSize: '3rem',
        fontWeight: '600',
        fontFamily: 'Oswald',
        color: '#111827',
        textTransform: 'uppercase'
      },
      preview: 'IMPACT'
    },
    {
      id: '10',
      name: 'Bebas Neue',
      category: 'Display',
      style: {
        fontSize: '2.5rem',
        fontWeight: 'normal',
        fontFamily: 'Bebas Neue',
        color: '#1f2937',
        textTransform: 'uppercase'
      },
      preview: 'BOLD DISPLAY'
    },
    {
      id: '11',
      name: 'Raleway Light',
      category: 'Display',
      style: {
        fontSize: '2rem',
        fontWeight: '300',
        fontFamily: 'Raleway',
        color: '#6b7280'
      },
      preview: 'Elegant & Light'
    },

    // Special Use Cases
    {
      id: '12',
      name: 'Crimson Quote',
      category: 'Special',
      style: {
        fontSize: '1.25rem',
        fontWeight: 'normal',
        fontFamily: 'Crimson Text',
        fontStyle: 'italic',
        color: '#374151'
      },
      preview: '"Beautiful serif quotation"'
    },
    {
      id: '13',
      name: 'Nunito Caption',
      category: 'Body',
      style: {
        fontSize: '0.875rem',
        fontWeight: 'normal',
        fontFamily: 'Nunito Sans',
        color: '#6b7280'
      },
      preview: 'Friendly caption text'
    },

    // UI Elements
    {
      id: '14',
      name: 'Inter Button',
      category: 'UI',
      style: {
        fontSize: '0.875rem',
        fontWeight: '600',
        fontFamily: 'Inter',
        color: '#3b82f6',
        textTransform: 'uppercase'
      },
      preview: 'BUTTON TEXT'
    },
    {
      id: '15',
      name: 'Poppins Tag',
      category: 'UI',
      style: {
        fontSize: '0.75rem',
        fontWeight: '500',
        fontFamily: 'Poppins',
        color: '#059669',
        textTransform: 'uppercase'
      },
      preview: 'TAG LABEL'
    },

    // Modern Sans-Serif Showcase
    {
      id: '16',
      name: 'Work Sans Clean',
      category: 'Headers',
      style: {
        fontSize: '1.5rem',
        fontWeight: '500',
        fontFamily: 'Work Sans',
        color: '#111827'
      },
      preview: 'Professional Header'
    },
    {
      id: '17',
      name: 'DM Sans Modern',
      category: 'Body',
      style: {
        fontSize: '1rem',
        fontWeight: 'normal',
        fontFamily: 'DM Sans',
        color: '#4b5563'
      },
      preview: 'Contemporary body text design'
    },
    {
      id: '18',
      name: 'Plus Jakarta Sans',
      category: 'UI',
      style: {
        fontSize: '0.875rem',
        fontWeight: '600',
        fontFamily: 'Plus Jakarta Sans',
        color: '#059669'
      },
      preview: 'Modern UI Label'
    },
    {
      id: '19',
      name: 'Space Grotesk',
      category: 'Display',
      style: {
        fontSize: '2rem',
        fontWeight: '700',
        fontFamily: 'Space Grotesk',
        color: '#1f2937'
      },
      preview: 'Unique Display'
    },
    {
      id: '20',
      name: 'Outfit Geometric',
      category: 'Headers',
      style: {
        fontSize: '1.75rem',
        fontWeight: '600',
        fontFamily: 'Outfit',
        color: '#374151'
      },
      preview: 'Geometric Header'
    },
    {
      id: '21',
      name: 'Manrope Friendly',
      category: 'Body',
      style: {
        fontSize: '1rem',
        fontWeight: 'normal',
        fontFamily: 'Manrope',
        color: '#4b5563'
      },
      preview: 'Friendly and approachable text'
    },
    {
      id: '22',
      name: 'IBM Plex Sans',
      category: 'Body',
      style: {
        fontSize: '1rem',
        fontWeight: 'normal',
        fontFamily: 'IBM Plex Sans',
        color: '#374151'
      },
      preview: 'Corporate professional text'
    },
    {
      id: '23',
      name: 'Lexend Readable',
      category: 'Body',
      style: {
        fontSize: '1rem',
        fontWeight: 'normal',
        fontFamily: 'Lexend',
        color: '#4b5563'
      },
      preview: 'Optimized for reading efficiency'
    },

    // Premium Serif Fonts
    {
      id: '24',
      name: 'Libre Baskerville',
      category: 'Headers',
      style: {
        fontSize: '1.875rem',
        fontWeight: '400',
        fontFamily: 'Libre Baskerville',
        color: '#1f2937'
      },
      preview: 'Classic Elegance'
    },
    {
      id: '25',
      name: 'Cormorant Garamond',
      category: 'Display',
      style: {
        fontSize: '2.25rem',
        fontWeight: '400',
        fontFamily: 'Cormorant Garamond',
        color: '#374151'
      },
      preview: 'Luxury Display'
    },
    {
      id: '26',
      name: 'EB Garamond',
      category: 'Body',
      style: {
        fontSize: '1.125rem',
        fontWeight: 'normal',
        fontFamily: 'EB Garamond',
        color: '#374151'
      },
      preview: 'Traditional serif for articles'
    },
    {
      id: '27',
      name: 'Spectral Modern',
      category: 'Body',
      style: {
        fontSize: '1rem',
        fontWeight: 'normal',
        fontFamily: 'Spectral',
        color: '#4b5563'
      },
      preview: 'Modern serif optimized for screens'
    },

    // Bold Display Fonts
    {
      id: '28',
      name: 'Archivo Black',
      category: 'Display',
      style: {
        fontSize: '2.5rem',
        fontWeight: 'normal',
        fontFamily: 'Archivo Black',
        color: '#111827'
      },
      preview: 'ULTRA BOLD'
    },
    {
      id: '29',
      name: 'Anton Impact',
      category: 'Display',
      style: {
        fontSize: '2.25rem',
        fontWeight: 'normal',
        fontFamily: 'Anton',
        color: '#1f2937',
        textTransform: 'uppercase'
      },
      preview: 'MAXIMUM IMPACT'
    },
    {
      id: '30',
      name: 'Fjalla One',
      category: 'Display',
      style: {
        fontSize: '2rem',
        fontWeight: 'normal',
        fontFamily: 'Fjalla One',
        color: '#374151',
        textTransform: 'uppercase'
      },
      preview: 'CONDENSED POWER'
    },
    {
      id: '31',
      name: 'Kanit Thai Style',
      category: 'Headers',
      style: {
        fontSize: '1.75rem',
        fontWeight: '600',
        fontFamily: 'Kanit',
        color: '#1f2937'
      },
      preview: 'Modern International'
    },

    // Fun & Creative Fonts
    {
      id: '32',
      name: 'Fredoka Playful',
      category: 'Fun',
      style: {
        fontSize: '1.5rem',
        fontWeight: '500',
        fontFamily: 'Fredoka',
        color: '#7c3aed'
      },
      preview: 'Fun & Friendly'
    },
    {
      id: '33',
      name: 'Lobster Script',
      category: 'Fun',
      style: {
        fontSize: '1.75rem',
        fontWeight: 'normal',
        fontFamily: 'Lobster',
        color: '#dc2626'
      },
      preview: 'Stylish Script'
    },
    {
      id: '34',
      name: 'Pacifico Casual',
      category: 'Fun',
      style: {
        fontSize: '1.5rem',
        fontWeight: 'normal',
        fontFamily: 'Pacifico',
        color: '#ea580c'
      },
      preview: 'Casual & Relaxed'
    },
    {
      id: '35',
      name: 'Dancing Script',
      category: 'Fun',
      style: {
        fontSize: '1.75rem',
        fontWeight: 'normal',
        fontFamily: 'Dancing Script',
        color: '#be185d'
      },
      preview: 'Handwritten Style'
    },

    // Code/Technical
    {
      id: '36',
      name: 'Fira Code',
      category: 'Code',
      style: {
        fontSize: '0.875rem',
        fontWeight: 'normal',
        fontFamily: 'Fira Code',
        color: '#1f2937'
      },
      preview: 'const code = "beautiful";'
    },
    {
      id: '37',
      name: 'Source Code Pro',
      category: 'Code',
      style: {
        fontSize: '0.875rem',
        fontWeight: 'normal',
        fontFamily: 'Source Code Pro',
        color: '#374151'
      },
      preview: 'function() { return true; }'
    }
  ]

const categories = ['All', 'Headers', 'Body', 'Display', 'Special', 'UI', 'Fun', 'Code']

export function TextsPanel({ onCollapse, className }: TextsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const { getActiveDesign } = useDesignStore()

  const filteredStyles = textStyles.filter(style => {
    const matchesSearch = style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.preview.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || style.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddTextToCanvas = (style: typeof textStyles[0]) => {
    const activeDesign = getActiveDesign()
    if (!activeDesign || !activeDesign.canvas) {
      console.warn('No active canvas found')
      return
    }

    // Convert CSS properties to fabric.js compatible properties
    const convertFontSize = (fontSize: string): number => {
      if (fontSize.endsWith('rem')) {
        return parseFloat(fontSize) * 16 // Convert rem to px (assuming 16px = 1rem)
      } else if (fontSize.endsWith('px')) {
        return parseFloat(fontSize)
      } else if (fontSize.endsWith('em')) {
        return parseFloat(fontSize) * 16 // Convert em to px
      }
      return parseFloat(fontSize) || 16
    }

    // Get canvas center for positioning
    const canvasCenter = activeDesign.canvas.getWidth() / 2
    const canvasCenterY = activeDesign.canvas.getHeight() / 2

    // Convert viewport coordinates to canvas coordinates
    const viewportTransform = activeDesign.canvas.viewportTransform
    const zoom = activeDesign.canvas.getZoom()
    const centerX = (canvasCenter - (viewportTransform?.[4] || 0)) / zoom
    const centerY = (canvasCenterY - (viewportTransform?.[5] || 0)) / zoom

    const textProps = {
      fontSize: convertFontSize(style.style.fontSize),
      fontFamily: style.style.fontFamily,
      fontWeight: style.style.fontWeight || 'normal',
      fontStyle: style.style.fontStyle || 'normal',
      underline: false,
      textAlign: style.style.textAlign || 'left',
      lineHeight: style.style.lineHeight || 1.2,
      charSpacing: style.style.charSpacing || 0,
      fill: style.style.color || '#000000',
      opacity: 1,
      shadow: null,
      backgroundColor: 'transparent'
    }

    // Apply text transform to the preview text if specified
    let displayText = style.preview
    if (style.style.textTransform === 'uppercase') {
      displayText = style.preview.toUpperCase()
    } else if (style.style.textTransform === 'lowercase') {
      displayText = style.preview.toLowerCase()
    } else if (style.style.textTransform === 'capitalize') {
      displayText = style.preview.replace(/\b\w/g, l => l.toUpperCase())
    }

    // Adjust positioning based on text alignment and category
    const textX = centerX
    let textY = centerY

    // For display fonts, position them slightly higher and consider centering
    if (style.category === 'Display') {
      textY = centerY - 50 // Position display text higher
      if (textProps.textAlign === 'center') {
        // Text will be centered from its anchor point
      }
    }

    // Add text to canvas
    activeDesign.addText({ x: textX, y: textY }, textProps)

    // Set the text content to the preview text
    setTimeout(() => {
      const activeObject = activeDesign.canvas?.getActiveObject()
      if (activeObject && activeObject.type === 'i-text') {
        (activeObject as fabric.IText).set('text', displayText)
        activeDesign.canvas?.requestRenderAll()
      }
    }, 10)
  }

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Text Styles</h3>
          {onCollapse && (
            <Button variant="ghost" size="sm" onClick={onCollapse}>
              ×
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search styles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Text Styles List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {filteredStyles.map((style) => (
            <div
              key={style.id}
              className="group relative border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => handleAddTextToCanvas(style)}
            >
              {/* Style Preview */}
              <div
                className="mb-2 break-words"
                style={{
                  fontSize: style.style.fontSize,
                  fontWeight: style.style.fontWeight,
                  fontFamily: style.style.fontFamily,
                  color: style.style.color,
                  fontStyle: style.style.fontStyle,
                  textTransform: style.style.textTransform,
                  lineHeight: '1.2'
                }}
              >
                {style.preview}
              </div>

              {/* Style Details */}
              <div className="mt-2 text-xs text-gray-400">
                {style.style.fontFamily.split(',')[0]} • {style.style.fontSize} • {style.style.fontWeight}
              </div>
            </div>
          ))}
        </div>

        {filteredStyles.length === 0 && (
          <div className="text-center py-8">
            <Type className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No text styles found</p>
            {searchQuery && (
              <p className="text-gray-400 text-xs mt-1">Try adjusting your search</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 