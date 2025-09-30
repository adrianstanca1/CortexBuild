import { Router } from 'express';
import { realTimeService } from '../services/realTimeService.js';
const router = Router();
// Test endpoint to broadcast real-time events
router.post('/broadcast', async (req, res) => {
    try {
        const event = req.body;
        // Validate required fields
        if (!event.type || !event.entityType || !event.tenantId) {
            return res.status(400).json({
                message: 'Missing required fields: type, entityType, tenantId'
            });
        }
        // Add timestamp if not provided
        if (!event.timestamp) {
            event.timestamp = new Date().toISOString();
        }
        // Broadcast the event
        realTimeService.broadcastEvent(event);
        res.json({
            message: 'Event broadcasted successfully',
            event: {
                type: event.type,
                entityType: event.entityType,
                entityId: event.entityId,
                tenantId: event.tenantId,
                timestamp: event.timestamp
            }
        });
    }
    catch (error) {
        console.error('Error broadcasting event:', error);
        res.status(500).json({
            message: 'Failed to broadcast event',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Test endpoint to get connected clients info
router.get('/clients', (req, res) => {
    try {
        const clientsInfo = realTimeService.getClientsInfo();
        res.json(clientsInfo);
    }
    catch (error) {
        console.error('Error getting clients info:', error);
        res.status(500).json({
            message: 'Failed to get clients info',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export default router;
