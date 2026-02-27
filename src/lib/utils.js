
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function formatDate(date) {
    return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date))
}

export function getContrastColor(hexColor) {
    if (!hexColor || hexColor === 'transparent') return '#FFFFFF';

    // If it's not a hex color, return white as fallback
    if (!hexColor.startsWith('#')) return '#FFFFFF';

    try {
        // Convert hex to RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);

        // Calculate relative luminance
        // Using standard formula: 0.299*R + 0.587*G + 0.114*B
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Return black for light backgrounds, white for dark backgrounds
        return luminance > 0.55 ? '#000000' : '#FFFFFF';
    } catch (e) {
        return '#FFFFFF';
    }
}

export function getURL() {
    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set on Vercel
        'http://localhost:3000'

    // Make sure to include `https://` when not localhost
    url = url.includes('http') ? url : `https://${url}`
    // Make sure to include a trailing `/`
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
    return url
}
