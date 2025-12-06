// Authentication utilities for session and verification

/**
 * Generate a 4-digit verification code
 */
export function generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate a secure magic link token
 */
export function generateMagicToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a unique user ID
 */
export function generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create session cookie options
 */
export function getSessionCookieOptions() {
    return {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    };
}

/**
 * Parse session from cookie value
 */
export function parseSession(cookieValue: string | undefined): { userId: string; email: string; displayName?: string } | null {
    if (!cookieValue) return null;

    try {
        // URL-decode the cookie value first (handles %3D -> = etc)
        const urlDecoded = decodeURIComponent(cookieValue);
        const decoded = atob(urlDecoded);
        const data = JSON.parse(decoded);
        return data;
    } catch {
        return null;
    }
}

/**
 * Create session cookie value
 */
export function createSessionValue(userId: string, email: string, displayName?: string): string {
    const data = JSON.stringify({ userId, email, displayName });
    return btoa(data);
}

/**
 * Get user from request
 */
export function getUserFromRequest(request: Request): { userId: string; email: string; displayName?: string } | null {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => {
            const [key, ...v] = c.split('=');
            return [key, v.join('=')];
        })
    );

    return parseSession(cookies.session);
}
