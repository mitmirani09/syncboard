"use client";

import { useEffect, useRef } from "react";

interface TextInputProps {
    x: number;
    y: number;
    onComplete: (text: string) => void;
    onCancel: () => void;
}

export function TextInput({ x, y, onComplete, onCancel }: TextInputProps) {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // FIX ADDED: Wrap in setTimeout to run AFTER the click event finishes
        const timer = setTimeout(() => {
            if (ref.current) {
                ref.current.focus();
            }
        }, 0);

        return () => clearTimeout(timer); // Cleanup
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (ref.current?.value.trim()) {
                onComplete(ref.current.value);
            } else {
                onCancel();
            }
        }
        if (e.key === "Escape") {
            onCancel();
        }
    };

    const handleBlur = () => {
        if (ref.current?.value.trim()) {
            onComplete(ref.current.value);
        } else {
            onCancel();
        }
    };

    return (
        <textarea
            ref={ref}
            // CHANGE 1: 'fixed' -> 'absolute' is correct (keeps it relative to parent container)
            // CHANGE 2: 'bg-transparent' -> 'bg-white' (So you can actually SEE it!)
            // CHANGE 3: Added 'shadow-xl' and 'z-50' to make it pop out
            className="absolute z-50 min-h-[50px] min-w-[150px] resize overflow-hidden rounded-lg border-2 border-blue-500 bg-white p-3 text-lg text-black outline-none shadow-xl placeholder:text-gray-400"
            style={{
                left: x,
                top: y,
                fontFamily: "sans-serif",
            }}
            placeholder="Type here..."
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
        />
    );
}