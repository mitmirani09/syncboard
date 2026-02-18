import { useState, useEffect } from "react";
import { Layer } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useCanvasStore } from "@/store/canvas-store";
import { useSocket } from "@/hooks/use-socket";

export const useDraw = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [typingPosition, setTypingPosition] = useState<{ x: number; y: number } | null>(null);
    const socket = useSocket();
    const roomId = "demo-room";
    const { clearCanvas } = useCanvasStore();

    const {
        tool,
        strokeColor,
        strokeWidth,
        fillColor,
        layers,
        setLayers,
        saveHistory
    } = useCanvasStore();

    // 1. LOAD DATA FROM DB
    useEffect(() => {
        async function fetchDrawings() {
            try {
                const res = await fetch(`http://localhost:3001/api/drawings/${roomId}`);
                const data = await res.json();
                if (data && data.length > 0) setLayers(data);
            } catch (error) {
                console.error("Failed to fetch drawings:", error);
            }
        }
        fetchDrawings();
    }, [roomId, setLayers]);

    // 2. SOCKET LISTENERS
    useEffect(() => {
        if (!socket) return;
        socket.emit("join_room", roomId);

        socket.on("draw_start", (data: any) => {
            const newLayer: Layer = {
                id: data.layerId,
                type: data.type,
                x: data.x,
                y: data.y,
                fill: data.fill,
                stroke: data.stroke,
                strokeWidth: data.strokeWidth,
                // FIX: Allow points for both pencil AND eraser
                points: (data.type === "pencil" || data.type === "eraser") ? [data.x, data.y] : [],
                width: 0,
                height: 0,
            };
            setLayers((prev) => [...prev, newLayer]);
        });

        socket.on("draw_move", (data: any) => {
            setLayers((prev) => {
                return prev.map((layer) => {
                    if (layer.id !== data.layerId) return layer;

                    // FIX: Update points for both pencil AND eraser
                    if (layer.type === "pencil" || layer.type === "eraser") {
                        return { ...layer, points: [...layer.points!, data.x, data.y] };
                    } else if (layer.type === "rectangle") {
                        return { ...layer, width: data.w, height: data.h };
                    } else if (layer.type === "circle") {
                        return { ...layer, width: data.r * 2, height: data.r * 2 };
                    }
                    return layer;
                });
            });
        });

        socket.on("clear_board", () => clearCanvas());

        return () => {
            socket.off("draw_start");
            socket.off("draw_move");
            socket.off("clear_board");
        };
    }, [socket, setLayers, clearCanvas]);

    const handleClear = async () => {
        if (!confirm("Are you sure you want to clear the board?")) return;
        clearCanvas();
        if (socket) socket.emit("clear_board", roomId);
        await fetch(`http://localhost:3001/api/drawings/${roomId}`, { method: "DELETE" });
    };

    // 3. MOUSE HANDLERS
    const handleMouseDown = (e: any) => {
        console.log("🖱️ Mouse Down! Current Tool:", tool);
        if (tool === "select" || tool === "hand") return;

        if (tool === "text") {
            e.evt.preventDefault();
            const stage = e.target.getStage();
            const pos = stage.getRelativePointerPosition();
            setTypingPosition({ x: pos.x, y: pos.y });
            return; // Stop here, don't create a "drawing" layer yet
        }

        setIsDrawing(true);
        const pos = e.target.getStage().getPointerPosition();
        const newId = uuidv4();

        const newLayer: Layer = {
            id: newId,
            type: tool as any,
            x: pos.x,
            y: pos.y,
            fill: fillColor,
            stroke: tool === "eraser" ? "#000000" : strokeColor,
            strokeWidth: tool === "eraser" ? 15 : strokeWidth,
            // FIX: Initialize points for eraser too!
            points: (tool === "pencil" || tool === "eraser") ? [pos.x, pos.y] : [],
            width: 0,
            height: 0,
        };

        setLayers([...layers, newLayer]);

        if (socket) {
            socket.emit("draw_start", {
                roomId,
                layerId: newId,
                type: tool,
                x: pos.x,
                y: pos.y,
                fill: fillColor,
                stroke: tool === "eraser" ? "#000000" : strokeColor,
                strokeWidth: tool === "eraser" ? 15 : strokeWidth,
            });
        }
    };

    // NEW: Function to save the text when user hits Enter
    const handleAddText = (text: string) => {
        if (!typingPosition) return;

        const newId = uuidv4();
        const newLayer: Layer = {
            id: newId,
            type: "text",
            x: typingPosition.x,
            y: typingPosition.y,
            text: text, // Save the text
            fill: strokeColor, // Use current color for text
            stroke: strokeColor,
            strokeWidth: 1,
            width: text.length * 10, // Rough estimate
            height: 20,
        };

        // Save Local
        setLayers([...layers, newLayer]);
        saveHistory();

        // Broadcast Socket
        if (socket) {
            socket.emit("draw_start", {
                roomId,
                layerId: newId,
                type: "text",
                x: typingPosition.x,
                y: typingPosition.y,
                text: text,
                fill: strokeColor
            });
        }

        // Save DB (Optional: Reuse the fetch logic from handleMouseUp or make a helper)
        // For now, let's just use the same pattern:
        fetch("http://localhost:3001/api/drawings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                roomId,
                layerId: newId,
                type: "text",
                x: typingPosition.x,
                y: typingPosition.y,
                text: text,
                fill: strokeColor,
                stroke: strokeColor,
                strokeWidth: 1
            }),
        });

        setTypingPosition(null); // Hide input
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing) return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        let currentLayerId = "";

        setLayers((prevLayers) => {
            const lastLayer = { ...prevLayers[prevLayers.length - 1] };
            currentLayerId = lastLayer.id;

            // FIX: Update points for eraser too!
            if (lastLayer.type === "pencil" || lastLayer.type === "eraser") {
                lastLayer.points = lastLayer.points!.concat([point.x, point.y]);
            }
            else if (lastLayer.type === "rectangle") {
                lastLayer.width = point.x - lastLayer.x;
                lastLayer.height = point.y - lastLayer.y;
            }
            else if (lastLayer.type === "circle") {
                const dx = point.x - lastLayer.x;
                const dy = point.y - lastLayer.y;
                const radius = Math.sqrt(dx * dx + dy * dy);
                lastLayer.width = radius * 2;
                lastLayer.height = radius * 2;
            }
            return [...prevLayers.slice(0, -1), lastLayer];
        });

        if (socket && currentLayerId) {
            const lastLayer = layers[layers.length - 1];
            if (!lastLayer) return;

            const startX = lastLayer.x;
            const startY = lastLayer.y;

            // FIX: Emit move events for eraser too!
            if (tool === "pencil" || tool === "eraser") {
                socket.emit("draw_move", {
                    roomId,
                    layerId: currentLayerId,
                    x: point.x,
                    y: point.y,
                });
            }
            else if (tool === "rectangle") {
                socket.emit("draw_move", {
                    roomId,
                    layerId: currentLayerId,
                    w: point.x - startX,
                    h: point.y - startY,
                });
            }
            else if (tool === "circle") {
                const dx = point.x - startX;
                const dy = point.y - startY;
                const radius = Math.sqrt(dx * dx + dy * dy);
                socket.emit("draw_move", { roomId, layerId: currentLayerId, r: radius });
            }
        }
    };

    const handleMouseUp = async () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveHistory();

            const lastLayer = layers[layers.length - 1];
            if (lastLayer) {
                try {
                    await fetch("http://localhost:3001/api/drawings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            roomId,
                            layerId: lastLayer.id,
                            type: lastLayer.type,
                            x: lastLayer.x,
                            y: lastLayer.y,
                            width: lastLayer.width,
                            height: lastLayer.height,
                            points: lastLayer.points,
                            fill: lastLayer.fill,
                            stroke: lastLayer.stroke,
                            strokeWidth: lastLayer.strokeWidth,
                        }),
                    });
                    if (socket) socket.emit("draw_end", { roomId });
                } catch (error) {
                    console.error("Failed to save drawing:", error);
                }
            }
        }
    };

    return {
        layers,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleClear,
        typingPosition,
        setTypingPosition,
        handleAddText
    };
};