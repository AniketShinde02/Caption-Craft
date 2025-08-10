import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;

if (!host || !port || !user || !pass) {
  console.warn('SMTP configuration is incomplete. Forgot-password emails will log the URL in the server console.');
}

export const transporter = (host && port && user && pass)
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // Brevo uses 587 typically (STARTTLS)
      auth: { user, pass },
    })
  : null;

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  // Always log the URL in dev to make testing easy
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] Password reset URL:', resetUrl);
  }
  if (!transporter) {
    return { queued: false, logged: true };
  }
  
  // Get base URL for production links
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://captioncraft.vercel.app';
  const productionResetUrl = resetUrl.replace(/http:\/\/localhost:\d+/, baseUrl);
  
  try {
    const info = await transporter.sendMail({
      from: `CaptionCraft <${from}>`,
      to,
      subject: '🔐 Reset Your CaptionCraft Password - Action Required',
      text: `Hi there!\n\nWe received a request to reset your CaptionCraft password.\n\nTo reset your password, click this link (valid for 1 hour):\n${productionResetUrl}\n\n⚠️ If this email landed in your spam folder, please mark it as "Not Spam" to ensure you receive future communications from us.\n\nIf you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.\n\nBest regards,\nThe CaptionCraft Team\n\n---\nCaptionCraft - AI-Powered Caption Generation\nhttps://captioncraft.com`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Reset Your CaptionCraft Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(255, 255, 255, 0.2); padding: 8px; border-radius: 8px;">
                  <div style="width: 24px; height: 24px; color: white; font-size: 20px;">✨</div>
                </div>
                <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">CaptionCraft</h1>
              </div>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">AI-Powered Caption Generation</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 32px;">
              <h2 style="margin: 0 0 24px 0; color: #1f2937; font-size: 28px; font-weight: 700; text-align: center;">🔐 Reset Your Password</h2>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Hello there!</p>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We received a request to reset your CaptionCraft password. To proceed with resetting your password, please click the button below.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${productionResetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.2s ease;">Reset My Password</a>
              </div>
              
              <!-- Security Info -->
              <div style="background-color: #f3f4f6; border-left: 4px solid #fbbf24; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600; font-size: 14px;">⚠️ Important Security Notice:</p>
                <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.5;">
                  <li>This link is valid for only <strong>1 hour</strong></li>
                  <li>The link can only be used once</li>
                  <li>If this email is in your spam folder, please mark it as "Not Spam"</li>
                </ul>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                If the button above doesn't work, you can copy and paste this link into your browser:
              </p>
              
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin: 16px 0; word-break: break-all;">
                <code style="color: #374151; font-size: 14px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;">${productionResetUrl}</code>
              </div>
              
              <!-- Help Section -->
              <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 20px; margin: 32px 0;">
                <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">📧 Email Delivery Notice</h3>
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5;">
                  If this email ended up in your <strong>spam/junk folder</strong>, please mark it as "Not Spam" or add <strong>ai.captioncraft@outlook.com</strong> to your contacts. This helps ensure you receive important updates from CaptionCraft.
                </p>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong>Didn't request this?</strong> You can safely ignore this email. Your password will remain unchanged. However, if you keep receiving these emails, please contact our support team.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Best regards,</p>
              <p style="margin: 0 0 16px 0; color: #374151; font-weight: 600; font-size: 16px;">The CaptionCraft Team</p>
              
              <div style="margin: 20px 0;">
                <a href="${baseUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">Visit CaptionCraft →</a>
              </div>
              
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                CaptionCraft - AI-Powered Caption Generation for Creators Worldwide<br>
                © 2024 CaptionCraft. All rights reserved.
              </p>
            </div>
            
          </div>
          
          <!-- Email client compatibility styles -->
          <div style="display: none; max-height: 0; overflow: hidden;">
            CaptionCraft password reset request. Click to reset your password securely. This email contains important security information for your account.
          </div>
          
        </body>
        </html>
      `,
    });
    console.log('SMTP message queued. id:', info.messageId, 'response:', info.response);
    return { queued: true, messageId: info.messageId };
  } catch (err) {
    console.error('SMTP send failed:', err);
    // Still surface the URL in logs for manual testing
    return { queued: false, error: String(err) };
  }
}

interface ContactConfirmationData {
  name: string;
  email: string;
  subject: string;
  message: string;
  submissionId: string;
}

export async function sendContactConfirmationEmail(data: ContactConfirmationData) {
  // Always log in dev for testing
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] Contact form submission:', {
      name: data.name,
      email: data.email,
      subject: data.subject,
      submissionId: data.submissionId
    });
  }

  if (!transporter) {
    console.log('📧 SMTP not configured - contact confirmation would be sent to:', data.email);
    return { queued: false, logged: true };
  }

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://captioncraft.vercel.app';

  try {
    const info = await transporter.sendMail({
      from: `CaptionCraft Support <${from}>`,
      to: data.email,
      subject: '✅ We received your message - CaptionCraft Support',
      text: `Hi ${data.name}!\n\nThank you for reaching out to CaptionCraft! We've successfully received your message.\n\nYour Message Details:\nSubject: ${data.subject}\nSubmission ID: ${data.submissionId}\n\nWhat happens next?\n• Our team will review your message within 24 hours\n• You'll receive a personalized response from our support team\n• For urgent matters, you can also reach us at support@captioncraft.ai\n\nIn the meantime, feel free to explore CaptionCraft and start creating amazing captions for your social media content!\n\nBest regards,\nThe CaptionCraft Team\n\n---\nCaptionCraft - AI-Powered Caption Generation\n${baseUrl}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Message Received - CaptionCraft</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(255, 255, 255, 0.2); padding: 8px; border-radius: 8px;">
                  <div style="width: 24px; height: 24px; color: white; font-size: 20px;">✨</div>
                </div>
                <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">CaptionCraft</h1>
              </div>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">AI-Powered Caption Generation</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 32px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; padding: 16px; margin-bottom: 16px;">
                  <div style="width: 32px; height: 32px; color: white; font-size: 28px; line-height: 32px;">✅</div>
                </div>
                <h2 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 700;">Message Received!</h2>
              </div>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Hi <strong>${data.name}</strong>!</p>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for reaching out to CaptionCraft! We've successfully received your message and our team is excited to help you.
              </p>
              
              <!-- Message Details -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">📋 Your Message Details</h3>
                <div style="margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Subject:</span>
                  <span style="color: #374151; font-size: 14px; margin-left: 8px;">${data.subject}</span>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Submission ID:</span>
                  <span style="color: #374151; font-size: 14px; margin-left: 8px; font-family: monospace;">${data.submissionId}</span>
                </div>
                <div>
                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Email:</span>
                  <span style="color: #374151; font-size: 14px; margin-left: 8px;">${data.email}</span>
                </div>
              </div>
              
              <!-- Next Steps -->
              <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 16px; font-weight: 600;">🚀 What happens next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Our team will review your message within <strong>24 hours</strong></li>
                  <li style="margin-bottom: 8px;">You'll receive a personalized response from our support team</li>
                  <li>For urgent matters, you can reach us directly at <strong>support@captioncraft.ai</strong></li>
                </ul>
              </div>
              
              <!-- CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px;">In the meantime, start creating amazing captions!</p>
                <a href="${baseUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">Explore CaptionCraft</a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                <strong>Need immediate help?</strong> Check out our <a href="${baseUrl}/help" style="color: #667eea; text-decoration: none;">Help Center</a> or email us directly.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Best regards,</p>
              <p style="margin: 0 0 16px 0; color: #374151; font-weight: 600; font-size: 16px;">The CaptionCraft Team</p>
              
              <div style="margin: 20px 0;">
                <a href="${baseUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">Visit CaptionCraft →</a>
              </div>
              
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                CaptionCraft - AI-Powered Caption Generation for Creators Worldwide<br>
                © 2024 CaptionCraft. All rights reserved.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
    });

    console.log('📧 Contact confirmation email sent to:', data.email, 'Message ID:', info.messageId);
    return { queued: true, messageId: info.messageId };

  } catch (err) {
    console.error('📧 Failed to send contact confirmation email:', err);
    return { queued: false, error: String(err) };
  }
}
