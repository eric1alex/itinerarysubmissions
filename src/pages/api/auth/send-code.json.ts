import type { APIRoute } from 'astro';
import { db, VerificationCode } from 'astro:db';
import { generateVerificationCode } from '../../../lib/auth';
import { sendVerificationCode } from '../../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid email address'
            }), { status: 400 });
        }

        // Generate 4-digit code
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save to database
        await db.insert(VerificationCode).values({
            id: `vc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            email: email.toLowerCase(),
            code,
            purpose: 'submit',
            expiresAt,
            createdAt: new Date(),
        });

        // Log code for local development only (never in production)
        if (!import.meta.env.PROD) {
            console.log(`\n🔑 Verification code for ${email}: ${code}\n`);
        }

        // Send email
        const sent = await sendVerificationCode(email, code);

        if (!sent) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Failed to send email'
            }), { status: 500 });
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Verification code sent to your email'
        }), { status: 200 });

    } catch (error) {
        console.error('Error sending verification code:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'An error occurred'
        }), { status: 500 });
    }
};
