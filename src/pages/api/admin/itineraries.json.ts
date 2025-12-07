import type { APIRoute } from 'astro';
import { db, Itinerary, eq } from 'astro:db';
import { isAdminAuthenticated } from '../../../lib/admin-auth';

export const prerender = false;

// GET: List all itineraries
export const GET: APIRoute = async ({ cookies }) => {
    if (!isAdminAuthenticated(cookies)) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Unauthorized'
        }), { status: 401 });
    }

    try {
        const itineraries = await db.select().from(Itinerary);
        return new Response(JSON.stringify({
            success: true,
            itineraries
        }), { status: 200 });
    } catch (error) {
        console.error('Error fetching itineraries:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to fetch itineraries'
        }), { status: 500 });
    }
};

// DELETE: Delete itinerary by ID
export const DELETE: APIRoute = async ({ request, cookies }) => {
    if (!isAdminAuthenticated(cookies)) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Unauthorized'
        }), { status: 401 });
    }

    try {
        const { id } = await request.json();

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Itinerary ID is required'
            }), { status: 400 });
        }

        await db.delete(Itinerary).where(eq(Itinerary.id, id));

        return new Response(JSON.stringify({
            success: true,
            message: 'Itinerary deleted successfully'
        }), { status: 200 });
    } catch (error) {
        console.error('Error deleting itinerary:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to delete itinerary'
        }), { status: 500 });
    }
};
