import * as React from "react"

function Badge({
    className,
    variant = "default",
    children,
    ...props
}) {
    const baseStyles = {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 9999,
        border: "1px solid transparent",
        padding: "2px 10px",
        fontSize: "12px",
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
    }

    const outputStyles = { ...baseStyles }

    if (variant === "default") {
        outputStyles.backgroundColor = "#F3F4F6" // bg-gray-100
        outputStyles.color = "#111827" // text-gray-900
    } else if (variant === "secondary") {
        outputStyles.backgroundColor = "#EEF2FF" // bg-indigo-50
        outputStyles.color = "#4F46E5" // text-indigo-600
    } else if (variant === "outline") {
        outputStyles.border = "1px solid #E5E7EB" // border-gray-200
    } else if (variant === "destructive") {
        outputStyles.backgroundColor = "#FEE2E2"
        outputStyles.color = "#EF4444"
    }

    return (
        <div style={outputStyles} className={className} {...props}>
            {children}
        </div>
    );
}

export { Badge }
