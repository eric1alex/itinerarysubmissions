// Admin authentication utilities
// Uses environment variables for single admin account

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
 * Create admin session value
 */
export function createAdminSession(email: string): string {
    const session: AdminSession = {
        isAdmin: true,
        email,
        loginAt: Date.now()
    };
    return Buffer.from(JSON.stringify(session)).toString('base64');
}

/**
 * Parse admin session from cookie value
 */
export function parseAdminSession(sessionValue: string): AdminSession | null {
    try {
        const decoded = Buffer.from(sessionValue, 'base64').toString('utf-8');
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
