'use client'

import { cn } from '@/src/lib/utils'
import { useCallback, useEffect, useRef } from 'react'

interface RulerProps {
  scrollLeft: number
  scrollTop: number
  zoom: number
  width: number
  height: number
  className?: string
}

const TICK_SIZE = 5
const TICK_COLOR = '#a0aec0'
const FONT_SIZE = 10
const FONT_COLOR = '#718096'

export function Ruler({ scrollLeft, scrollTop, zoom, width, height, className }: RulerProps) {
  const horizontalRulerRef = useRef<HTMLCanvasElement>(null)
  const verticalRulerRef = useRef<HTMLCanvasElement>(null)

  const drawRulers = useCallback(() => {
    const horizontalCtx = horizontalRulerRef.current?.getContext('2d')
    const verticalCtx = verticalRulerRef.current?.getContext('2d')

    if (!horizontalCtx || !verticalCtx) return

    // Clear rulers
    horizontalCtx.clearRect(0, 0, width, 30)
    verticalCtx.clearRect(0, 0, 30, height)

    // Draw horizontal ruler
    horizontalCtx.font = `${FONT_SIZE}px sans-serif`
    horizontalCtx.fillStyle = FONT_COLOR
    horizontalCtx.strokeStyle = TICK_COLOR
    horizontalCtx.lineWidth = 0.5
    horizontalCtx.beginPath()

    const horizontalStart = -scrollLeft
    for (let i = horizontalStart; i < horizontalStart + width; i += 10 * zoom) {
      const pos = Math.round((i + scrollLeft) / zoom)
      if (i % (100 * zoom) === 0) {
        horizontalCtx.moveTo(pos, 30)
        horizontalCtx.lineTo(pos, 30 - TICK_SIZE * 2)
        horizontalCtx.fillText(Math.round(i / zoom).toString(), pos + 2, FONT_SIZE)
      } else if (i % (50 * zoom) === 0) {
        horizontalCtx.moveTo(pos, 30)
        horizontalCtx.lineTo(pos, 30 - TICK_SIZE * 1.5)
      } else {
        horizontalCtx.moveTo(pos, 30)
        horizontalCtx.lineTo(pos, 30 - TICK_SIZE)
      }
    }
    horizontalCtx.stroke()

    // Draw vertical ruler
    verticalCtx.font = `${FONT_SIZE}px sans-serif`
    verticalCtx.fillStyle = FONT_COLOR
    verticalCtx.strokeStyle = TICK_COLOR
    verticalCtx.lineWidth = 0.5
    verticalCtx.beginPath()

    const verticalStart = -scrollTop
    for (let i = verticalStart; i < verticalStart + height; i += 10 * zoom) {
      const pos = Math.round((i + scrollTop) / zoom)
      if (i % (100 * zoom) === 0) {
        verticalCtx.moveTo(30, pos)
        verticalCtx.lineTo(30 - TICK_SIZE * 2, pos)

        verticalCtx.save()
        verticalCtx.translate(FONT_SIZE, pos + 2)
        verticalCtx.rotate(-Math.PI / 2)
        verticalCtx.fillText(Math.round(i / zoom).toString(), 0, 0)
        verticalCtx.restore()

      } else if (i % (50 * zoom) === 0) {
        verticalCtx.moveTo(30, pos)
        verticalCtx.lineTo(30 - TICK_SIZE * 1.5, pos)
      } else {
        verticalCtx.moveTo(30, pos)
        verticalCtx.lineTo(30 - TICK_SIZE, pos)
      }
    }
    verticalCtx.stroke()
  }, [height, scrollLeft, scrollTop, width, zoom])

  useEffect(() => {
    drawRulers()
  }, [drawRulers])

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {/* Corner Box */}
      <div className="absolute top-0 left-0 w-[30px] h-[30px] bg-white border-r border-b border-gray-300" />

      {/* Horizontal Ruler */}
      <canvas
        ref={horizontalRulerRef}
        width={width}
        height={30}
        className="absolute top-0 left-[30px]"
      />

      {/* Vertical Ruler */}
      <canvas
        ref={verticalRulerRef}
        width={30}
        height={height}
        className="absolute top-[30px] left-0"
      />
    </div>
  )
} 