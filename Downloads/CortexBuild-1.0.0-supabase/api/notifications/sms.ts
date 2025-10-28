import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio
let twilioClient: twilio.Twilio | null = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

interface SMSRequest {
  to: string | string[];
  message: string;
  from?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, message, from }: SMSRequest = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, message' });
    }

    // Check if Twilio is configured
    if (!twilioClient) {
      console.warn('Twilio not configured, simulating SMS send');
      
      // For development/testing - log the SMS instead of sending
      console.log('📱 SMS would be sent:', {
        to,
        from: from || TWILIO_PHONE_NUMBER,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'SMS sent successfully (simulated)',
        simulated: true
      });
    }

    // Send SMS
    const recipients = Array.isArray(to) ? to : [to];
    const results = [];

    for (const recipient of recipients) {
      try {
        const smsResult = await twilioClient.messages.create({
          body: message,
          from: from || TWILIO_PHONE_NUMBER,
          to: recipient
        });
        
        results.push({
          to: recipient,
          success: true,
          messageId: smsResult.sid,
          status: smsResult.status
        });
        
        console.log('📱 SMS sent successfully:', {
          to: recipient,
          messageId: smsResult.sid,
          status: smsResult.status
        });
        
      } catch (error: any) {
        console.error(`❌ SMS failed for ${recipient}:`, error);
        results.push({
          to: recipient,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return res.status(200).json({ 
      success: failureCount === 0,
      message: `SMS sent to ${successCount} recipients${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      results
    });

  } catch (error: any) {
    console.error('❌ SMS sending failed:', error);
    
    return res.status(500).json({ 
      error: 'Failed to send SMS',
      details: error.message,
      code: error.code
    });
  }
}

// Helper function to send notification SMS
export async function sendNotificationSMS(
  to: string | string[],
  message: string,
  options?: {
    priority?: string;
    actionUrl?: string;
  }
): Promise<boolean> {
  try {
    // Format message for SMS (keep it short, add priority indicator)
    let formattedMessage = message;
    
    if (options?.priority === 'urgent') {
      formattedMessage = `🚨 URGENT: ${message}`;
    } else if (options?.priority === 'high') {
      formattedMessage = `⚠️ HIGH: ${message}`;
    }
    
    // Add action URL if provided (shortened)
    if (options?.actionUrl) {
      const shortUrl = options.actionUrl.length > 50 
        ? options.actionUrl.substring(0, 47) + '...' 
        : options.actionUrl;
      formattedMessage += ` View: ${shortUrl}`;
    }

    // Keep SMS under 160 characters for single message
    if (formattedMessage.length > 160) {
      formattedMessage = formattedMessage.substring(0, 157) + '...';
    }

    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        message: formattedMessage,
        from: TWILIO_PHONE_NUMBER
      })
    });

    if (!response.ok) {
      throw new Error(`SMS API responded with status ${response.status}`);
    }

    const result = await response.json();
    return result.success;

  } catch (error) {
    console.error('Failed to send notification SMS:', error);
    return false;
  }
}

// Helper function to format phone number
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present (assuming US numbers)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  } else if (cleaned.length > 10 && !cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return phone; // Return as-is if already formatted
}

// Helper function to validate phone number
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}
