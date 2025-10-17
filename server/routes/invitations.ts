/**
 * Invitations API Routes
 */

import express from 'express';
import Database from 'better-sqlite3';
import { verifyToken } from '../auth';
import * as invitations from '../services/invitations';

export function createInvitationsRouter(db: Database.Database) {
  const router = express.Router();

  // POST /api/invitations - Create invitation
  router.post('/', verifyToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const { email, companyId, role } = req.body;

      // Check if user has permission (admin only)
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({
          success: false,
          error: 'Only admins can send invitations'
        });
      }

      // Check if user is from the same company (unless super_admin)
      if (user.role !== 'super_admin' && user.company_id !== companyId) {
        return res.status(403).json({
          success: false,
          error: 'Cannot invite users to other companies'
        });
      }

      const result = invitations.createInvitation(db, {
        email,
        companyId,
        role,
        invitedBy: user.id
      });

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/invitations/company/:companyId - Get company invitations
  router.get('/company/:companyId', verifyToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const { companyId } = req.params;

      // Check permission
      if (user.role !== 'super_admin' && user.company_id !== companyId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const result = invitations.getCompanyInvitations(db, companyId, {
        includeExpired: req.query.includeExpired === 'true',
        includeAccepted: req.query.includeAccepted === 'true'
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/invitations/verify/:token - Verify invitation token
  router.get('/verify/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const result = invitations.getInvitationByToken(db, token);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/invitations/accept - Accept invitation
  router.post('/accept', async (req, res) => {
    try {
      const { token, name, password } = req.body;

      if (!token || !name || !password) {
        return res.status(400).json({
          success: false,
          error: 'Token, name, and password are required'
        });
      }

      const result = invitations.acceptInvitation(db, token, { name, password });

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/invitations/:id/resend - Resend invitation
  router.post('/:id/resend', verifyToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const result = invitations.resendInvitation(db, id, user.id);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE /api/invitations/:id - Cancel invitation
  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const result = invitations.cancelInvitation(db, id, user.id);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
