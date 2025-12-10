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

// POST: Create a new user (admin only, no OTP)
export const POST: APIRoute = async ({ request, cookies }) => {
    if (!isAdminAuthenticated(cookies)) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Unauthorized'
        }), { status: 401 });
    }

    try {
        const { email, displayName } = await request.json();

        if (!email) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Email is required'
            }), { status: 400 });
        }

        // Check if user already exists
        const existingUsers = await db.select().from(User).where(eq(User.email, email));
        if (existingUsers.length > 0) {
            return new Response(JSON.stringify({
                success: false,
                message: 'User with this email already exists'
            }), { status: 400 });
        }

        const now = new Date();
        const userId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        await db.insert(User).values({
            id: userId,
            email: email.toLowerCase().trim(),
            displayName: displayName || null,
            createdAt: now,
            lastLoginAt: null,
        });

        return new Response(JSON.stringify({
            success: true,
            message: 'User created successfully',
            id: userId
        }), { status: 200 });
    } catch (error) {
        console.error('Error creating user:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to create user'
        }), { status: 500 });
    }
};
