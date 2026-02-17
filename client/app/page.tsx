"use client"

import { useState, useCallback, useEffect } from "react"
import { WhiteboardCanvas } from "@/components/whiteboard/canvas"
import { Toolbar } from "@/components/whiteboard/toolbar"
import { Header } from "@/components/whiteboard/header"
import { PropertiesPanel } from "@/components/whiteboard/properties-panel"
import { ZoomControls } from "@/components/whiteboard/zoom-controls"

export default function WhiteboardPage() {
  const [activeTool, setActiveTool] = useState("select")
  const [zoom, setZoom] = useState(100)
  const [isDark, setIsDark] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 10, 300))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 10, 10))
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoom(100)
  }, [])

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      return next
    })
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.contentEditable === "true")
      )
        return

      const keyMap: Record<string, string> = {
        v: "select",
        h: "hand",
        r: "rect",
        o: "ellipse",
        d: "diamond",
        a: "arrow",
        l: "line",
        p: "draw",
        t: "text",
        i: "image",
        e: "eraser",
      }

      const tool = keyMap[e.key.toLowerCase()]
      if (tool) {
        e.preventDefault()
        setActiveTool(tool)
      }

      if (e.key === "=" || e.key === "+") {
        e.preventDefault()
        handleZoomIn()
      }
      if (e.key === "-") {
        e.preventDefault()
        handleZoomOut()
      }
      if (e.key === "0") {
        e.preventDefault()
        handleZoomReset()
      }

      // Toggle properties panel with Tab
      if (e.key === "Tab") {
        e.preventDefault()
        setIsPanelOpen((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleZoomIn, handleZoomOut, handleZoomReset])

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background">
      <WhiteboardCanvas activeTool={activeTool} zoom={zoom} />
      <Header isDark={isDark} onToggleTheme={handleToggleTheme} />
      <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />
      <PropertiesPanel isOpen={isPanelOpen} />
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />
    </main>
  )
}
