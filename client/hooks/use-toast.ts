"use client"

import { toast as sonnerToast, type ExternalToast } from "sonner"

// Define the types that your old code expects
type ToastProps = {
    title?: React.ReactNode
    description?: React.ReactNode
    variant?: "default" | "destructive" | "success"
    action?: React.ReactNode
} & ExternalToast // Allow passing extra Sonner props

function toast({ title, description, variant, ...props }: ToastProps) {
    // Scenario 1: Destructive/Error Toast
    if (variant === "destructive") {
        return sonnerToast.error(title, {
            description: description,
            ...props,
        })
    }

    // Scenario 2: Success Toast (Optional, if you use it)
    if (variant === "success") {
        return sonnerToast.success(title, {
            description: description,
            ...props,
        })
    }

    // Scenario 3: Default / Info Toast
    return sonnerToast(title, {
        description: description,
        ...props,
    })
}

function useToast() {
    return {
        toast,
        dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
    }
}

export { useToast, toast }