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

        // Verify user exists in database (handles stale session cookies after DB reset)
        const existingUsers = await db
            .select()
            .from(User)
            .where(eq(User.id, user.userId));

        if (existingUsers.length === 0) {
            // User doesn't exist in DB - session is stale, force re-authentication
            cookies.delete('session', { path: '/' });
            return new Response(JSON.stringify({
                success: false,
                message: 'Session expired. Please log in again.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const dbUser = existingUsers[0];
        const authorName = dbUser.displayName || user.email;

        const data: Itinerary = await request.json();

        const now = new Date();

        // Check if this is an update (itinerary already exists)
        const existingItineraries = await db
            .select()
            .from(ItineraryTable)
            .where(eq(ItineraryTable.id, data.id));

        if (existingItineraries.length > 0) {
            // Update existing itinerary
            const existing = existingItineraries[0];

            // Verify the user owns this itinerary
            if (existing.userId !== user.userId) {
                return new Response(JSON.stringify({
                    success: false,
                    message: 'You do not have permission to edit this itinerary'
                }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Update the itinerary
            await db.update(ItineraryTable)
                .set({
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
                    updatedAt: now,
                })
                .where(eq(ItineraryTable.id, data.id));

            return new Response(JSON.stringify({
                success: true,
                id: data.id,
                message: 'Itinerary updated successfully'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create new itinerary
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
