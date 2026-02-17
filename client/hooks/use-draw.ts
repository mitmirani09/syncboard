import { useState, useRef } from "react";
import { Layer } from "@/types"; // This import works because @ points to root
import { v4 as uuidv4 } from "uuid";

export const useDraw = () => {
    const [layers, setLayers] = useState<Layer[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<"pencil" | "rectangle">("pencil");
    const [color, setColor] = useState("#000000");

    const handleMouseDown = (e: any) => {
        setIsDrawing(true);
        const pos = e.target.getStage().getPointerPosition();

        // Create a new layer
        const newLayer: Layer = {
            id: uuidv4(),
            type: tool, // 'pencil' or 'rectangle'
            x: pos.x,
            y: pos.y,
            fill: tool === "rectangle" ? "transparent" : color,
            stroke: color,
            strokeWidth: 2,
            points: tool === "pencil" ? [pos.x, pos.y] : [],
            width: 0,
            height: 0,
        };

        setLayers([...layers, newLayer]);
    };

    const handleMouseMove = (e: any) => {
        // If not drawing, do nothing
        if (!isDrawing) return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();

        // Update the LAST layer we just added
        setLayers((prevLayers) => {
            // Create a shallow copy of the last layer
            const lastLayer = { ...prevLayers[prevLayers.length - 1] };

            if (lastLayer.type === "pencil") {
                // Add new point to the line
                lastLayer.points = lastLayer.points!.concat([point.x, point.y]);
            } else if (lastLayer.type === "rectangle") {
                // Update width/height
                lastLayer.width = point.x - lastLayer.x;
                lastLayer.height = point.y - lastLayer.y;
            }

            // Replace the last element
            return [...prevLayers.slice(0, -1), lastLayer];
        });
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    return {
        layers,
        tool,
        setTool,
        color,
        setColor,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    };
};