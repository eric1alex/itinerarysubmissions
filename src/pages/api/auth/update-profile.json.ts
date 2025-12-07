import type { APIRoute } from 'astro';
import { db, User, eq } from 'astro:db';
import { getUserFromRequest, createSessionValue, getSessionCookieOptions } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const user = getUserFromRequest(request);

        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Not authenticated'
            }), { status: 401 });
        }

        const { displayName } = await request.json();

        if (displayName !== undefined && typeof displayName !== 'string') {
            return new Response(JSON.stringify({
                success: false,
                message: 'Display name must be a string'
            }), { status: 400 });
        }

        // Update user's display name in database
        const trimmedName = displayName?.trim() || null;

        await db
            .update(User)
            .set({ displayName: trimmedName })
            .where(eq(User.id, user.userId));

        // Update session cookie with new display name
        const sessionValue = await createSessionValue(user.userId, user.email, trimmedName || undefined);
        cookies.set('session', sessionValue, getSessionCookieOptions());

        return new Response(JSON.stringify({
            success: true,
            displayName: trimmedName
        }), { status: 200 });

    } catch (error) {
        console.error('Error updating profile:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'An error occurred'
        }), { status: 500 });
    }
};
