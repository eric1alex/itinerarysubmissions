import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
    // Clear session cookie
    cookies.delete('session', { path: '/' });

    return new Response(JSON.stringify({
        success: true
    }), { status: 200 });
};
