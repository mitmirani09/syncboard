export type LayerType = "rectangle" | "circle" | "line" | "pencil" | "text";

export interface Layer {
    id: string;
    type: LayerType;
    x: number;
    y: number;
    height?: number;
    width?: number;
    points?: number[]; // For pencil lines
    text?: string;
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity?: number;
}