"use client"

import { useState } from "react"
import { Menu, Sun, Moon, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip"

interface HeaderProps {
    isDark: boolean
    onToggleTheme: () => void
}

const collaborators = [
    { initials: "AK", color: "bg-primary" },
    { initials: "JD", color: "bg-chart-2" },
    { initials: "SM", color: "bg-chart-5" },
]

export function Header({ isDark, onToggleTheme }: HeaderProps) {
    const [fileName, setFileName] = useState("Untitled Project")
    const [isEditing, setIsEditing] = useState(false)

    return (
        <header className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between px-4">
            {/* Left Section */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/95 px-3 py-1.5 shadow-lg backdrop-blur-xl">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
                        <Layers className="size-3.5 text-primary-foreground" />
                    </div>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-lg"
                                aria-label="Menu"
                            >
                                <Menu className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={8}>
                            Menu
                        </TooltipContent>
                    </Tooltip>

                    <div className="mx-1 h-5 w-px bg-border" />

                    {isEditing ? (
                        <input
                            className="h-7 rounded-md border border-primary/30 bg-transparent px-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            onBlur={() => setIsEditing(false)}
                            onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
                            autoFocus
                            aria-label="Project name"
                        />
                    ) : (
                        <button
                            className="rounded-md px-2 py-0.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                            onClick={() => setIsEditing(true)}
                            aria-label="Edit project name"
                        >
                            {fileName}
                        </button>
                    )}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {/* Collaborators */}
                <div className="flex items-center rounded-xl border border-border/50 bg-card/95 px-3 py-1.5 shadow-lg backdrop-blur-xl">
                    <div className="flex -space-x-2">
                        {collaborators.map((collab) => (
                            <Avatar
                                key={collab.initials}
                                className="size-7 border-2 border-card"
                            >
                                <AvatarFallback
                                    className={`${collab.color} text-[10px] font-semibold text-primary-foreground`}
                                >
                                    {collab.initials}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        <div className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground">
                            +2
                        </div>
                    </div>
                </div>

                {/* Share Button */}
                <Button className="rounded-xl px-5 shadow-lg">Share</Button>

                {/* Theme Toggle */}
                <div className="rounded-xl border border-border/50 bg-card/95 shadow-lg backdrop-blur-xl">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-xl"
                                onClick={onToggleTheme}
                                aria-label="Toggle theme"
                            >
                                {isDark ? (
                                    <Sun className="size-4" />
                                ) : (
                                    <Moon className="size-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={8}>
                            {isDark ? "Light mode" : "Dark mode"}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </header>
    )
}
