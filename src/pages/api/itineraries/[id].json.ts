import type { APIRoute } from 'astro';
import { db, Itinerary, User, eq } from 'astro:db';
import { getUserFromRequest } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
    try {
        const { id } = params;
        const currentUser = getUserFromRequest(request);

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Itinerary ID is required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

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

        // Check if user is the owner (for edit permissions)
        const isOwner = currentUser && currentUser.userId === itinerary.userId;

        return new Response(JSON.stringify({
            success: true,
            itinerary: {
                id: itinerary.id,
                title: itinerary.title,
                summary: itinerary.summary,
                fromLocation: itinerary.fromLocation,
                toLocation: itinerary.toLocation,
                startDate: itinerary.startDate,
                endDate: itinerary.endDate,
                duration: itinerary.duration,
                tripType: itinerary.tripType,
                budget: itinerary.budget,
                transport: itinerary.transport,
                days: itinerary.days,
                tags: itinerary.tags,
                coverImage: itinerary.coverImage,
                createdAt: itinerary.createdAt,
                updatedAt: itinerary.updatedAt,
            },
            isOwner
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error fetching itinerary:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to fetch itinerary'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
