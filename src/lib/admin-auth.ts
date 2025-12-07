// Admin authentication utilities
// Uses environment variables for single admin account

// Session secret - must be set in environment variables for production
const SESSION_SECRET = import.meta.env.SESSION_SECRET || 'dev-secret-change-in-production';

export interface AdminSession {
    isAdmin: true;
    email: string;
    loginAt: number;
}

/**
 * Validate admin credentials against environment variables
 */
export function validateAdminCredentials(email: string, password: string): boolean {
    const adminEmail = import.meta.env.ADMIN_EMAIL;
    const adminPassword = import.meta.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.error('Admin credentials not configured in environment variables');
        return false;
    }

    return email.toLowerCase() === adminEmail.toLowerCase() && password === adminPassword;
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
 * Create signed admin session value
 */
export async function createAdminSession(email: string): Promise<string> {
    const session: AdminSession = {
        isAdmin: true,
        email,
        loginAt: Date.now()
    };
    const base64Data = btoa(JSON.stringify(session));
    const signature = await createSignature(base64Data);
    return `${base64Data}.${signature}`;
}

/**
 * Parse admin session from cookie value (sync - for compatibility)
 */
export function parseAdminSession(sessionValue: string): AdminSession | null {
    try {
        // Check for signed format (data.signature)
        const lastDotIndex = sessionValue.lastIndexOf('.');
        if (lastDotIndex === -1) {
            // Legacy unsigned token - accept in dev, reject in prod
            if (import.meta.env.PROD) {
                return null;
            }
            const decoded = atob(sessionValue);
            const session = JSON.parse(decoded) as AdminSession;
            if (!session.isAdmin || !session.email) return null;
            const sessionAge = Date.now() - session.loginAt;
            if (sessionAge > 24 * 60 * 60 * 1000) return null;
            return session;
        }

        const base64Data = sessionValue.substring(0, lastDotIndex);
        const decoded = atob(base64Data);
        const session = JSON.parse(decoded) as AdminSession;

        // Validate session structure
        if (!session.isAdmin || !session.email) {
            return null;
        }

        // Session expires after 24 hours
        const sessionAge = Date.now() - session.loginAt;
        if (sessionAge > 24 * 60 * 60 * 1000) {
            return null;
        }

        return session;
    } catch {
        return null;
    }
}

/**
 * Parse admin session with async signature verification
 */
export async function parseAdminSessionAsync(sessionValue: string): Promise<AdminSession | null> {
    try {
        const lastDotIndex = sessionValue.lastIndexOf('.');
        if (lastDotIndex === -1) {
            // Legacy unsigned token - reject in production
            if (import.meta.env.PROD) {
                console.warn('Rejecting unsigned admin session token');
                return null;
            }
            const decoded = atob(sessionValue);
            const session = JSON.parse(decoded) as AdminSession;
            if (!session.isAdmin || !session.email) return null;
            const sessionAge = Date.now() - session.loginAt;
            if (sessionAge > 24 * 60 * 60 * 1000) return null;
            return session;
        }

        const base64Data = sessionValue.substring(0, lastDotIndex);
        const signature = sessionValue.substring(lastDotIndex + 1);

        // Verify signature
        const isValid = await verifySignature(base64Data, signature);
        if (!isValid) {
            console.warn('Invalid admin session signature - possible forgery attempt');
            return null;
        }

        const decoded = atob(base64Data);
        const session = JSON.parse(decoded) as AdminSession;

        if (!session.isAdmin || !session.email) {
            return null;
        }

        const sessionAge = Date.now() - session.loginAt;
        if (sessionAge > 24 * 60 * 60 * 1000) {
            return null;
        }

        return session;
    } catch {
        return null;
    }
}

/**
 * Get admin session cookie options
 */
export function getAdminSessionCookieOptions() {
    return {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 // 24 hours
    };
}

/**
 * Check if request has valid admin session
 */
export function isAdminAuthenticated(cookies: { get: (name: string) => { value: string } | undefined }): boolean {
    const sessionCookie = cookies.get('admin_session');
    if (!sessionCookie?.value) {
        return false;
    }
    return parseAdminSession(sessionCookie.value) !== null;
}

/**
 * Get admin from cookies
 */
export function getAdminFromCookies(cookies: { get: (name: string) => { value: string } | undefined }): AdminSession | null {
    const sessionCookie = cookies.get('admin_session');
    if (!sessionCookie?.value) {
        return null;
    }
    return parseAdminSession(sessionCookie.value);
}
