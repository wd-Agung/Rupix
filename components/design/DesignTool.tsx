'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Canvas } from './Canvas'
import { CanvasTabs } from './CanvasTabs'
import { LayersPanel } from './LayersPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { Toolbar } from './Toolbar'

interface DesignToolProps {
  className?: string
}

export function DesignTool({ className }: DesignToolProps) {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false)
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false)

  return (
    <div className={cn('h-screen bg-gray-50', className)}>
      <CanvasTabs>
        <div
          className="grid h-full transition-all duration-300 ease-in-out"
          style={{
            gridTemplateColumns: `${isLeftSidebarCollapsed ? '0' : '320px'} 1fr ${isRightSidebarCollapsed ? '0' : '320px'}`
          }}
        >
          {/* Left Panel - Layers */}
          <div className={cn(
            'border-r bg-white overflow-hidden transition-all duration-300 ease-in-out',
            isLeftSidebarCollapsed && 'border-r-0'
          )}>
            {!isLeftSidebarCollapsed && (
              <LayersPanel
                onCollapse={() => setIsLeftSidebarCollapsed(true)}
              />
            )}
          </div>

          {/* Center Panel - Canvas with Floating Toolbar */}
          <div className="flex flex-col min-w-0 relative">
            <div className="flex-1 overflow-auto relative">
              {/* Show expand buttons when sidebars are collapsed */}
              {isLeftSidebarCollapsed && (
                <div className="absolute top-4 left-4 z-10">
                  <button
                    onClick={() => setIsLeftSidebarCollapsed(false)}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-md p-2 shadow-sm transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {isRightSidebarCollapsed && (
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setIsRightSidebarCollapsed(false)}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-md p-2 shadow-sm transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex h-full">
                <Canvas />
              </div>

              {/* Floating Toolbar at Bottom Center */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                <Toolbar className="shadow-lg rounded-lg border-0 bg-white/95 backdrop-blur-sm" />
              </div>
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className={cn(
            'border-l bg-white overflow-hidden transition-all duration-300 ease-in-out',
            isRightSidebarCollapsed && 'border-l-0'
          )}>
            {!isRightSidebarCollapsed && (
              <PropertiesPanel
                onCollapse={() => setIsRightSidebarCollapsed(true)}
              />
            )}
          </div>
        </div>
      </CanvasTabs>
    </div>
  )
} 