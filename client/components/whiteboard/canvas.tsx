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
        handleAddText,
        handleTextClick,
        initialTextValue,
        handleDragEnd,
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
        <div className={`relative h-full w-full bg-gray-50 overflow-hidden ${tool === "hand" ? "cursor-grab active:cursor-grabbing" : ""}`}>
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
                                    x={layer.x || 0}
                                    y={layer.y || 0}
                                    points={layer.points}
                                    stroke={layer.stroke}
                                    strokeWidth={layer.strokeWidth}
                                    tension={0.5}
                                    lineCap="round"
                                    lineJoin="round"
                                    globalCompositeOperation={
                                        layer.type === "eraser" ? "destination-out" : "source-over"
                                    }
                                    draggable={tool === "select"}
                                    onDragEnd={(e) => handleDragEnd(e, layer.id)}
                                    onMouseEnter={(e) => { if (tool === "select") e.target.getStage()!.container().style.cursor = "move"; }}
                                    onMouseLeave={(e) => { if (tool === "select") e.target.getStage()!.container().style.cursor = "default"; }}

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
                                    draggable={tool === "select"}
                                    onDragEnd={(e) => handleDragEnd(e, layer.id)}
                                    onMouseEnter={(e) => { if (tool === "select") e.target.getStage()!.container().style.cursor = "move"; }}
                                    onMouseLeave={(e) => { if (tool === "select") e.target.getStage()!.container().style.cursor = "default"; }}
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
                                    draggable={tool === "select"}
                                    onDragEnd={(e) => handleDragEnd(e, layer.id)}
                                    onMouseEnter={(e) => { if (tool === "select") e.target.getStage()!.container().style.cursor = "move"; }}
                                    onMouseLeave={(e) => { if (tool === "select") e.target.getStage()!.container().style.cursor = "default"; }}
                                />
                            );
                        }
                        return null;
                    })}
                </Layer>
                {/* LAYER 2: Text (Unaffected by Eraser) */}
                <Layer>
                    {layers.map((layer) => {
                        if (layer.type === "text" && layer.text) {
                            // If we are currently editing this specific text, HIDE it from canvas 
                            // (so it doesn't overlap the input box)
                            if (typingPosition && layer.x === typingPosition.x && layer.y === typingPosition.y) {
                                return null;
                            }

                            return (
                                <Text
                                    key={layer.id}
                                    x={layer.x}
                                    y={layer.y}
                                    text={layer.text}
                                    fontSize={24}
                                    fill={layer.fill || "#000000"}
                                    fontFamily="sans-serif"
                                    draggable={tool === "select"}
                                    onDragEnd={(e) => handleDragEnd(e, layer.id)}
                                    // onMouseEnter={(e) => { if (tool === "select") e.target.getStage()!.container().style.cursor = "move"; }}
                                    // onMouseLeave={(e) => { if (tool === "select") e.target.getStage()!.container().style.cursor = "default"; }}
                                    // NEW: Handle Edit Click
                                    onClick={(e) => {
                                        // Stop event bubble so we don't trigger canvas click
                                        e.cancelBubble = true;
                                        handleTextClick(layer.id, layer.x, layer.y, layer.text || "");
                                    }}
                                    onTap={(e) => {
                                        e.cancelBubble = true;
                                        handleTextClick(layer.id, layer.x, layer.y, layer.text || "");
                                    }}
                                    // Show pointer cursor if in select mode
                                    onMouseEnter={(e) => {
                                        if (tool === 'select') {
                                            const container = e.target.getStage()?.container();
                                            if (container) container.style.cursor = "pointer";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (tool === 'select') {
                                            const container = e.target.getStage()?.container();
                                            if (container) container.style.cursor = "default";
                                        }
                                    }}
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
                    initialValue={initialTextValue} // Pass the edit value
                    onComplete={(text) => handleAddText(text)}
                    onCancel={() => setTypingPosition(null)}
                />
            )}
        </div>
    );
}