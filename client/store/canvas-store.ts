import { create } from 'zustand'
import { Layer } from "@/types"; // Make sure you have this type defined

export type Tool = 'select' | 'hand' | 'pencil' | 'rectangle' | 'circle' | 'text' | 'eraser'

interface CanvasState {
    // Tools & Properties
    tool: Tool
    setTool: (tool: Tool) => void
    strokeColor: string
    setStrokeColor: (color: string) => void
    strokeWidth: number
    setStrokeWidth: (width: number) => void
    fillColor: string
    setFillColor: (color: string) => void

    // Layers & History
    layers: Layer[]
    setLayers: (layers: Layer[] | ((prev: Layer[]) => Layer[])) => void // Allow function update

    // History Stacks
    history: Layer[][] // Array of arrays (snapshots)
    historyStep: number // Where are we in the history?

    // Actions
    saveHistory: () => void
    undo: () => void
    redo: () => void
    canUndo: boolean
    canRedo: boolean
    clearCanvas: () => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    // ... (Previous Tools & Properties state remains same)
    tool: 'pencil',
    setTool: (tool) => set({ tool }),
    strokeColor: '#000000',
    setStrokeColor: (strokeColor) => set({ strokeColor }),
    strokeWidth: 3,
    setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
    fillColor: 'transparent',
    setFillColor: (fillColor) => set({ fillColor }),

    // Layers
    layers: [],
    setLayers: (newLayers) => {
        // Handle functional updates (prev => new)
        const currentLayers = get().layers;
        const updatedLayers = typeof newLayers === 'function' ? newLayers(currentLayers) : newLayers;
        set({ layers: updatedLayers });
    },

    // History
    history: [[]], // Initial state is empty canvas
    historyStep: 0,
    canUndo: false,
    canRedo: false,
    clearCanvas: () => set({ layers: [], history: [[]], historyStep: 0 }),

    saveHistory: () => {
        const { layers, history, historyStep } = get();
        // If we are in the middle of history and draw, we cut off the "future"
        const newHistory = history.slice(0, historyStep + 1);
        // Add current state
        newHistory.push([...layers]);

        set({
            history: newHistory,
            historyStep: newHistory.length - 1,
            canUndo: true,
            canRedo: false
        });
    },

    undo: () => {
        const { historyStep, history } = get();
        if (historyStep === 0) return;

        const prevStep = historyStep - 1;
        set({
            layers: history[prevStep], // Restore past layers
            historyStep: prevStep,
            canUndo: prevStep > 0,
            canRedo: true
        });
    },

    redo: () => {
        const { historyStep, history } = get();
        if (historyStep === history.length - 1) return;

        const nextStep = historyStep + 1;
        set({
            layers: history[nextStep], // Restore future layers
            historyStep: nextStep,
            canUndo: true,
            canRedo: nextStep < history.length - 1
        });
    }
}))