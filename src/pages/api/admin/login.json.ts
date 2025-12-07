import type { APIRoute } from 'astro';
import { validateAdminCredentials, createAdminSession, getAdminSessionCookieOptions } from '../../../lib/admin-auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Email and password are required'
            }), { status: 400 });
        }

        if (!validateAdminCredentials(email, password)) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid credentials'
            }), { status: 401 });
        }

        // Create admin session
        const sessionValue = createAdminSession(email);
        cookies.set('admin_session', sessionValue, getAdminSessionCookieOptions());

        return new Response(JSON.stringify({
            success: true,
            message: 'Login successful'
        }), { status: 200 });

    } catch (error) {
        console.error('Admin login error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'An error occurred'
        }), { status: 500 });
    }
};
