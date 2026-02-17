"use client"

import { useState } from "react"
import {
    ArrowUpToLine,
    ArrowDownToLine,
    Copy,
    Trash2,
    Bold,
    Italic,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const strokeColors = [
    { color: "#4f46e5", label: "Indigo" },
    { color: "#0ea5e9", label: "Sky" },
    { color: "#10b981", label: "Emerald" },
    { color: "#f59e0b", label: "Amber" },
    { color: "#ef4444", label: "Red" },
    { color: "#8b5cf6", label: "Violet" },
]

const fillColors = [
    { color: "transparent", label: "None" },
    { color: "#eef2ff", label: "Indigo Light" },
    { color: "#e0f2fe", label: "Sky Light" },
    { color: "#d1fae5", label: "Emerald Light" },
    { color: "#fef3c7", label: "Amber Light" },
    { color: "#fee2e2", label: "Red Light" },
]

interface PropertiesPanelProps {
    isOpen: boolean
}

export function PropertiesPanel({ isOpen }: PropertiesPanelProps) {
    const [activeStrokeColor, setActiveStrokeColor] = useState("#4f46e5")
    const [activeFillColor, setActiveFillColor] = useState("transparent")
    const [strokeWidth, setStrokeWidth] = useState([2])
    const [showTypography, setShowTypography] = useState(true)

    if (!isOpen) return null

    return (
        <div className="fixed top-20 left-4 z-50 w-56 rounded-2xl border border-border/50 bg-card/95 shadow-lg backdrop-blur-xl">
            {/* Stroke Section */}
            <div className="p-4">
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Stroke
                </h3>
                <div className="flex flex-wrap gap-2">
                    {strokeColors.map((c) => (
                        <Tooltip key={c.color}>
                            <TooltipTrigger asChild>
                                <button
                                    className={cn(
                                        "size-7 rounded-full border-2 transition-all",
                                        activeStrokeColor === c.color
                                            ? "scale-110 border-foreground ring-2 ring-primary/20"
                                            : "border-transparent hover:scale-105"
                                    )}
                                    style={{ backgroundColor: c.color }}
                                    onClick={() => setActiveStrokeColor(c.color)}
                                    aria-label={`Stroke color: ${c.label}`}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                                {c.label}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>

                <div className="mt-4">
                    <label className="mb-2 block text-xs text-muted-foreground">
                        Width: {strokeWidth[0]}px
                    </label>
                    <Slider
                        value={strokeWidth}
                        onValueChange={setStrokeWidth}
                        min={1}
                        max={12}
                        step={1}
                        className="w-full"
                    />
                </div>
            </div>

            <Separator />

            {/* Fill Section */}
            <div className="p-4">
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Background
                </h3>
                <div className="flex flex-wrap gap-2">
                    {fillColors.map((c) => (
                        <Tooltip key={c.color}>
                            <TooltipTrigger asChild>
                                <button
                                    className={cn(
                                        "size-7 rounded-full border-2 transition-all",
                                        c.color === "transparent" && "bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]",
                                        activeFillColor === c.color
                                            ? "scale-110 border-foreground ring-2 ring-primary/20"
                                            : "border-border hover:scale-105"
                                    )}
                                    style={
                                        c.color !== "transparent"
                                            ? { backgroundColor: c.color }
                                            : undefined
                                    }
                                    onClick={() => setActiveFillColor(c.color)}
                                    aria-label={`Fill color: ${c.label}`}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                                {c.label}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Typography (Contextual) */}
            {showTypography && (
                <>
                    <div className="p-4">
                        <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Typography
                        </h3>
                        <div className="flex items-center gap-1">
                            <select
                                className="h-8 flex-1 rounded-lg border border-border bg-secondary px-2 text-xs text-foreground"
                                defaultValue="inter"
                                aria-label="Font family"
                            >
                                <option value="inter">Inter</option>
                                <option value="mono">Monospace</option>
                                <option value="serif">Serif</option>
                            </select>
                            <input
                                type="number"
                                defaultValue={16}
                                className="h-8 w-14 rounded-lg border border-border bg-secondary px-2 text-center text-xs text-foreground"
                                aria-label="Font size"
                            />
                        </div>
                        <div className="mt-2 flex gap-1">
                            <Button
                                variant="outline"
                                size="icon-sm"
                                className="rounded-lg"
                                aria-label="Bold"
                            >
                                <Bold className="size-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon-sm"
                                className="rounded-lg"
                                aria-label="Italic"
                            >
                                <Italic className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            {/* Actions */}
            <div className="p-4">
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Actions
                </h3>
                <div className="flex flex-wrap gap-1">
                    {[
                        { icon: ArrowUpToLine, label: "Bring to Front" },
                        { icon: ArrowDownToLine, label: "Send to Back" },
                        { icon: Copy, label: "Duplicate" },
                        { icon: Trash2, label: "Delete" },
                    ].map((action) => (
                        <Tooltip key={action.label}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    className={cn(
                                        "rounded-lg",
                                        action.label === "Delete" &&
                                        "text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    )}
                                    aria-label={action.label}
                                >
                                    <action.icon className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                                {action.label}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </div>
    )
}
