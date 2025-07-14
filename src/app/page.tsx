'use client'

import { DesignTool } from '@/src/components/design/DesignTool'
import { loadCustomFonts } from '@/src/lib/font-loader'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    loadCustomFonts()
  }, [])

  return <DesignTool />
}
