import type { APIRoute } from 'astro';
import { db, User, Itinerary, eq } from 'astro:db';
import { isAdminAuthenticated } from '../../../lib/admin-auth';

export const prerender = false;

// GET: List all users
export const GET: APIRoute = async ({ cookies }) => {
    if (!isAdminAuthenticated(cookies)) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Unauthorized'
        }), { status: 401 });
    }

    try {
        const users = await db.select().from(User);
        return new Response(JSON.stringify({
            success: true,
            users
        }), { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to fetch users'
        }), { status: 500 });
    }
};

// DELETE: Delete user by ID
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
                message: 'User ID is required'
            }), { status: 400 });
        }

        // Delete all itineraries by this user first
        await db.delete(Itinerary).where(eq(Itinerary.userId, id));

        // Delete the user
        await db.delete(User).where(eq(User.id, id));

        return new Response(JSON.stringify({
            success: true,
            message: 'User deleted successfully'
        }), { status: 200 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to delete user'
        }), { status: 500 });
    }
};
