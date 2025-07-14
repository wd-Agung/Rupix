'use client'

import {
  addFontToCache,
  getAllFontsFromCache,
  removeFontFromCache,
} from '@/src/lib/cache-storage'
import { loadCustomFonts, removeCustomFont } from '@/src/lib/font-loader'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'

interface FontManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FontManager({ open, onOpenChange }: FontManagerProps) {
  const [fonts, setFonts] = useState<any[]>([])
  const [fontFile, setFontFile] = useState<File | null>(null)

  useEffect(() => {
    if (open) {
      loadFonts()
    }
  }, [open])

  const loadFonts = async () => {
    const customFonts = await getAllFontsFromCache()
    setFonts(customFonts)
  }

  const handleAddFont = async () => {
    if (fontFile) {
      await addFontToCache(fontFile.name, fontFile)
      setFontFile(null)
      await loadCustomFonts() // Reload all fonts to apply the new one
      loadFonts()
    }
  }

  const handleRemoveFont = async (name: string) => {
    await removeFontFromCache(name)
    removeCustomFont(name)
    loadFonts()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Custom Fonts</DialogTitle>
          <DialogDescription>
            Add or remove custom fonts. The fonts are stored in your browser and
            will be available every time you visit.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept=".ttf, .otf, .woff, .woff2"
              onChange={(e) => setFontFile(e.target.files?.[0] || null)}
            />
            <Button onClick={handleAddFont} disabled={!fontFile}>
              Add Font
            </Button>
          </div>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {fonts.map((font) => (
                <div
                  key={font.name}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <span>{font.name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveFont(font.name)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
