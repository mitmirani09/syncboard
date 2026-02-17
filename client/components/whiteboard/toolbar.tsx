"use client"

import { MousePointer2, Hand, Square, Circle, Type, Image as ImageIcon, Eraser, Pencil, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCanvasStore, Tool } from "@/store/canvas-store" // Import the store

export function Toolbar() {
    // 1. Get the state and the updater function
    const { tool, setTool } = useCanvasStore()

    // Helper to make the code cleaner
    const ToolButton = ({ activeTool, icon: Icon, label }: { activeTool: Tool; icon: any; label: string }) => (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={tool === activeTool ? "default" : "ghost"} // Highlight if active
                    size="icon"
                    onClick={() => setTool(activeTool)} // Update store on click
                    className={tool === activeTool ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
                >
                    <Icon className="h-5 w-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{label}</TooltipContent>
        </Tooltip>
    )

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full border bg-background/95 p-1.5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-1">
                <ToolButton activeTool="select" icon={MousePointer2} label="Select" />
                <ToolButton activeTool="hand" icon={Hand} label="Pan" />
                <Separator orientation="vertical" className="mx-1 h-6" />
                <ToolButton activeTool="pencil" icon={Pencil} label="Draw" />
                <ToolButton activeTool="rectangle" icon={Square} label="Rectangle" />
                <ToolButton activeTool="circle" icon={Circle} label="Circle" />
                {/* We will implement Text and Eraser later */}
                <ToolButton activeTool="text" icon={Type} label="Text" />
                <ToolButton activeTool="eraser" icon={Eraser} label="Eraser" />
            </div>
        </div>
    )
}