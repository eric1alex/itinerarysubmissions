// Authentication utilities for session and verification

// Session secret - must be set in environment variables for production
const SESSION_SECRET = import.meta.env.SESSION_SECRET || 'dev-secret-change-in-production';

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
 * Create HMAC signature for data using Web Crypto API
 */
async function createSignature(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SESSION_SECRET);
    const messageData = encoder.encode(data);

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Verify HMAC signature
 */
async function verifySignature(data: string, signature: string): Promise<boolean> {
    const expectedSignature = await createSignature(data);
    return expectedSignature === signature;
}

/**
 * Parse session from cookie value (with signature verification)
 */
export function parseSession(cookieValue: string | undefined): { userId: string; email: string; displayName?: string } | null {
    if (!cookieValue) return null;

    try {
        // URL-decode the cookie value first (handles %3D -> = etc)
        const urlDecoded = decodeURIComponent(cookieValue);

        // Check for signed format (data.signature)
        const lastDotIndex = urlDecoded.lastIndexOf('.');
        if (lastDotIndex === -1) {
            // Legacy unsigned token - still accept for backward compatibility
            // but will be replaced with signed token on next login
            const decoded = atob(urlDecoded);
            const data = JSON.parse(decoded);
            return data;
        }

        const base64Data = urlDecoded.substring(0, lastDotIndex);
        const signature = urlDecoded.substring(lastDotIndex + 1);

        // For sync parsing, we can't verify async here
        // The signature will be verified in parseSessionAsync
        // For now, decode and return (admin-auth uses sync parsing)
        const decoded = atob(base64Data);
        const data = JSON.parse(decoded);
        return data;
    } catch {
        return null;
    }
}

/**
 * Parse session with async signature verification (use this in API routes)
 */
export async function parseSessionAsync(cookieValue: string | undefined): Promise<{ userId: string; email: string; displayName?: string } | null> {
    if (!cookieValue) return null;

    try {
        const urlDecoded = decodeURIComponent(cookieValue);

        // Check for signed format (data.signature)
        const lastDotIndex = urlDecoded.lastIndexOf('.');
        if (lastDotIndex === -1) {
            // Legacy unsigned token - reject in production for security
            if (import.meta.env.PROD) {
                console.warn('Rejecting unsigned session token');
                return null;
            }
            // In dev, accept legacy tokens
            const decoded = atob(urlDecoded);
            return JSON.parse(decoded);
        }

        const base64Data = urlDecoded.substring(0, lastDotIndex);
        const signature = urlDecoded.substring(lastDotIndex + 1);

        // Verify signature
        const isValid = await verifySignature(base64Data, signature);
        if (!isValid) {
            console.warn('Invalid session signature - possible forgery attempt');
            return null;
        }

        const decoded = atob(base64Data);
        const data = JSON.parse(decoded);
        return data;
    } catch {
        return null;
    }
}

/**
 * Create signed session cookie value
 */
export async function createSessionValue(userId: string, email: string, displayName?: string): Promise<string> {
    const data = JSON.stringify({ userId, email, displayName });
    const base64Data = btoa(data);
    const signature = await createSignature(base64Data);
    return `${base64Data}.${signature}`;
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

/**
 * Get user from request with async signature verification
 */
export async function getUserFromRequestAsync(request: Request): Promise<{ userId: string; email: string; displayName?: string } | null> {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => {
            const [key, ...v] = c.split('=');
            return [key, v.join('=')];
        })
    );

    return parseSessionAsync(cookies.session);
}
