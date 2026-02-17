import { useState, useEffect } from "react";
import { Layer } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useCanvasStore } from "@/store/canvas-store";
import { useSocket } from "@/hooks/use-socket";

export const useDraw = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const socket = useSocket();
    const roomId = "demo-room";

    const {
        tool,
        strokeColor,
        strokeWidth,
        fillColor,
        layers,
        setLayers,
        saveHistory
    } = useCanvasStore();

    // 1. NEW: LOAD DATA FROM MONGODB ON MOUNT
    useEffect(() => {
        async function fetchDrawings() {
            try {
                const res = await fetch(`http://localhost:3001/api/drawings/${roomId}`);
                const data = await res.json();
                // If we found drawings in the DB, load them into the store
                if (data && data.length > 0) {
                    setLayers(data);
                }
            } catch (error) {
                console.error("Failed to fetch drawings:", error);
            }
        }
        fetchDrawings();
    }, [roomId, setLayers]);

    // 2. LISTEN FOR SOCKET EVENTS (Collaborators)
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
                points: data.type === "pencil" ? [data.x, data.y] : [],
                width: 0,
                height: 0,
            };
            setLayers((prev) => [...prev, newLayer]);
        });

        socket.on("draw_move", (data: any) => {
            setLayers((prev) => {
                return prev.map((layer) => {
                    if (layer.id !== data.layerId) return layer;

                    if (layer.type === "pencil") {
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

        return () => {
            socket.off("draw_start");
            socket.off("draw_move");
        };
    }, [socket, setLayers]);


    // 3. MOUSE HANDLERS
    const handleMouseDown = (e: any) => {
        if (tool === "select" || tool === "hand") return;

        setIsDrawing(true);
        const pos = e.target.getStage().getPointerPosition();
        const newId = uuidv4();

        const newLayer: Layer = {
            id: newId,
            type: tool as any,
            x: pos.x,
            y: pos.y,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            points: tool === "pencil" ? [pos.x, pos.y] : [],
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
                stroke: strokeColor,
                strokeWidth: strokeWidth
            });
        }
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing) return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        let currentLayerId = "";

        setLayers((prevLayers) => {
            const lastLayer = { ...prevLayers[prevLayers.length - 1] };
            currentLayerId = lastLayer.id;

            if (lastLayer.type === "pencil") {
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
            // Use the *last* known layer from the state to get Start X/Y
            // Note: In a production app, we would use a Ref for startPos to be safer,
            // but this works for now because layers is fresh in this render.
            const lastLayer = layers[layers.length - 1];

            // Safety check to prevent crashing if layer isn't ready
            if (!lastLayer) return;

            const startX = lastLayer.x;
            const startY = lastLayer.y;

            if (tool === "pencil") {
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
                socket.emit("draw_move", {
                    roomId,
                    layerId: currentLayerId,
                    r: radius,
                });
            }
        }
    };

    const handleMouseUp = async () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveHistory();

            // NEW: SAVE TO DATABASE
            // Get the layer we just finished drawing
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

                    // Cleanup socket event
                    if (socket) {
                        socket.emit("draw_end", { roomId });
                    }
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
    };
};