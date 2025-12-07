import type { APIRoute } from 'astro';
import { db, Itinerary, eq, and } from 'astro:db';
import { parseSession } from '../../../../lib/auth';

export const prerender = false;

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
    try {
        const { id } = params;

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Itinerary ID is required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get authenticated user
        const sessionCookie = cookies.get('session');
        const user = sessionCookie?.value ? parseSession(sessionCookie.value) : null;

        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Not authenticated'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if itinerary exists and belongs to user
        const itineraries = await db
            .select()
            .from(Itinerary)
            .where(eq(Itinerary.id, id));

        if (itineraries.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Itinerary not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const itinerary = itineraries[0];

        // Verify ownership
        if (itinerary.userId !== user.userId) {
            return new Response(JSON.stringify({
                success: false,
                message: 'You do not have permission to delete this itinerary'
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete the itinerary
        await db.delete(Itinerary).where(eq(Itinerary.id, id));

        return new Response(JSON.stringify({
            success: true,
            message: 'Itinerary deleted successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error deleting itinerary:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to delete itinerary'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
