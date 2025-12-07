// Email service using Resend
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

/**
 * Send verification code email
 */
export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: 'Where In India <noreply@whereinindia.online>',
      to: email,
      subject: 'Your Verification Code - Where In India',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #333; max-width: 400px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <p style="margin: 0; font-weight: 600; font-size: 18px; color: #3A86FF;">Where In India</p>
            </div>
            
            <h2 style="font-size: 18px; margin: 0 0 12px; color: #333;">Verify Your Email</h2>
            <p style="margin: 0 0 20px; color: #555;">Thanks for sharing your travel itinerary! Here's your verification code:</p>
            
            <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
              <div style="font-size: 32px; font-weight: bold; color: #3A86FF; letter-spacing: 6px; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="margin: 0 0 4px; font-size: 13px; color: #666;">This code expires in <strong>10 minutes</strong>.</p>
            <p style="margin: 0; font-size: 13px; color: #666;">Didn't request this? Ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0 16px;">
            <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">© 2024 Where In India</p>
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
      from: 'Where In India <noreply@whereinindia.online>',
      to: email,
      subject: 'Login to Where In India',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #333; max-width: 400px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <p style="margin: 8px 0 0; font-weight: 600; color: #333;">Where In India</p>
            </div>
            
            <h2 style="font-size: 18px; margin: 0 0 12px; color: #333;">Welcome Back!</h2>
            <p style="margin: 0 0 20px; color: #555;">Click the button below to log in to your account:</p>
            
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="${magicLink}" style="display: inline-block; background: #3A86FF; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                Log In
              </a>
            </div>
            
            <p style="margin: 0 0 4px; font-size: 13px; color: #666;">This link expires in <strong>15 minutes</strong>.</p>
            <p style="margin: 0; font-size: 13px; color: #666;">Didn't request this? Ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0 16px;">
            <p style="margin: 0 0 8px; font-size: 11px; color: #999;">Or copy this link: <span style="word-break: break-all;">${magicLink}</span></p>
            <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">© 2024 Where In India</p>
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
