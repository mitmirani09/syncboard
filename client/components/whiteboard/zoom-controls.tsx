"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip"

interface ZoomControlsProps {
    zoom: number
    onZoomIn: () => void
    onZoomOut: () => void
    onZoomReset: () => void
}

export function ZoomControls({
    zoom,
    onZoomIn,
    onZoomOut,
    onZoomReset,
}: ZoomControlsProps) {
    return (
        <div className="fixed right-4 bottom-6 z-50 flex items-center gap-0.5 rounded-xl border border-border/50 bg-card/95 px-1 py-1 shadow-lg backdrop-blur-xl">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg"
                        onClick={onZoomOut}
                        aria-label="Zoom out"
                    >
                        <Minus className="size-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={12}>
                    Zoom out
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-14 rounded-lg text-xs font-medium tabular-nums"
                        onClick={onZoomReset}
                        aria-label="Reset zoom"
                    >
                        {zoom}%
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={12}>
                    Reset zoom
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg"
                        onClick={onZoomIn}
                        aria-label="Zoom in"
                    >
                        <Plus className="size-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={12}>
                    Zoom in
                </TooltipContent>
            </Tooltip>
        </div>
    )
}
