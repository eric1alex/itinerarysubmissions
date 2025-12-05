// Email service using Resend
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

/**
 * Send verification code email
 */
export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
    try {
        await resend.emails.send({
            from: 'Where In India <onboarding@resend.dev>',
            to: email,
            subject: 'Your Verification Code - Where In India',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3A86FF 0%, #2563EB 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Where In India</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
              <p style="font-size: 16px; color: #555;">Thanks for sharing your travel itinerary! Here's your verification code:</p>
              
              <div style="background: white; border: 2px solid #3A86FF; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                <div style="font-size: 42px; font-weight: bold; color: #3A86FF; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>
              
              <p style="font-size: 14px; color: #666;">This code will expire in <strong>10 minutes</strong>.</p>
              <p style="font-size: 14px; color: #666;">If you didn't request this code, you can safely ignore this email.</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center;">
                © 2024 Where In India. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
        });

        return true;
    } catch (error) {
        console.error('Failed to send verification code:', error);
        return false;
    }
}

/**
 * Send magic link email
 */
export async function sendMagicLink(email: string, token: string, baseUrl: string): Promise<boolean> {
    const magicLink = `${baseUrl}/auth/magic?token=${token}`;

    try {
        await resend.emails.send({
            from: 'Where In India <onboarding@resend.dev>',
            to: email,
            subject: 'Login to Where In India',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3A86FF 0%, #2563EB 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Where In India</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Welcome Back!</h2>
              <p style="font-size: 16px; color: #555;">Click the button below to securely log in to your account:</p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${magicLink}" style="display: inline-block; background: #3A86FF; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(58, 134, 255, 0.3);">
                  Log In to My Account
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">This link will expire in <strong>15 minutes</strong>.</p>
              <p style="font-size: 14px; color: #666;">If you didn't request this link, you can safely ignore this email.</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999;">Or copy and paste this URL into your browser:</p>
              <p style="font-size: 11px; color: #999; word-break: break-all;">${magicLink}</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center;">
                © 2024 Where In India. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
        });

        return true;
    } catch (error) {
        console.error('Failed to send magic link:', error);
        return false;
    }
}
