import { getHotkeyList } from '@/src/lib/hotkeys'
import { Keyboard } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

interface HotkeyHelpProps {
  className?: string
}

export function HotkeyHelp({ className }: HotkeyHelpProps) {
  const [isOpen, setIsOpen] = useState(false)
  const hotkeyList = getHotkeyList()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className}
          title="Keyboard Shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Object Manipulation */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">Object Manipulation</h3>
              <div className="space-y-1">
                {hotkeyList.slice(0, 4).map((hotkey, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{hotkey.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {hotkey.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">History</h3>
              <div className="space-y-1">
                {hotkeyList.slice(4, 6).map((hotkey, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{hotkey.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {hotkey.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">Selection</h3>
              <div className="space-y-1">
                {hotkeyList.slice(6, 8).map((hotkey, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{hotkey.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {hotkey.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">Tools</h3>
              <div className="space-y-1">
                {hotkeyList.slice(8, 13).map((hotkey, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{hotkey.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {hotkey.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">Navigation</h3>
              <div className="space-y-1">
                {hotkeyList.slice(13, 17).map((hotkey, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{hotkey.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {hotkey.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Layers */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">Layers & Other</h3>
              <div className="space-y-1">
                {hotkeyList.slice(17).map((hotkey, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{hotkey.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {hotkey.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              Note: Some shortcuts may not work when typing in text fields.
              Use <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Escape</kbd> to exit text editing mode.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 