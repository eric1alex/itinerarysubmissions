import type { APIRoute } from 'astro';
import { db, User, eq } from 'astro:db';
import { isAdminAuthenticated } from '../../../../lib/admin-auth';

export const prerender = false;

// PUT: Update user
export const PUT: APIRoute = async ({ params, request, cookies }) => {
    if (!isAdminAuthenticated(cookies)) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Unauthorized'
        }), { status: 401 });
    }

    try {
        const { id } = params;
        const { displayName } = await request.json();

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: 'User ID is required'
            }), { status: 400 });
        }

        // Update user
        await db.update(User)
            .set({ displayName: displayName || null })
            .where(eq(User.id, id));

        return new Response(JSON.stringify({
            success: true,
            message: 'User updated successfully'
        }), { status: 200 });
    } catch (error) {
        console.error('Error updating user:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to update user'
        }), { status: 500 });
    }
};
