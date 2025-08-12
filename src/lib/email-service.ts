// Email service utility for production use
// This file provides a unified interface for sending emails through various providers

import { transporter } from './mail';

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface EmailService {
  sendEmail(emailData: EmailData): Promise<boolean>;
}

// Brevo SMTP email service (using existing configuration)
export class BrevoEmailService implements EmailService {
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!transporter) {
        console.error('❌ SMTP transporter not configured');
        return false;
      }

      const info = await transporter.sendMail({
        from: `CaptionCraft Admin <${process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.body,
        html: emailData.html || emailData.body,
      });

      console.log('📧 Email sent via Brevo SMTP:', {
        to: emailData.to,
        messageId: info.messageId,
        response: info.response
      });

      return true;
    } catch (error) {
      console.error('❌ Brevo SMTP email error:', error);
      return false;
    }
  }
}

// Basic console email service (for development/testing when SMTP is not configured)
export class ConsoleEmailService implements EmailService {
  async sendEmail(emailData: EmailData): Promise<boolean> {
    console.log('📧 EMAIL SENT (Console Service):');
    console.log('📧 To:', emailData.to);
    console.log('📧 Subject:', emailData.subject);
    console.log('📧 Body:', emailData.body);
    if (emailData.html) {
      console.log('📧 HTML:', emailData.html);
    }
    console.log('📧 --- End Email ---');
    return true;
  }
}

// Factory function to get the appropriate email service
export function getEmailService(): EmailService {
  // Check if Brevo SMTP is configured
  if (transporter) {
    console.log('📧 Using Brevo SMTP email service');
    return new BrevoEmailService();
  }
  
  // Fallback to console service if SMTP is not configured
  console.warn('⚠️ SMTP not configured, falling back to console service');
  return new ConsoleEmailService();
}

// Helper function to send admin setup tokens
export async function sendAdminSetupToken(email: string, token: string): Promise<boolean> {
  const emailService = getEmailService();
  
  const emailData: EmailData = {
    to: email,
    subject: 'CaptionCraft Admin Setup Token',
    body: `Your admin setup token is: ${token}\n\nThis token expires in 24 hours.\n\nPlease use this token to complete the admin setup process.\n\nIf you did not request this token, please contact system administrators immediately.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔐 CaptionCraft Admin Setup Token</h2>
        <p>Your admin setup token has been generated successfully.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-family: monospace; font-size: 14px; word-break: break-all;">${token}</p>
        </div>
        <p><strong>⚠️ Important:</strong></p>
        <ul>
          <li>This token expires in 24 hours</li>
          <li>Keep this token secure and confidential</li>
          <li>Use this token to complete the admin setup process</li>
        </ul>
        <p>If you did not request this token, please contact system administrators immediately.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">This is an automated message from CaptionCraft Admin System.</p>
      </div>
    `
  };
  
  return await emailService.sendEmail(emailData);
}
