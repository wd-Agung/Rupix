'use client'

import { cn } from '@/src/lib/utils'
import { FileText, Image, Layers, Type } from 'lucide-react'

interface NavigationSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

export function NavigationSidebar({ activeTab, onTabChange, className }: NavigationSidebarProps) {
  const navigationItems = [
    { id: 'images', icon: Image, label: 'Images' },
    { id: 'texts', icon: Type, label: 'Texts' },
    { id: 'layers', icon: Layers, label: 'Layers' },
    { id: 'templates', icon: FileText, label: 'Templates' }
  ]

  return (
    <div className={cn('w-16 bg-gray-800 flex flex-col border-r border-gray-700', className)}>
      <div className="p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center transition-colors group relative',
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              )}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
} 