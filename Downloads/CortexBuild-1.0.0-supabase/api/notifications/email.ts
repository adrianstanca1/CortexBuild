import { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@cortexbuild.com';

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string;
    type: string;
  }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, text, cc, bcc, attachments }: EmailRequest = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    // Check if SendGrid is configured
    if (!SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured, simulating email send');
      
      // For development/testing - log the email instead of sending
      console.log('📧 Email would be sent:', {
        to,
        subject,
        html: html.substring(0, 100) + '...',
        text,
        cc,
        bcc,
        attachments: attachments?.length || 0
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully (simulated)',
        simulated: true
      });
    }

    // Prepare email data
    const emailData = {
      to: Array.isArray(to) ? to : [to],
      from: FROM_EMAIL,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      cc: cc || undefined,
      bcc: bcc || undefined,
      attachments: attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        type: att.type,
        disposition: 'attachment'
      })) || undefined
    };

    // Send email
    const response = await sgMail.send(emailData);
    
    console.log('📧 Email sent successfully:', {
      to,
      subject,
      messageId: response[0]?.headers?.['x-message-id']
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: response[0]?.headers?.['x-message-id']
    });

  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message,
      code: error.code
    });
  }
}

// Helper function to send notification emails
export async function sendNotificationEmail(
  to: string | string[],
  subject: string,
  content: {
    title: string;
    message: string;
    actionUrl?: string;
    priority?: string;
  }
): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${content.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; margin-bottom: 10px; }
            .title { font-size: 20px; font-weight: bold; color: #1f2937; margin: 20px 0 10px 0; }
            .message { font-size: 16px; line-height: 1.6; color: #4b5563; margin: 15px 0; }
            .priority { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .priority-urgent { background-color: #fee2e2; color: #dc2626; }
            .priority-high { background-color: #fed7aa; color: #ea580c; }
            .priority-medium { background-color: #fef3c7; color: #d97706; }
            .priority-low { background-color: #f3f4f6; color: #6b7280; }
            .action-button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">CortexBuild</div>
              <div style="color: #6b7280; font-size: 14px;">Project Management Platform</div>
            </div>
            
            <div class="title">${content.title}</div>
            
            ${content.priority ? `
              <div class="priority priority-${content.priority}">
                ${content.priority} Priority
              </div>
            ` : ''}
            
            <div class="message">${content.message}</div>
            
            ${content.actionUrl ? `
              <div style="text-align: center;">
                <a href="${content.actionUrl}" class="action-button">View Details</a>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>This email was sent by CortexBuild notification system.</p>
              <p>If you no longer wish to receive these notifications, you can update your preferences in your account settings.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text: `${content.title}\n\n${content.message}${content.actionUrl ? `\n\nView Details: ${content.actionUrl}` : ''}`
      })
    });

    if (!response.ok) {
      throw new Error(`Email API responded with status ${response.status}`);
    }

    const result = await response.json();
    return result.success;

  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
}
