import type { APIRoute } from 'astro';
import { db, VerificationCode, User, eq, and } from 'astro:db';
import { generateUserId, createSessionValue, getSessionCookieOptions } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Email and code are required'
            }), { status: 400 });
        }

        // Find valid verification code
        const verificationCodes = await db
            .select()
            .from(VerificationCode)
            .where(
                and(
                    eq(VerificationCode.email, email.toLowerCase()),
                    eq(VerificationCode.code, code),
                    eq(VerificationCode.purpose, 'submit')
                )
            );

        const verification = verificationCodes[0];

        if (!verification) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid verification code'
            }), { status: 400 });
        }

        // Check if expired
        if (new Date() > new Date(verification.expiresAt)) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Verification code has expired'
            }), { status: 400 });
        }

        // Check if user exists
        const existingUsers = await db
            .select()
            .from(User)
            .where(eq(User.email, email.toLowerCase()));

        let user = existingUsers[0];

        // Create user if doesn't exist (lazy registration!)
        if (!user) {
            const userId = generateUserId();
            await db.insert(User).values({
                id: userId,
                email: email.toLowerCase(),
                createdAt: new Date(),
                lastLoginAt: new Date(),
            });

            user = { id: userId, email: email.toLowerCase(), displayName: null };
        } else {
            // Update last login
            await db
                .update(User)
                .set({ lastLoginAt: new Date() })
                .where(eq(User.id, user.id));
        }

        // Delete used verification code
        await db
            .delete(VerificationCode)
            .where(eq(VerificationCode.id, verification.id));

        // Create session with displayName
        const sessionValue = createSessionValue(user.id, user.email, user.displayName || undefined);
        cookies.set('session', sessionValue, getSessionCookieOptions());

        return new Response(JSON.stringify({
            success: true,
            userId: user.id,
            email: user.email,
            displayName: user.displayName
        }), { status: 200 });

    } catch (error) {
        console.error('Error verifying code:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'An error occurred'
        }), { status: 500 });
    }
};
