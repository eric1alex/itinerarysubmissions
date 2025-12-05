import type { APIRoute } from 'astro';
import type { Itinerary } from '../../../types/itinerary';
import { db, Itinerary as ItineraryTable } from 'astro:db';
import { parseSession } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        // Debug: Log session cookie
        console.log('Session cookie:', cookies.get('session'));

        // Get authenticated user from Astro cookies (not request headers)
        const sessionCookie = cookies.get('session');
        const user = sessionCookie?.value ? parseSession(sessionCookie.value) : null;
        console.log('User from session:', user);

        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Not authenticated'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data: Itinerary = await request.json();

        const now = new Date();

        // Save to Astro DB
        await db.insert(ItineraryTable).values({
            id: data.id,
            userId: user.userId,
            title: data.title,
            summary: data.summary,
            location: data.location,
            startDate: data.startDate,
            endDate: data.endDate,
            duration: data.duration,
            tripType: data.tripType,
            budget: data.budget || '',
            transport: data.transport || '',
            days: data.days,
            tags: data.tags,
            coverImage: data.coverImage,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        return new Response(JSON.stringify({
            success: true,
            id: data.id,
            message: 'Itinerary saved successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error saving itinerary:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to save itinerary'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
