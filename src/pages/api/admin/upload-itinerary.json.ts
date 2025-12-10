import type { APIRoute } from "astro";
import { db, Itinerary, User, eq } from "astro:db";
import { isAdminAuthenticated } from "../../../lib/admin-auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    // Check admin authentication
    if (!isAdminAuthenticated(cookies)) {
        return new Response(
            JSON.stringify({ success: false, message: "Unauthorized" }),
            { status: 401 }
        );
    }

    try {
        const data = await request.json();

        // Validate required fields
        if (!data.title) {
            return new Response(
                JSON.stringify({ success: false, message: "Title is required" }),
                { status: 400 }
            );
        }

        if (!data.toLocation) {
            return new Response(
                JSON.stringify({ success: false, message: "Destination (toLocation) is required" }),
                { status: 400 }
            );
        }

        if (!data.summary) {
            return new Response(
                JSON.stringify({ success: false, message: "Summary is required" }),
                { status: 400 }
            );
        }

        if (!data.duration) {
            return new Response(
                JSON.stringify({ success: false, message: "Duration is required" }),
                { status: 400 }
            );
        }

        if (!data.days || !Array.isArray(data.days) || data.days.length === 0) {
            return new Response(
                JSON.stringify({ success: false, message: "At least one day with activities is required" }),
                { status: 400 }
            );
        }

        // Get userId from request or fall back to first user
        let userId = data.userId;

        if (!userId) {
            const adminUsers = await db.select().from(User).limit(1);
            if (adminUsers.length === 0) {
                return new Response(
                    JSON.stringify({ success: false, message: "No users found to assign itinerary" }),
                    { status: 400 }
                );
            }
            userId = adminUsers[0].id;
        }

        const now = new Date();
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // Insert the itinerary
        await db.insert(Itinerary).values({
            id,
            userId,
            title: data.title,
            summary: data.summary,
            fromLocation: data.fromLocation || null,
            toLocation: data.toLocation,
            startDate: data.startDate || null,
            endDate: data.endDate || null,
            duration: data.duration,
            tripType: data.tripType || null,
            budget: data.budget || null,
            transport: data.transport || null,
            days: data.days,
            tags: data.tags || [],
            coverImage: data.coverImage || null,
            authorName: data.authorName || null,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: "Itinerary created successfully",
                id
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error creating itinerary:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Failed to create itinerary" }),
            { status: 500 }
        );
    }
};
