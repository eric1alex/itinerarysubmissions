// Utility functions for the application

/**
 * Generate a unique ID for itineraries
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data: any, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Show toast notification
 */
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-primary'
    };

    toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}
