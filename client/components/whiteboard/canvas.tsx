"use client";

import { Stage, Layer, Line, Rect, Circle, Text } from "react-konva";
import { useDraw } from "@/hooks/use-draw";
import { useEffect, useState } from "react";
import { TextInput } from "./text-input";
import { useCanvasStore } from "@/store/canvas-store"; // Import store

export function WhiteboardCanvas() {
    const { tool } = useCanvasStore(); // Get tool from store

    const {
        layers,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        typingPosition,
        setTypingPosition,
        handleAddText
    } = useDraw();

    console.log("🎨 Canvas Render. Typing Position is:", typingPosition);
    // Fix for Next.js "window is not defined" error with Konva
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="h-full w-full bg-white" />;
    }

    return (
        <div className={`relative h-full w-full bg-blue-200 overflow-hidden ${tool === "hand" ? "cursor-grab active:cursor-grabbing" : ""}`}>
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                draggable={tool === "hand"}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="touch-none"
            >
                <Layer>
                    {layers.map((layer) => {
                        if (layer.type === "pencil" || layer.type === "eraser") {
                            return (
                                <Line
                                    key={layer.id}
                                    points={layer.points}
                                    stroke={layer.stroke}
                                    strokeWidth={layer.strokeWidth}
                                    tension={0.5}
                                    lineCap="round"
                                    lineJoin="round"
                                    globalCompositeOperation={
                                        layer.type === "eraser" ? "destination-out" : "source-over"
                                    }
                                />
                            );
                        }
                        if (layer.type === "rectangle") {
                            return (
                                <Rect
                                    key={layer.id}
                                    x={layer.x}
                                    y={layer.y}
                                    width={layer.width}
                                    height={layer.height}
                                    stroke={layer.stroke}
                                    strokeWidth={layer.strokeWidth}
                                />
                            );
                        }
                        if (layer.type === "circle") {
                            return (
                                <Circle
                                    key={layer.id}
                                    x={layer.x}
                                    y={layer.y}
                                    // Konva circles use radius, but we stored width (diameter)
                                    radius={layer.width ? layer.width / 2 : 0}
                                    stroke={layer.stroke}
                                    strokeWidth={layer.strokeWidth}
                                    fill={layer.fill}
                                />
                            );
                        }
                        if (layer.type === "text" && layer.text) {
                            return (
                                <Text
                                    key={layer.id}
                                    x={layer.x}
                                    y={layer.y}
                                    text={layer.text}
                                    fontSize={24}
                                    fill={layer.fill || "#000000"} // Text color
                                    fontFamily="sans-serif"
                                />
                            );
                        }
                        return null;
                    })}
                </Layer>
            </Stage>
            {typingPosition && (
                <TextInput
                    x={typingPosition.x}
                    y={typingPosition.y}
                    onComplete={(text) => handleAddText(text)}
                    onCancel={() => setTypingPosition(null)}
                />
            )}
        </div>
    );
}