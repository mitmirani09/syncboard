"use client";

import { Stage, Layer, Line, Rect, Circle } from "react-konva";
import { useDraw } from "@/hooks/use-draw";
import { useEffect, useState } from "react";

export function WhiteboardCanvas() {
    const {
        layers,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    } = useDraw();

    // Fix for Next.js "window is not defined" error with Konva
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="h-full w-full bg-white" />;
    }

    return (
        <div className="h-full w-full bg-gray-50 overflow-hidden">
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="touch-none"
            >
                <Layer>
                    {layers.map((layer) => {
                        if (layer.type === "pencil") {
                            return (
                                <Line
                                    key={layer.id}
                                    points={layer.points}
                                    stroke={layer.stroke}
                                    strokeWidth={layer.strokeWidth}
                                    tension={0.5}
                                    lineCap="round"
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
                        return null;
                    })}
                </Layer>
            </Stage>
        </div>
    );
}