/**
 * Invitations Service
 * Handles user invitations to companies
 */

import Database from 'better-sqlite3';
import crypto from 'crypto';
import { sendEmail } from './notifications';

export interface Invitation {
  id: string;
  email: string;
  companyId: string;
  role: string;
  invitedBy: string;
  token: string;
  accepted: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface CreateInvitationParams {
  email: string;
  companyId: string;
  role: 'company_admin' | 'project_manager' | 'supervisor' | 'developer' | 'viewer';
  invitedBy: string;
  expiresInHours?: number;
}

/**
 * Generate secure invitation token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate invitation ID
 */
function generateId(): string {
  return `inv-${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Create invitation
 */
export function createInvitation(
  db: Database.Database,
  params: CreateInvitationParams
): { success: boolean; invitation?: Invitation; error?: string } {
  try {
    const { email, companyId, role, invitedBy, expiresInHours = 72 } = params;

    // Check if user already exists
    const existingUser = db
      .prepare('SELECT id, email, company_id FROM users WHERE email = ?')
      .get(email) as any;

    if (existingUser) {
      if (existingUser.company_id === companyId) {
        return {
          success: false,
          error: 'User already belongs to this company'
        };
      }
      return {
        success: false,
        error: 'User already exists in another company'
      };
    }

    // Check if invitation already exists and is not expired
    const existingInvite = db
      .prepare(`
        SELECT * FROM invitations
        WHERE email = ? AND company_id = ? AND accepted = 0 AND expires_at > datetime('now')
      `)
      .get(email, companyId) as any;

    if (existingInvite) {
      return {
        success: false,
        error: 'Active invitation already exists for this email'
      };
    }

    // Get company name for email
    const company = db
      .prepare('SELECT name FROM companies WHERE id = ?')
      .get(companyId) as any;

    if (!company) {
      return {
        success: false,
        error: 'Company not found'
      };
    }

    // Get inviter name for email
    const inviter = db
      .prepare('SELECT name FROM users WHERE id = ?')
      .get(invitedBy) as any;

    const id = generateId();
    const token = generateToken();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    // Insert invitation
    const stmt = db.prepare(`
      INSERT INTO invitations (id, email, company_id, role, invited_by, token, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, email, companyId, role, invitedBy, token, expiresAt.toISOString());

    // Log audit
    db.prepare(`
      INSERT INTO tenant_audit_log (company_id, user_id, action, resource_type, resource_id, metadata)
      VALUES (?, ?, 'invite_sent', 'invitation', ?, ?)
    `).run(
      companyId,
      invitedBy,
      id,
      JSON.stringify({ email, role })
    );

    const invitation: Invitation = {
      id,
      email,
      companyId,
      role,
      invitedBy,
      token,
      accepted: false,
      expiresAt,
      createdAt: new Date()
    };

    // Send invitation email
    const inviteUrl = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/invite/accept?token=${token}`;

    sendEmail({
      to: email,
      subject: `You're invited to join ${company.name} on CortexBuild`,
      body: `
Hi there,

${inviter?.name || 'Someone'} has invited you to join ${company.name} on CortexBuild as a ${role.replace('_', ' ')}.

Click the link below to accept the invitation:
${inviteUrl}

This invitation will expire in ${expiresInHours} hours.

If you have any questions, please contact ${inviter?.name || 'the person who invited you'}.

Best regards,
The CortexBuild Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You're invited! 🎉</h2>
          <p>${inviter?.name || 'Someone'} has invited you to join <strong>${company.name}</strong> on CortexBuild.</p>
          <p>Role: <strong>${role.replace('_', ' ')}</strong></p>
          <div style="margin: 30px 0;">
            <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This invitation will expire in ${expiresInHours} hours.</p>
          <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link: ${inviteUrl}</p>
        </div>
      `
    });

    return {
      success: true,
      invitation
    };
  } catch (error: any) {
    console.error('Create invitation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get invitation by token
 */
export function getInvitationByToken(
  db: Database.Database,
  token: string
): { success: boolean; invitation?: any; error?: string } {
  try {
    const invitation = db
      .prepare(`
        SELECT i.*, c.name as company_name, u.name as inviter_name
        FROM invitations i
        JOIN companies c ON i.company_id = c.id
        JOIN users u ON i.invited_by = u.id
        WHERE i.token = ?
      `)
      .get(token) as any;

    if (!invitation) {
      return {
        success: false,
        error: 'Invitation not found'
      };
    }

    if (invitation.accepted) {
      return {
        success: false,
        error: 'Invitation already accepted'
      };
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return {
        success: false,
        error: 'Invitation has expired'
      };
    }

    return {
      success: true,
      invitation
    };
  } catch (error: any) {
    console.error('Get invitation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Accept invitation and create user
 */
export function acceptInvitation(
  db: Database.Database,
  token: string,
  userData: {
    name: string;
    password: string;
  }
): { success: boolean; user?: any; error?: string } {
  try {
    const inviteResult = getInvitationByToken(db, token);

    if (!inviteResult.success || !inviteResult.invitation) {
      return {
        success: false,
        error: inviteResult.error
      };
    }

    const invitation = inviteResult.invitation;

    // Use transaction for atomicity
    const transaction = db.transaction(() => {
      // Create user (using auth service)
      const bcrypt = require('bcryptjs');
      const userId = `user-${crypto.randomBytes(8).toString('hex')}`;
      const passwordHash = bcrypt.hashSync(userData.password, 10);

      db.prepare(`
        INSERT INTO users (id, email, password_hash, name, role, company_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        invitation.email,
        passwordHash,
        userData.name,
        invitation.role,
        invitation.company_id
      );

      // Mark invitation as accepted
      db.prepare(`
        UPDATE invitations
        SET accepted = 1
        WHERE token = ?
      `).run(token);

      // Log audit
      db.prepare(`
        INSERT INTO tenant_audit_log (company_id, user_id, action, resource_type, resource_id, metadata)
        VALUES (?, ?, 'user_added_via_invitation', 'user', ?, ?)
      `).run(
        invitation.company_id,
        userId,
        userId,
        JSON.stringify({ invitation_id: invitation.id, role: invitation.role })
      );

      // Get user with company info
      const user = db.prepare(`
        SELECT u.id, u.email, u.name, u.role, u.company_id, c.name as company_name
        FROM users u
        JOIN companies c ON u.company_id = c.id
        WHERE u.id = ?
      `).get(userId);

      return user;
    });

    const user = transaction();

    // Send welcome email
    sendEmail({
      to: invitation.email,
      subject: `Welcome to ${invitation.company_name}!`,
      body: `
Hi ${userData.name},

Welcome to ${invitation.company_name} on CortexBuild!

Your account has been created and you can now login at:
${process.env.VITE_APP_URL || 'http://localhost:3000'}/login

If you need any help getting started, check out our documentation or contact your team admin.

Best regards,
The CortexBuild Team
      `
    });

    return {
      success: true,
      user
    };
  } catch (error: any) {
    console.error('Accept invitation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get company invitations
 */
export function getCompanyInvitations(
  db: Database.Database,
  companyId: string,
  options: { includeExpired?: boolean; includeAccepted?: boolean } = {}
): { success: boolean; invitations?: any[]; error?: string } {
  try {
    const { includeExpired = false, includeAccepted = false } = options;

    let whereClause = 'WHERE i.company_id = ?';
    if (!includeExpired) {
      whereClause += ` AND i.expires_at > datetime('now')`;
    }
    if (!includeAccepted) {
      whereClause += ` AND i.accepted = 0`;
    }

    const invitations = db
      .prepare(`
        SELECT
          i.*,
          u.name as inviter_name,
          u.email as inviter_email
        FROM invitations i
        JOIN users u ON i.invited_by = u.id
        ${whereClause}
        ORDER BY i.created_at DESC
      `)
      .all(companyId);

    return {
      success: true,
      invitations: invitations as any[]
    };
  } catch (error: any) {
    console.error('Get company invitations error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Resend invitation
 */
export function resendInvitation(
  db: Database.Database,
  invitationId: string,
  userId: string
): { success: boolean; error?: string } {
  try {
    const invitation = db
      .prepare('SELECT * FROM invitations WHERE id = ?')
      .get(invitationId) as any;

    if (!invitation) {
      return {
        success: false,
        error: 'Invitation not found'
      };
    }

    if (invitation.accepted) {
      return {
        success: false,
        error: 'Invitation already accepted'
      };
    }

    // Extend expiration
    const newExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    db.prepare(`
      UPDATE invitations
      SET expires_at = ?
      WHERE id = ?
    `).run(newExpiresAt.toISOString(), invitationId);

    // Get company and inviter info
    const company = db
      .prepare('SELECT name FROM companies WHERE id = ?')
      .get(invitation.company_id) as any;

    const inviter = db
      .prepare('SELECT name FROM users WHERE id = ?')
      .get(userId) as any;

    // Resend email
    const inviteUrl = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/invite/accept?token=${invitation.token}`;

    sendEmail({
      to: invitation.email,
      subject: `Reminder: Join ${company.name} on CortexBuild`,
      body: `
Hi,

${inviter.name} has resent your invitation to join ${company.name} on CortexBuild.

Click the link below to accept:
${inviteUrl}

This invitation will expire in 72 hours.

Best regards,
The CortexBuild Team
      `
    });

    return {
      success: true
    };
  } catch (error: any) {
    console.error('Resend invitation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancel invitation
 */
export function cancelInvitation(
  db: Database.Database,
  invitationId: string,
  userId: string
): { success: boolean; error?: string } {
  try {
    const invitation = db
      .prepare('SELECT * FROM invitations WHERE id = ?')
      .get(invitationId) as any;

    if (!invitation) {
      return {
        success: false,
        error: 'Invitation not found'
      };
    }

    // Delete invitation
    db.prepare('DELETE FROM invitations WHERE id = ?').run(invitationId);

    // Log audit
    db.prepare(`
      INSERT INTO tenant_audit_log (company_id, user_id, action, resource_type, resource_id, metadata)
      VALUES (?, ?, 'invite_canceled', 'invitation', ?, ?)
    `).run(
      invitation.company_id,
      userId,
      invitationId,
      JSON.stringify({ email: invitation.email })
    );

    return {
      success: true
    };
  } catch (error: any) {
    console.error('Cancel invitation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
