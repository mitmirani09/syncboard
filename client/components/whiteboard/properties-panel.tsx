"use client"

import { useCanvasStore } from "@/store/canvas-store" // Import store
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Minus,
    Plus,
    Trash2,
    Undo2,
    Redo2,
    BringToFront,
    SendToBack
} from "lucide-react"

const COLORS = [
    "#000000", // Black
    "#EF4444", // Red
    "#22C55E", // Green
    "#3B82F6", // Blue
    "#EAB308", // Yellow
]

export function PropertiesPanel() {
    const {
        strokeColor,
        setStrokeColor,
        strokeWidth,
        setStrokeWidth,
        undo,    // We will add these to store next
        redo,    // We will add these to store next
        canUndo, // We will add these to store next
        canRedo  // We will add these to store next
    } = useCanvasStore()

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 rounded-xl border bg-card p-4 shadow-xl w-64">
            {/* Stroke Color Section */}
            <div className="space-y-3">
                <Label className="text-xs text-muted-foreground font-semibold tracking-wider">STROKE</Label>
                <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => setStrokeColor(color)}
                            className={`h-8 w-8 rounded-full border-2 transition-all ${strokeColor === color ? "border-primary scale-110" : "border-transparent hover:scale-105"
                                }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select color ${color}`}
                        />
                    ))}
                    {/* Custom Color Picker */}
                    <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="h-8 w-8 rounded-full cursor-pointer opacity-0 absolute"
                    // Logic: Make the input invisible but clickable over a specific button if needed, 
                    // or just add a colorful button that triggers this input.
                    // For simplicity, let's just stick to presets for now or add a label trigger.
                    />
                </div>
            </div>

            <Separator />

            {/* Stroke Width Section */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <Label className="text-xs text-muted-foreground font-semibold tracking-wider">WIDTH</Label>
                    <span className="text-xs text-muted-foreground">{strokeWidth}px</span>
                </div>
                <Slider
                    value={[strokeWidth]}
                    onValueChange={(vals) => setStrokeWidth(vals[0])}
                    min={1}
                    max={20}
                    step={1}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
            </div>

            <Separator />

            {/* Actions (Undo/Redo) */}
            <div className="space-y-3">
                <Label className="text-xs text-muted-foreground font-semibold tracking-wider">ACTIONS</Label>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={undo}
                        disabled={!canUndo}
                    >
                        <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={redo}
                        disabled={!canRedo}
                    >
                        <Redo2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}