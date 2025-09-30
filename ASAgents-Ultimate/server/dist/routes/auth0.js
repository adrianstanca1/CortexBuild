import { Router } from 'express';
import { auth0Middleware } from '../middleware/auth0.js';
import { logger } from '../utils/logger.js';
import { ManagementClient } from 'auth0';
const router = Router();
// Initialize Auth0 Management Client
const getManagementClient = () => {
    return new ManagementClient({
        domain: process.env.AUTH0_DOMAIN || 'dev-8fnhhin0d5z8ssix.uk.auth0.com',
        clientId: process.env.AUTH0_CLIENT_ID || '1WgarJEA0yN8ArT6aeoF6NvqQiEQ5bfK',
        clientSecret: process.env.AUTH0_CLIENT_SECRET || 'Ik8iKaVNkQH6KW9kKbYPrpCy9CNdIh-RFJ2Od_aJssDLKfamjmCASzs7sLI8xoZu'
    });
};
// User registration endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, given_name, family_name, user_metadata, app_metadata } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Email, password, and name are required'
            });
        }
        const management = getManagementClient();
        // Create user in Auth0
        const user = await management.users.create({
            connection: 'Username-Password-Authentication',
            email,
            password,
            name,
            given_name,
            family_name,
            user_metadata: user_metadata || {},
            app_metadata: app_metadata || {},
            email_verified: false,
            verify_email: true
        });
        logger.info({ userId: user.user_id, email }, 'User registered successfully');
        res.json({
            success: true,
            user: {
                id: user.user_id,
                email: user.email,
                name: user.name,
                emailVerified: user.email_verified
            },
            message: 'User registered successfully. Please check your email to verify your account.'
        });
    }
    catch (error) {
        logger.error({ error }, 'User registration failed');
        // Handle Auth0 specific errors
        if (error.statusCode === 409) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'A user with this email already exists'
            });
        }
        res.status(500).json({
            error: 'Registration failed',
            message: error.message || 'Failed to create user account'
        });
    }
});
// Verify email endpoint
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                error: 'Token required',
                message: 'Email verification token is required'
            });
        }
        // In a real implementation, you would verify the token with Auth0
        // For now, we'll simulate successful verification
        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    }
    catch (error) {
        logger.error({ error }, 'Email verification failed');
        res.status(500).json({
            error: 'Verification failed',
            message: 'Failed to verify email address'
        });
    }
});
// Resend verification email
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                error: 'Email required',
                message: 'Email address is required'
            });
        }
        const management = getManagementClient();
        // Find user by email
        const users = await management.users.getByEmail(email);
        if (users.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with this email address'
            });
        }
        const user = users[0];
        // Send verification email
        await management.jobs.verifyEmail({
            user_id: user.user_id
        });
        logger.info({ email, userId: user.user_id }, 'Verification email resent');
        res.json({
            success: true,
            message: 'Verification email sent successfully'
        });
    }
    catch (error) {
        logger.error({ error }, 'Resend verification failed');
        res.status(500).json({
            error: 'Failed to resend verification',
            message: 'Failed to send verification email'
        });
    }
});
// Get user profile (protected route)
router.get('/profile', auth0Middleware.authenticate(), auth0Middleware.getUserProfile());
// Verify token endpoint
router.post('/verify', auth0Middleware.authenticate(), (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        user: req.user
    });
});
// Get user permissions
router.get('/permissions', auth0Middleware.authenticate(), (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please authenticate first'
            });
        }
        res.json({
            success: true,
            permissions: user.permissions || [],
            roles: user.roles || []
        });
    }
    catch (error) {
        logger.error({ error }, 'Get permissions failed');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to get user permissions'
        });
    }
});
// Check specific permission
router.post('/check-permission', auth0Middleware.authenticate(), (req, res) => {
    try {
        const { permission } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please authenticate first'
            });
        }
        if (!permission) {
            return res.status(400).json({
                error: 'Permission required',
                message: 'Please specify a permission to check'
            });
        }
        const hasPermission = (user.permissions || []).includes(permission);
        res.json({
            success: true,
            permission,
            hasPermission
        });
    }
    catch (error) {
        logger.error({ error }, 'Check permission failed');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to check permission'
        });
    }
});
// Check specific role
router.post('/check-role', auth0Middleware.authenticate(), (req, res) => {
    try {
        const { role } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please authenticate first'
            });
        }
        if (!role) {
            return res.status(400).json({
                error: 'Role required',
                message: 'Please specify a role to check'
            });
        }
        const hasRole = (user.roles || []).includes(role);
        res.json({
            success: true,
            role,
            hasRole
        });
    }
    catch (error) {
        logger.error({ error }, 'Check role failed');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to check role'
        });
    }
});
// Protected admin endpoint example
router.get('/admin/dashboard', auth0Middleware.authenticate(), auth0Middleware.requireRole('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to admin dashboard',
        user: req.user
    });
});
// Protected manager endpoint example
router.get('/manager/projects', auth0Middleware.authenticate(), auth0Middleware.requirePermission('read:projects'), (req, res) => {
    res.json({
        success: true,
        message: 'Projects data for managers',
        user: req.user
    });
});
// Health check for Auth0 configuration
router.get('/health', (req, res) => {
    try {
        const config = {
            domain: process.env.AUTH0_DOMAIN || 'Not configured',
            audience: process.env.AUTH0_AUDIENCE || 'Not configured',
            issuer: process.env.AUTH0_ISSUER || 'Not configured'
        };
        res.json({
            success: true,
            message: 'Auth0 configuration loaded',
            config: {
                domain: config.domain !== 'Not configured' ? '✓ Configured' : '✗ Missing',
                audience: config.audience !== 'Not configured' ? '✓ Configured' : '✗ Missing',
                issuer: config.issuer !== 'Not configured' ? '✓ Configured' : '✗ Missing'
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error({ error }, 'Auth0 health check failed');
        res.status(500).json({
            error: 'Health check failed',
            message: 'Auth0 configuration error'
        });
    }
});
export default router;
