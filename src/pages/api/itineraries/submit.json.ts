import type { APIRoute } from 'astro';
import type { Itinerary } from '../../../types/itinerary';
import { db, Itinerary as ItineraryTable, User, eq } from 'astro:db';
import { parseSession } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        // Get authenticated user from Astro cookies
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

        // Get user's display name from database if not in session
        let authorName = user.displayName || user.email;
        if (!user.displayName) {
            const users = await db
                .select()
                .from(User)
                .where(eq(User.id, user.userId));
            if (users[0]?.displayName) {
                authorName = users[0].displayName;
            }
        }

        const data: Itinerary = await request.json();

        const now = new Date();

        // Save to Astro DB
        await db.insert(ItineraryTable).values({
            id: data.id,
            userId: user.userId,
            title: data.title,
            summary: data.summary,
            fromLocation: data.fromLocation,
            toLocation: data.toLocation,
            startDate: data.startDate,
            endDate: data.endDate,
            duration: data.duration,
            tripType: data.tripType || '',
            budget: data.budget || '',
            transport: data.transport || '',
            days: data.days,
            tags: data.tags || [],
            coverImage: data.coverImage || null,
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
