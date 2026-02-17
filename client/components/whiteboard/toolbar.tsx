"use client"

import {
    MousePointer2,
    Hand,
    Square,
    Circle,
    Diamond,
    MoveRight,
    Minus,
    Pencil,
    Type,
    Image,
    Eraser,
    Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ToolbarProps {
    activeTool: string
    onToolChange: (tool: string) => void
}

const tools = [
    { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
    { id: "hand", icon: Hand, label: "Pan", shortcut: "H" },
    { id: "rect", icon: Square, label: "Rectangle", shortcut: "R" },
    { id: "ellipse", icon: Circle, label: "Ellipse", shortcut: "O" },
    { id: "diamond", icon: Diamond, label: "Diamond", shortcut: "D" },
    { id: "arrow", icon: MoveRight, label: "Arrow", shortcut: "A" },
    { id: "line", icon: Minus, label: "Line", shortcut: "L" },
    { id: "draw", icon: Pencil, label: "Draw", shortcut: "P" },
    { id: "text", icon: Type, label: "Text", shortcut: "T" },
    { id: "image", icon: Image, label: "Image", shortcut: "I" },
    { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
]

export function Toolbar({ activeTool, onToolChange }: ToolbarProps) {
    return (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-2xl border border-border/50 bg-card/95 px-1.5 py-1.5 shadow-lg backdrop-blur-xl">
            {tools.map((tool) => (
                <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className={cn(
                                "rounded-xl transition-all duration-150",
                                activeTool === tool.id &&
                                "bg-accent text-primary ring-2 ring-primary/20"
                            )}
                            onClick={() => onToolChange(tool.id)}
                            aria-label={tool.label}
                        >
                            <tool.icon className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={12}>
                        <span>{tool.label}</span>
                        <span className="ml-1.5 text-[10px] opacity-60">{tool.shortcut}</span>
                    </TooltipContent>
                </Tooltip>
            ))}

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-xl text-primary hover:bg-accent hover:text-primary"
                        aria-label="Ask AI"
                    >
                        <Sparkles className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={12}>
                    Ask AI
                </TooltipContent>
            </Tooltip>
        </div>
    )
}
