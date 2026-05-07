import { useState, useEffect } from "react";
import { Layer } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useCanvasStore } from "@/store/canvas-store";
import { useSocket } from "@/hooks/use-socket";

export const useDraw = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [typingPosition, setTypingPosition] = useState<{ x: number; y: number } | null>(null);
    const [editingLayerId, setEditingLayerId] = useState<string | null>(null); // NEW: Track ID being edited
    const [initialTextValue, setInitialTextValue] = useState(""); // NEW: Pre-fill input
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
                text: data.text
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

        socket.on("layer_update", (data: any) => {
            setLayers((prev) => prev.map((layer) =>
                layer.id === data.layerId ? { ...layer, x: data.x, y: data.y } : layer
            ));
        });

        socket.on("clear_board", () => clearCanvas());

        return () => {
            socket.off("draw_start");
            socket.off("draw_move");
            socket.off("layer_update");
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

        // 1. SELECT TOOL LOGIC (Handling clicks on objects is done in Canvas via onClick, 
        //    but if we click empty space, we do nothing here)
        if (tool === "text") {
            // We must NOT open a new text box immediately.
            // We check if the active element is our textarea.
            if (document.activeElement?.tagName === "TEXTAREA") {
                return;
            }

            e.evt.preventDefault();
            const stage = e.target.getStage();
            const pos = stage.getRelativePointerPosition();

            setEditingLayerId(null); // New text, not editing
            setInitialTextValue(""); // Empty start
            setTypingPosition({ x: pos.x, y: pos.y });
            return; // Stop here, don't create a "drawing" layer yet
        }

        setIsDrawing(true);
        const pos = e.target.getStage().getRelativePointerPosition();
        const newId = uuidv4();

        const newLayer: Layer = {
            id: newId,
            type: tool as any,
            x: (tool === "pencil" || tool === "eraser") ? 0 : pos.x,
            y: (tool === "pencil" || tool === "eraser") ? 0 : pos.y,
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
                x: (tool === "pencil" || tool === "eraser") ? 0 : pos.x,
                y: (tool === "pencil" || tool === "eraser") ? 0 : pos.y,
                fill: fillColor,
                stroke: tool === "eraser" ? "#000000" : strokeColor,
                strokeWidth: tool === "eraser" ? 15 : strokeWidth,
            });
        }
    };

    const handleAddText = (text: string) => {
        if (!typingPosition) return;

        // 1. DELETE LOGIC: If text is empty, remove the layer
        if (!text.trim()) {
            if (editingLayerId) {
                // Remove existing layer
                setLayers((prev) => prev.filter(l => l.id !== editingLayerId));
                // TODO: Emit delete event to socket/DB if you want perfect sync
            }
            setTypingPosition(null);
            setEditingLayerId(null);
            return;
        }

        const layerId = editingLayerId || uuidv4();

        // 2. UPDATE OR CREATE
        if (editingLayerId) {
            // Update existing
            setLayers((prev) => prev.map(l =>
                l.id === editingLayerId ? { ...l, text: text } : l
            ));
            // In a real app, you'd emit an 'update_text' event here
        } else {
            // Create new
            const newLayer: Layer = {
                id: layerId,
                type: "text",
                x: typingPosition.x,
                y: typingPosition.y,
                text: text,
                fill: strokeColor,
                stroke: strokeColor,
                strokeWidth: 1,
                width: text.length * 10,
                height: 20,
            };
            setLayers([...layers, newLayer]);

            // Only emit create for new layers for now to keep it simple
            if (socket) {
                socket.emit("draw_start", {
                    roomId,
                    layerId,
                    type: "text",
                    x: typingPosition.x,
                    y: typingPosition.y,
                    text: text,
                    fill: strokeColor
                });
            }

            // Save to DB
            fetch("http://localhost:3001/api/drawings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomId,
                    layerId,
                    type: "text",
                    x: typingPosition.x,
                    y: typingPosition.y,
                    text: text,
                    fill: strokeColor,
                    stroke: strokeColor,
                    strokeWidth: 1
                }),
            });
        }

        saveHistory();
        setTypingPosition(null);
        setEditingLayerId(null);
        setInitialTextValue("");
    };

    // NEW: Handle clicking a text node in Select Mode
    const handleTextClick = (id: string, x: number, y: number, text: string) => {
        if (tool !== "select") return;

        setEditingLayerId(id);
        setInitialTextValue(text);
        setTypingPosition({ x, y });
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing) return;

        const stage = e.target.getStage();
        const point = stage.getRelativePointerPosition();
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

    // NEW: Handle Drag and Drop
    const handleDragEnd = async (e: any, layerId: string) => {
        if (tool !== "select") return;
        console.log("I just dragged a:", e.target.className);
        const node = e.target;
        const newX = node.x();
        const newY = node.y();

        // 1. Update local UI immediately
        setLayers((prev) => prev.map((layer) =>
            layer.id === layerId ? { ...layer, x: newX, y: newY } : layer
        ));
        saveHistory();

        // 2. Broadcast to room
        if (socket) {
            socket.emit("layer_update", { roomId, layerId, x: newX, y: newY });
        }

        // 3. Save to Database
        try {
            await fetch(`http://localhost:3001/api/drawings/${roomId}/${layerId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ x: newX, y: newY }),
            });
        } catch (error) {
            console.error("Failed to update layer position:", error);
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
        handleAddText,
        handleTextClick,
        initialTextValue,
        handleDragEnd
    };
};