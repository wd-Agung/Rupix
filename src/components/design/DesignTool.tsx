'use client'

import { cn } from '@/src/lib/utils'
import { Bot, Settings } from 'lucide-react'
import { ElementRef, useRef, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { AgentPanel } from './AgentPanel'
import { Canvas } from './Canvas'
import { CanvasTabs } from './CanvasTabs'
import { ImagesPanel } from './ImagesPanel'
import { LayersPanel } from './LayersPanel'
import { NavigationSidebar } from './NavigationSidebar'
import { PropertiesPanel } from './PropertiesPanel'
import { TemplatesPanel } from './TemplatesPanel'
import { TextsPanel } from './TextsPanel'
import { Toolbar } from './Toolbar'

interface DesignToolProps {
  className?: string
}

export function DesignTool({ className }: DesignToolProps) {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false)
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false)
  const [activeRightTab, setActiveRightTab] = useState('properties')
  const [activeLeftTab, setActiveLeftTab] = useState('layers')

  const leftPanelRef = useRef<ElementRef<typeof Panel>>(null)
  const rightPanelRef = useRef<ElementRef<typeof Panel>>(null)

  const toggleLeftSidebar = () => {
    const panel = leftPanelRef.current
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand()
      } else {
        panel.collapse()
      }
    }
  }

  const toggleRightSidebar = () => {
    const panel = rightPanelRef.current
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand()
      } else {
        panel.collapse()
      }
    }
  }

  return (
    <div className={cn('h-screen bg-gray-50 flex', className)}>
      <NavigationSidebar
        activeTab={activeLeftTab}
        onTabChange={(tab: string) => {
          if (tab === activeLeftTab && !isLeftSidebarCollapsed) {
            leftPanelRef.current?.collapse()
          } else {
            setActiveLeftTab(tab)
            if (isLeftSidebarCollapsed) {
              leftPanelRef.current?.expand()
            }
          }
        }}
      />
      <div className="flex-1 min-w-0">
        <CanvasTabs>
          <PanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Dynamic Content */}
            <Panel
              ref={leftPanelRef}
              collapsible
              collapsedSize={0}
              minSize={22}
              maxSize={30}
              defaultSize={20}
              onCollapse={() => setIsLeftSidebarCollapsed(true)}
              onExpand={() => setIsLeftSidebarCollapsed(false)}
            >
              <div className={cn(
                'border-r bg-white h-full overflow-hidden transition-all duration-300 ease-in-out',
                isLeftSidebarCollapsed && 'border-r-0'
              )}>
                {!isLeftSidebarCollapsed && (
                  <>
                    {activeLeftTab === 'images' && (
                      <ImagesPanel onCollapse={toggleLeftSidebar} />
                    )}
                    {activeLeftTab === 'texts' && (
                      <TextsPanel onCollapse={toggleLeftSidebar} />
                    )}
                    {activeLeftTab === 'layers' && (
                      <LayersPanel onCollapse={toggleLeftSidebar} />
                    )}
                    {activeLeftTab === 'templates' && (
                      <TemplatesPanel onCollapse={toggleLeftSidebar} />
                    )}
                  </>
                )}
              </div>
            </Panel>
            <PanelResizeHandle className="w-px bg-gray-200 hover:bg-blue-500 transition-colors" />

            {/* Center Panel - Canvas with Floating Toolbar */}
            <Panel>
              <div className="flex flex-col min-w-0 relative h-full">
                <div className="flex-1 overflow-auto relative">

                  {/* {isRightSidebarCollapsed && ( */}
                  <div className="absolute top-4 right-4 z-10">
                    {/* Floating vertical tabs when right panel is collapsed */}
                    <div className="flex flex-col bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={() => {
                          setActiveRightTab('properties')
                          if (!isRightSidebarCollapsed && activeRightTab === 'properties') {
                            toggleRightSidebar()
                          } else {
                            rightPanelRef.current?.expand()
                            setIsRightSidebarCollapsed(false)
                          }
                        }}
                        className={cn('p-3 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0',
                          activeRightTab === 'properties' && !isRightSidebarCollapsed
                            ? 'bg-gray-100'
                            : 'hover:bg-gray-100'
                        )}
                        title="Properties"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setActiveRightTab('agent')
                          if (!isRightSidebarCollapsed && activeRightTab === 'agent') {
                            toggleRightSidebar()
                          } else {
                            rightPanelRef.current?.expand()
                            setIsRightSidebarCollapsed(false)
                          }
                        }}
                        className={cn('p-3 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0',
                          activeRightTab === 'agent' && !isRightSidebarCollapsed
                            ? 'bg-gray-100'
                            : 'hover:bg-gray-100'
                        )}
                        title="Agent"
                      >
                        <Bot className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {/* )} */}

                  <div className="flex h-full">
                    <Canvas />
                  </div>

                  {/* Floating Toolbar at Bottom Center */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                    <Toolbar className="shadow-lg rounded-lg border-0 bg-white/95 backdrop-blur-sm" />
                  </div>
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className="w-px bg-gray-200 hover:bg-blue-500 transition-colors" />

            {/* Right Panel - Properties & Agent with Floating Tabs */}
            <Panel
              ref={rightPanelRef}
              collapsible
              collapsedSize={0}
              minSize={22}
              maxSize={36}
              defaultSize={20}
              onCollapse={() => setIsRightSidebarCollapsed(true)}
              onExpand={() => setIsRightSidebarCollapsed(false)}
            >
              <div className={cn(
                'border-l bg-white h-full min-w-80 overflow-hidden transition-all duration-300 ease-in-out relative',
                isRightSidebarCollapsed && 'border-l-0'
              )}>
                {/* Floating vertical tabs on the outer left edge - always visible */}
                <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 z-20">
                  <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setActiveRightTab('properties')
                        if (isRightSidebarCollapsed) {
                          rightPanelRef.current?.expand()
                          setIsRightSidebarCollapsed(false)
                        }
                      }}
                      className={cn(
                        'p-3 transition-colors border-b border-gray-200 last:border-b-0',
                        activeRightTab === 'properties' && !isRightSidebarCollapsed
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100'
                      )}
                      title="Properties"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveRightTab('agent')
                        if (isRightSidebarCollapsed) {
                          rightPanelRef.current?.expand()
                          setIsRightSidebarCollapsed(false)
                        }
                      }}
                      className={cn(
                        'p-3 transition-colors border-b border-gray-200 last:border-b-0',
                        activeRightTab === 'agent' && !isRightSidebarCollapsed
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100'
                      )}
                      title="Agent"
                    >
                      <Bot className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {!isRightSidebarCollapsed && (
                  <>
                    {/* Collapse button */}
                    <button
                      onClick={toggleRightSidebar}
                      className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-md p-2 shadow-sm transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Panel Content */}
                    <div className="h-full w-full">
                      {activeRightTab === 'properties' && (
                        <PropertiesPanel onCollapse={toggleRightSidebar} className="h-full border-none" />
                      )}
                      {activeRightTab === 'agent' && (
                        <AgentPanel onCollapse={toggleRightSidebar} className="h-full border-none" />
                      )}
                    </div>
                  </>
                )}
              </div>
            </Panel>
          </PanelGroup>
        </CanvasTabs>
      </div>
    </div>
  )
} 