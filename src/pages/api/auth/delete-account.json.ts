import type { APIRoute } from 'astro';
import { db, User, Itinerary, eq } from 'astro:db';
import { getUserFromRequest } from '../../../lib/auth';

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

        // Delete all itineraries by this user
        await db
            .delete(Itinerary)
            .where(eq(Itinerary.userId, user.userId));

        // Delete user
        await db
            .delete(User)
            .where(eq(User.id, user.userId));

        // Clear session
        cookies.delete('session', { path: '/' });

        return new Response(JSON.stringify({
            success: true,
            message: 'Account deleted successfully'
        }), { status: 200 });

    } catch (error) {
        console.error('Error deleting account:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'An error occurred'
        }), { status: 500 });
    }
};
