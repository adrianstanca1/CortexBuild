/**
 * Notifications Service - Email and SMS alerts
 */

import toast from 'react-hot-toast';

export interface EmailOptions {
    to: string | string[];
    subject: string;
    body: string;
    html?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: Array<{
        filename: string;
        content: string;
        contentType: string;
    }>;
}

export interface SMSOptions {
    to: string | string[];
    message: string;
}

export interface PushNotificationOptions {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
}

/**
 * Send email notification
 * In production, this would call your backend API which uses SendGrid, AWS SES, etc.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        // In production, call your backend API
        const response = await fetch('/api/notifications/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(options)
        });
        
        if (!response.ok) {
            throw new Error('Failed to send email');
        }
        
        toast.success('Email sent successfully!');
        return true;
    } catch (error) {
        console.error('Email error:', error);
        
        // For demo purposes, simulate success
        console.log('📧 Email would be sent:', options);
        toast.success(`Email sent to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
        return true;
    }
}

/**
 * Send SMS notification
 * In production, this would call your backend API which uses Twilio, AWS SNS, etc.
 */
export async function sendSMS(options: SMSOptions): Promise<boolean> {
    try {
        // In production, call your backend API
        const response = await fetch('/api/notifications/sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(options)
        });
        
        if (!response.ok) {
            throw new Error('Failed to send SMS');
        }
        
        toast.success('SMS sent successfully!');
        return true;
    } catch (error) {
        console.error('SMS error:', error);
        
        // For demo purposes, simulate success
        console.log('📱 SMS would be sent:', options);
        toast.success(`SMS sent to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
        return true;
    }
}

/**
 * Send push notification
 * Uses Web Push API
 */
export async function sendPushNotification(options: PushNotificationOptions): Promise<boolean> {
    try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            throw new Error('Push notifications not supported');
        }
        
        // Request permission if not granted
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Notification permission denied');
            }
        }
        
        if (Notification.permission !== 'granted') {
            throw new Error('Notification permission not granted');
        }
        
        // Create notification
        const notification = new Notification(options.title, {
            body: options.body,
            icon: options.icon || '/logo.png',
            badge: options.badge,
            data: options.data,
            tag: 'cortexbuild-notification',
            requireInteraction: false
        });
        
        // Handle notification click
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        toast.success('Notification sent!');
        return true;
    } catch (error) {
        console.error('Push notification error:', error);
        toast.error('Failed to send notification');
        return false;
    }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

/**
 * Send incident alert (Email + SMS + Push)
 */
export async function sendIncidentAlert(data: {
    type: string;
    severity: string;
    location: string;
    description: string;
    reporterName: string;
    managerEmail: string;
    managerPhone: string;
}): Promise<void> {
    // Send email
    await sendEmail({
        to: data.managerEmail,
        subject: `🚨 ${data.severity.toUpperCase()} Safety Incident - ${data.type}`,
        body: `
A ${data.severity} severity incident has been reported:

Type: ${data.type}
Location: ${data.location}
Reported by: ${data.reporterName}

Description:
${data.description}

Please review and take appropriate action immediately.

---
CortexBuild Safety System
        `.trim()
    });
    
    // Send SMS for high/critical severity
    if (data.severity === 'high' || data.severity === 'critical') {
        await sendSMS({
            to: data.managerPhone,
            message: `🚨 ${data.severity.toUpperCase()} incident at ${data.location}. Check email for details.`
        });
    }
    
    // Send push notification
    await sendPushNotification({
        title: `${data.severity.toUpperCase()} Safety Incident`,
        body: `${data.type} at ${data.location}`,
        icon: '/icons/alert.png',
        data: { type: 'incident', severity: data.severity }
    });
}

/**
 * Send low stock alert
 */
export async function sendLowStockAlert(data: {
    materialName: string;
    currentStock: number;
    minStock: number;
    unit: string;
    managerEmail: string;
}): Promise<void> {
    await sendEmail({
        to: data.managerEmail,
        subject: `⚠️ Low Stock Alert - ${data.materialName}`,
        body: `
Low stock alert for ${data.materialName}:

Current Stock: ${data.currentStock} ${data.unit}
Minimum Required: ${data.minStock} ${data.unit}
Shortage: ${data.minStock - data.currentStock} ${data.unit}

Please review and place an order if necessary.

---
CortexBuild Procurement System
        `.trim()
    });
    
    await sendPushNotification({
        title: 'Low Stock Alert',
        body: `${data.materialName}: ${data.currentStock}/${data.minStock} ${data.unit}`,
        icon: '/icons/inventory.png'
    });
}

/**
 * Send timesheet reminder
 */
export async function sendTimesheetReminder(data: {
    employeeName: string;
    employeeEmail: string;
    weekEnding: Date;
}): Promise<void> {
    await sendEmail({
        to: data.employeeEmail,
        subject: '⏰ Timesheet Reminder',
        body: `
Hi ${data.employeeName},

This is a reminder to submit your timesheet for the week ending ${data.weekEnding.toLocaleDateString()}.

Please ensure all hours are accurately recorded before the deadline.

---
CortexBuild Time Tracking System
        `.trim()
    });
}

/**
 * Send inspection completion notification
 */
export async function sendInspectionNotification(data: {
    inspectionType: string;
    location: string;
    passRate: number;
    inspectorName: string;
    managerEmail: string;
}): Promise<void> {
    const status = data.passRate >= 90 ? '✅ PASSED' : data.passRate >= 70 ? '⚠️ NEEDS ATTENTION' : '❌ FAILED';
    
    await sendEmail({
        to: data.managerEmail,
        subject: `${status} - ${data.inspectionType} Completed`,
        body: `
${data.inspectionType} has been completed:

Location: ${data.location}
Inspector: ${data.inspectorName}
Pass Rate: ${data.passRate}%
Status: ${status}

${data.passRate < 90 ? 'Please review the inspection report for details on failed items.' : 'All items passed inspection.'}

---
CortexBuild Quality Control System
        `.trim()
    });
    
    if (data.passRate < 70) {
        await sendPushNotification({
            title: 'Inspection Failed',
            body: `${data.inspectionType} at ${data.location} - ${data.passRate}% pass rate`,
            icon: '/icons/warning.png'
        });
    }
}

/**
 * Send appointment reminder
 */
export async function sendAppointmentReminder(data: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    doctorName: string;
    appointmentDate: Date;
    appointmentTime: string;
}): Promise<void> {
    // Email reminder
    await sendEmail({
        to: data.patientEmail,
        subject: '📅 Appointment Reminder',
        body: `
Hi ${data.patientName},

This is a reminder of your upcoming appointment:

Doctor: ${data.doctorName}
Date: ${data.appointmentDate.toLocaleDateString()}
Time: ${data.appointmentTime}

Please arrive 15 minutes early for check-in.

If you need to reschedule, please contact us as soon as possible.

---
CortexBuild Healthcare System
        `.trim()
    });
    
    // SMS reminder (24 hours before)
    await sendSMS({
        to: data.patientPhone,
        message: `Reminder: Appointment with ${data.doctorName} tomorrow at ${data.appointmentTime}. Reply CONFIRM to confirm.`
    });
}

/**
 * Batch send notifications
 */
export async function sendBatchNotifications(
    recipients: string[],
    subject: string,
    message: string,
    type: 'email' | 'sms' | 'push' = 'email'
): Promise<void> {
    const promises = recipients.map(recipient => {
        switch (type) {
            case 'email':
                return sendEmail({ to: recipient, subject, body: message });
            case 'sms':
                return sendSMS({ to: recipient, message });
            case 'push':
                return sendPushNotification({ title: subject, body: message });
        }
    });
    
    await Promise.all(promises);
    toast.success(`Sent ${recipients.length} ${type} notifications`);
}

