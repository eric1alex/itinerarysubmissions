import type { APIRoute } from 'astro';
import { db, VerificationCode } from 'astro:db';
import { generateMagicToken } from '../../../lib/auth';
import { sendMagicLink } from '../../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid email address'
            }), { status: 400 });
        }

        // Generate magic token
        const token = generateMagicToken();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save to database
        await db.insert(VerificationCode).values({
            id: `ml_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            email: email.toLowerCase(),
            code: token, // Reusing code field for magic token
            purpose: 'login',
            expiresAt,
            createdAt: new Date(),
        });

        // Send magic link email
        const baseUrl = url.origin;
        const sent = await sendMagicLink(email, token, baseUrl);

        if (!sent) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Failed to send email'
            }), { status: 500 });
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Magic link sent to your email'
        }), { status: 200 });

    } catch (error) {
        console.error('Error sending magic link:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'An error occurred'
        }), { status: 500 });
    }
};
